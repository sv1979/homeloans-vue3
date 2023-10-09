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
    }
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
    async loadToken() {
      if (this.guid) return
      const loadTokenFunction = function (recaptchaToken) {
        axios
          .post(import.meta.env.VITE_BASE_URL + constants.URLS.HOMELOAN, { RecaptchaToken: recaptchaToken })
          .catch((response) => {
            this.errors = response.data.Errors
            this.showErrors()
          });
      };
      reCaptcha.executeWithRecaptcha('HomeLoansCreateApp', loadTokenFunction);
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
      console.log(1)
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
    }
  }
})