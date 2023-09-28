import { defineStore } from 'pinia'
import fieldTypes from '../helpers/fieldTypes';
import commonMixin from '../helpers/commonMixin'
import axios from 'axios'
import constants from '../helpers/constants'

export const useApplicationStore = defineStore({
  id: 'application',
  state: () => ({
    guid: null,
    initQuery : false,
    fields: fieldTypes.fields,
    data: null,
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
    async parseQuery (router, route) {
        await router.isReady()
        //once its ready we can access the query params
        console.log(1, route, route.query)
        if (commonMixin.isObjectEmpty(route.query)) {

        } else {
            const query = route.query
            this.initQuery = query
            commonMixin.setSessionStorage(query, 'referrer')
            this.setFields({[constants.FIELD_NAMES.QUERY_STRING]: route.fullPath})
            this.setFields({[constants.FIELD_NAMES.ORIGIN_WEBPAGE]: commonMixin.getAnyCase(query, 'OriginWebpage', 'Empty')})
        }
    },
    async getLookup () {
        let url = ''
        if ( this.fields.Query_String.value.toLowerCase().indexOf('interportalname') > -1 ) {
            url = constants.URLS.INIT
        } else {
            url = constants.URLS.INIT_BROKER_PORTAL
        }
        const lookupResponse = axios.get(url).then(({ data }) => {
            if (data.Data.HomeLoan_Interest_Rate) {
              var rates = data.Data.HomeLoan_Interest_Rate.filter(
                (r) => r.IsDropdown &&
                !r.AdditionalInformation.toLowerCase().includes('revolving')
              );
              var rvcRate = data.Data.HomeLoan_Interest_Rate.find(
                (r) =>
                  !r.IsDropdown &&
                  r.AdditionalInformation.toLowerCase().includes('revolving')
              );
  
              commit('setLookup', data.Data);
  
              commit('updateFieldParam', {
                param: 'Has_RVC.rate',
                value: rvcRate ? rvcRate.Value : false,
              });
  
              commit('updateFieldParam', {
                param: 'Loan_Interest_Rate.options',
                value: rates.map((r) => {
                  return { name: r.Name, value: r.Value + (r.Name.indexOf('floating') > -1 ? '---floating' : ''), id: r.Id };
                }),
              });
  
              commit('updateFieldParam', {
                param: 'Loan_Interest_Rate.default',
                value: rates[0].Value + (rates[0].Name.indexOf('floating') > -1 ? '---floating' : ''),
              });
              commit('updateFieldParam', {
                param: 'Loan_Interest_Rate.value',
                value: rates[0].Value + (rates[0].Name.indexOf('floating') > -1 ? '---floating' : ''),
              });
              commit('updateFieldParam', {
                param: 'InterestRateId.value',
                value: rates[0].Id,
              });
            }
          })
          .catch((error) => {
            commit('setErrors', get(error, 'response.data.Errors'));
            dispatch('showErrors');
          });

        
        console.log(lookupResponse)    
    },
    setData(data) {
        this.data = data;
        setFieldsValues(this.fields, data.Data);
    },
    setFields(inputFields) {
        Object.entries(inputFields).forEach(([key, value]) => {
          if (typeof this.fields[key] !== 'undefined') {
            this.fields[key].value = value;
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