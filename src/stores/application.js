import { defineStore } from 'pinia'
import fieldTypes from '../helpers/fieldTypes';
import commonMixin from '../helpers/commonMixin'
import reCaptcha from '../helpers/reCaptcha'
import axios from 'axios'
import constants from '../helpers/constants'
import steps from '../helpers/steps'

export const useApplicationStore = defineStore({
  id: 'application',
  state: () => ({
    guid: null,
    initQuery: false,
    fields: fieldTypes.fields,
    data: null,
    lookup: null,
    errors: [],
    initialLoad: false,
    processing: false,
    history: false,
    steps: steps,
    activeIndex: 0,
    loading: false,
    error: null
  }),
  getters: {
    // getPostsPerAuthor: (state) => {
    //   return (authorId) => state.posts.filter((post) => post.userId === authorId)
    // }
    getFields: (state) => {
      return state.fields
    },
    getFieldsValues: (state) => {
      const stateObject = state.fields;
      let stateArray = [];
      for (const key in stateObject) {
        stateArray.push({ name: key, value: stateObject[key].value });
      }
      let transformedArray = stateArray.reduce((result, item) => {
        result[item.name] = item.value;
        return result;
      }, {});
      return transformedArray
    },
    getGuid: (state) => { return state.guid },
  },
  actions: {
    // async fetchPosts() {
    //   this.posts = []
    //   this.loading = true
    //   try {
    //     this.posts = await fetch('https://jsonplaceholder.typicode.com/posts')
    //       .then((response) => response.json())
    //   } catch (error) {
    //     this.error = error
    //   } finally {
    //     this.loading = false
    //   }
    // },
    // async fetchPost(id) {
    //   this.post = null
    //   this.loading = true
    //   try {
    //     this.post = await fetch(`https://jsonplaceholder.typicode.com/posts/${id}`)
    //       .then((response) => response.json())
    //   } catch (error) {
    //     this.error = error
    //   } finally {
    //     this.loading = false
    //   }
    // },
    async parseQuery(router, route) {
      await router.isReady()
      //once its ready we can access the query params
      if (commonMixin.isObjectNonEmpty(route.query)) {
        const query = route.query
        this.initQuery = query
        commonMixin.setSessionStorage(query, 'referrer')
        this.setFields({ [constants.FIELD_NAMES.QUERY_STRING]: route.fullPath })
        this.setFields({ [constants.FIELD_NAMES.ORIGIN_WEBPAGE]: commonMixin.getAnyCase(query, 'OriginWebpage', 'Empty') })
      }

      if (route.query.guid) {
        this.guid = route.query.guid
      }
    },
    async getLookup() {
      console.log('getlookup..')
      let url = import.meta.env.VITE_BASE_URL
      if (this.fields.Query_String.value.toLowerCase().indexOf('interportalname') > -1) {
        url += constants.URLS.INIT
      } else {
        url += constants.URLS.INIT_BROKER_PORTAL
      }
      const lookupResponse = axios.get(url).then(({ data }) => {
        if (data.Data.HomeLoan_Interest_Rate) {
          let rates = data.Data.HomeLoan_Interest_Rate.filter(
            (r) => r.IsDropdown &&
              !r.AdditionalInformation.toLowerCase().includes('revolving')
          );
          let rvcRate = data.Data.HomeLoan_Interest_Rate.find(
            (r) =>
              !r.IsDropdown &&
              r.AdditionalInformation.toLowerCase().includes('revolving')
          );
          this.lookup = data.Data
          const ratesOptions = rates.map((r) => {
            return { name: r.Name, value: r.Value + (r.Name.indexOf('floating') > -1 ? '---floating' : ''), id: r.Id }
          })
          const defaultRate = rates[0].Value + (rates[0].Name.indexOf('floating') > -1 ? '---floating' : '')
          this.setFields({ ['Has_RVC']: rvcRate ? rvcRate.Value : null }, 'rate')
          this.setFields({ ['Loan_Interest_Rate']: ratesOptions }, 'options')
          this.setFields({ ['Loan_Interest_Rate']: defaultRate }, 'default')
          this.setFields({ ['Loan_Interest_Rate']: defaultRate })
          this.setFields({ ['InterestRateId']: rates[0].Id })
        }
      })
      .catch((response) => {
          this.errors = response.data && response.data.Errors ? response.data.Errors : null
          this.showErrors()
      })
    },
    async loadToken(params) {
      console.log('loadToken')
      let setGuid = params && params.setGuid;
      let $this = this;

      if (this.guid) return

      // seems to work without recaptcha token
      // const loadTokenFunction = function (recaptchaToken) {
      axios
        // .post(import.meta.env.VITE_BASE_URL + constants.URLS.HOMELOAN, { RecaptchaToken: recaptchaToken })
        .post(import.meta.env.VITE_BASE_URL + constants.URLS.HOMELOAN, {})
        .then(({ data }) => {
          if (setGuid && data.Data.Guid) {
            $this.guid = data.Data.Guid
            $this.setFields({ ['Guid']: data.Data.Guid })
          }
        })
        .catch((response) => {
          console.log(response, response.data)
          $this.errors = response.data.Errors
          $this.showErrors()
        });
      // };
      // reCaptcha.executeWithRecaptcha('HomeLoansCreateApp', loadTokenFunction);
    },
    runInitialLoad() {
      this.initialLoad = true
      if (this.initQuery) {
        this.parseInitQuery()
      }
    },
    parseInitQuery() {
      Object.entries(this.initQuery).forEach(([key, val]) => {
        let isFloating;

        if (key === 'Loan_Term') val = parseInt(val, 10);
        if (key === 'Loan_Interest_Rate') {
          isFloating = val.indexOf('---floating') > -1;
          val = parseFloat(val);
          let options = this.fields['Loan_Interest_Rate'].options;
          let rate = options.find((o) => {
            if (isFloating) {
              return o.value.indexOf(val + '') > -1 && o.name.indexOf('floating') > -1
            } else {
              return o.value == val && o.name.indexOf('floating') < 0
            }
          }
          );
          if (rate) {
            this.setFields({ ['InterestRateId']: rate.id })
          }
        }

        let $val = isFloating ? val + '---floating' : val;

        if (key !== 'guid') {
          this.setFields({ [key]: $val })
        }
      });
    },
    showErrors() {
      this.hasError = false
      this.errors?.forEach((e) => {
        console.log(e.message)
        // TODO: doToast(e.Message, 'is-danger');
      });
      setTimeout(() => { this.hasError = true }, 5000)
    },
    setData(data) {
      this.data = data;
      setFieldsValues(data.Data);
    },
    setFields(inputFields, extraKey = null) {
      console.log(1, 'setFields from application store', inputFields)
      Object.entries(inputFields).forEach(([key, value]) => {
        if (typeof this.fields[key] !== 'undefined') {
          if (extraKey) {
            this.fields[key][extraKey] = value
          } else {
            this.fields[key].value = value;
          }
        }
      });
    },
    setFieldsValues(dataFields) {
      Object.entries(this.fields).forEach(([key, field]) => {
        if (typeof dataFields[key] !== 'undefined') {
          field.value = dataFields[key] !== null ? dataFields[key] : field.value;
        }
        //   if (key === 'Expense_Additional_Living_costs') {
        //     // Need to remove field current-rent-home-loan from UI
        //     field = cleanManuallyAddedData(field)
        //   }
      });
    },

    repaymentsCalculator(init) {
      // commit('clearSaveDelay');
      // commit('setLoanAmount');
      console.log('rep', init)
      let rate_is_string = typeof this.fields.Loan_Interest_Rate.value === 'string';
      if (
        this.guid &&
        this.fields.Loan_Amount.value &&
        this.fields.Loan_Interest_Rate.value &&
        this.fields.Loan_Term.value
      ) {
        axios
          .post('/homeloan/repaymentscalculator', {
            LoanAmount: this.fields.Loan_Amount.value,
            TermLoanAmount: this.fields.Term_Loan_Amount.value,
            AnnualInterestRate: rate_is_string && this.fields.Loan_Interest_Rate.value.indexOf('---') > -1 
              ? this.fields.Loan_Interest_Rate.value.substr(0, state.fields.Loan_Interest_Rate.value.indexOf('---')) 
              : this.fields.Loan_Interest_Rate.value,
            LoanPeriodInYears: this.fields.Loan_Term.value,
            PurchasePrice: this.fields.Purchase_Price.value,
            EstimatedHomeValue: this.fields.Estimated_Home_Value.value,
            LoanPurpose: this.fields.Loan_Purpose.value,
            DesiredRVC: this.fields.Has_RVC.value
              ? this.fields.Desired_RVC_Limit.value
              : null,
            RequiredRVC: this.fields.Has_Required_RVC_Limit.value
              ? this.fields.Required_RVC_Limit.value
              : null,
            Required_RVC_Limit: this.fields.Has_Required_RVC_Limit.value
              ? this.fields.Required_RVC_Limit.value
              : null
          })
          .then(({ data }) => {
            // commit('setPaymentInfos', data.Data.PaymentInfos);
            // commit('setLvrPercentage', data.Data.LvrPercentage);
            // commit('clearSaveDelay');
            const monthlyRepayments = data.Data.PaymentInfos.find(
              (r) => r.PaymentType === 'Monthly'
            );
            if (monthlyRepayments) {
              this.setFields({ ['Monthly_Repayments']: monthlyRepayments.PaymentAmount })
            }

            const saveDelay = setTimeout(() => {
              this.saveFields(
               {
                Purchase_Price: this.fields.Purchase_Price.value,
                Deposit: this.fields.Deposit.value,
                Estimated_Home_Value: this.fields.Estimated_Home_Value.value,
                Mortgage_Balance: this.fields.Mortgage_Balance.value,
                Loan_topup: this.fields.Loan_topup.value,
                Loan_Amount: this.fields.Loan_Amount.value,
                Term_Loan_Amount: this.fields.Term_Loan_Amount.value,
                Loan_Interest_Rate: this.fields.Loan_Interest_Rate.value,
                Loan_Interest_Rate: rate_is_string && this.fields.Loan_Interest_Rate.value.indexOf('---') > -1 
                ? this.fields.Loan_Interest_Rate.value.substr(0, this.fields.Loan_Interest_Rate.value.indexOf('---')) 
                : this.fields.Loan_Interest_Rate.value,
                Repayments_Frequency: this.fields.Repayments_Frequency.value,
                InterestRateId: this.fields.InterestRateId.value,
                Loan_Term: this.fields.Loan_Term.value,
                Loan_Purpose: this.fields.Loan_Purpose.value,
                Accepted_Privacy_Declaration:
                this.fields.Accepted_Privacy_Declaration.value,
                Monthly_Repayments: this.fields.Monthly_Repayments.value,
                Has_RVC: this.fields.Has_RVC.value,
                Desired_RVC_Limit: this.fields.Has_RVC.value
                  ? Number(this.fields.Desired_RVC_Limit.value)
                  : null,
                Has_Required_RVC_Limit:
                this.fields.Has_Required_RVC_Limit.value,
                RequiredRVC: this.fields.Has_Required_RVC_Limit.value
                  ? Number(this.fields.Required_RVC_Limit.value)
                  : null,
                Required_RVC_Limit: this.fields.Has_Required_RVC_Limit.value
                  ? Number(this.fields.Required_RVC_Limit.value)
                  : null,
              });
            }, 2000);
            // commit('setSaveDelay', saveDelay);
          })
          .catch((error) => {
            // commit('setErrors', get(error, 'response.data.Errors'));
            // dispatch('showErrors');
          });
      } else if (!init) {
        console.log('here2')
        this.saveFields(
        {
          Purchase_Price: this.fields.Purchase_Price.value,
          Deposit: this.fields.Deposit.value,
          Estimated_Home_Value: this.fields.Estimated_Home_Value.value,
          Mortgage_Balance: this.fields.Mortgage_Balance.value,
          Loan_topup: this.fields.Loan_topup.value,
          Loan_Amount: this.fields.Loan_Amount.value,
          Term_Loan_Amount: this.fields.Term_Loan_Amount.value,
          Loan_Interest_Rate: this.fields.Loan_Interest_Rate.value,
          InterestRateId: this.fields.InterestRateId.value,
          Loan_Term: this.fields.Loan_Term.value,
          Loan_Purpose: this.fields.Loan_Purpose.value,
          Repayments_Frequency: this.fields.Repayments_Frequency.value,
          Accepted_Privacy_Declaration:
          this.fields.Accepted_Privacy_Declaration.value,
          Monthly_Repayments: this.fields.Monthly_Repayments.value
        });
      }
    },
    async saveFields(fieldsData) {
      console.log(fieldsData)
      let $this = this;
      let fieldsToSave = this.getFields;
      let valuesToSave = this.getFieldsValues;
      if (fieldsData) {
        fieldsToSave = fieldsData;
        valuesToSave = fieldsData;
      }
      if (!this.getGuid) await createApp();
      if (this.getGuid) {
        this.saveCombinedFields(fieldsToSave)
        axios
          .post(import.meta.env.VITE_BASE_URL + constants.URLS.HOMELOAN, {
            Guid: this.getGuid,
            ...valuesToSave,
          })
          .then(({ data }) => {
            // done(data);
          })
          .catch((error) => {
            // done(error);
            console.log(error)
            $this.errors.push(error)
            $this.showErrors()
          });
      }
    },

    async createApp({ newApp } = {}) {
      if (state.guid) return;
      var createAppFunction = function (recaptchaToken) {
        console.log('create app')
        axios
          .post('/homeloan', { RecaptchaToken: recaptchaToken })
          .then(({ data }) => {
            if (data.Data.Guid) {
              state.guid = data.Data.Guid
              state.data = data
              // commit('setGuid', data.Data.Guid);
              // commit('setData', data);
              // if (document.cookie.indexOf('newappcreated=true') > -1) {
              //   context.$router.push(`/calculator`);
              //   document.cookie = 'newappcreated=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
              // }
              // if (newApp === true) {
              //   document.cookie = 'newappcreated=true';
              //   location.reload();
              // }
            }
          })
          .catch((error) => {
            this.errors = response.data.Errors
            this.showErrors()
          });
      };
      executeWithRecaptcha('HomeLoansCreateApp', createAppFunction);
    },

    async saveCombinedFields(fields) {
      const field_to_update = 'Expense_Additional_Living_costs';
      const properties_to_combine = [
        'Current_Mortgage_Repayments_Amount',
        'Current_Mortgage_Repayments_Frequency',
        'Current_Rental_Amount',
        'Current_Rental_Frequency',
        'Expense_Additional_Living_costs'
      ]
      // var array_of_merged_data = [];
      //   if ( properties_to_combine.some(prop => fields.hasOwnProperty(prop))  ) {
      //   array_of_merged_data = getArrayFromJsonField(state.fields[field_to_update])
      //   if (array_of_merged_data. length > 0) {
      //     // If combined array already contains current-rent-home-loan , we need to wipe it out
      //     array_of_merged_data = array_of_merged_data.filter(el => el.Identifier !== 'current-rent-home-loan');
      //     // Then call function to get data for current-rent-home-loan from state and add it to combined data array
      //     array_of_merged_data = [...array_of_merged_data, getCurrentMortgageOrRentalPaymentData(state)].flat();
      //   }
      // }

      // if (array_of_merged_data.length > 0) {
      //   array_of_merged_data = cleanMergedArray(array_of_merged_data);  
      //   commit('setFields', { [field_to_update]: JSON.stringify(array_of_merged_data) });
      //   dispatch('saveFieldsPassCombined', { [field_to_update]: JSON.stringify(array_of_merged_data) });
      // }
      return true
    },
  }
})