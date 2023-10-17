import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import reCaptcha from '@/helpers/reCaptcha'
import { useApplicationStore, parseQuery, getLookup, loadToken, runInitialLoad } from '@/stores/application'

describe('Application Store', () => {
  beforeEach(() => {
    // creates a fresh pinia and makes it active
    // so it's automatically picked up by any useStore() call
    // without having to pass it to it: `useStore(pinia)`
    setActivePinia(createPinia())
  })

  it('Store created, fields initialized', () => {
    const store = useApplicationStore();
    expect(store.getFields['Loan_Purpose'].value).toBe("new-home")
  })

  it('Lookup : loads Guid from api', () => {
    const store = useApplicationStore()
    store.getLookup()
    store.loadToken({setGuid: true})
    console.log(123, store.getFields['Guid'].value)
    expect(store.getFields['Guid'].value).toHaveLength(36)
  })
})
