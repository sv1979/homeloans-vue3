import { defineStore } from 'pinia'
import fieldTypes from '../helpers/fieldTypes';
import commonMixin from '../helpers/commonMixin'
import axios from 'axios'
import constants from '../helpers/constants'

export const useApplicationStore = defineStore({
  id: 'application',
  state: () => ({
    guid: null,
    initQuery: false,
    fields: fieldTypes.fields,
    data: null,
    lookup: null,
    errors: [],
    posts: [],
    post: null,
    loading: false,
    error: null
  }),
  getters: {
    getPostsPerAuthor: (state) => {
      return (authorId) => state.posts.filter((post) => post.userId === authorId)
    }
  },
  actions: {
    async fetchPosts() {
      this.posts = []
      this.loading = true
      try {
        this.posts = await fetch('https://jsonplaceholder.typicode.com/posts')
          .then((response) => response.json())
      } catch (error) {
        this.error = error
      } finally {
        this.loading = false
      }
    },
    async fetchPost(id) {
      this.post = null
      this.loading = true
      try {
        this.post = await fetch(`https://jsonplaceholder.typicode.com/posts/${id}`)
          .then((response) => response.json())
      } catch (error) {
        this.error = error
      } finally {
        this.loading = false
      }
    },
    async parseQuery(router, route) {
      await router.isReady()
      //once its ready we can access the query params
      console.log(1, route, route.query)
      if (commonMixin.isObjectEmpty(route.query)) {

      } else {
        const query = route.query
        this.initQuery = query
        commonMixin.setSessionStorage(query, 'referrer')
        this.setFields({ [constants.FIELD_NAMES.QUERY_STRING]: route.fullPath })
        this.setFields({ [constants.FIELD_NAMES.ORIGIN_WEBPAGE]: commonMixin.getAnyCase(query, 'OriginWebpage', 'Empty') })
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
          this.setFields({['Has_RVC']: rvcRate ? rvcRate.Value : null}, 'rate')
          this.setFields({['Loan_Interest_Rate']: ratesOptions}, 'options')
          this.setFields({['Loan_Interest_Rate']: defaultRate}, 'default')
          this.setFields({['Loan_Interest_Rate']: defaultRate})
          this.setFields({['InterestRateId']: rates[0].Id})
        }
      })
        .catch((response) => {
          this.errors = response.data.Errors
          this.showErrors()
        })
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
      setFieldsValues(this.fields, data.Data);
    },
    setFields(inputFields, extraKey = null) {
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
    setFieldsValues(fields, dataFields) {
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