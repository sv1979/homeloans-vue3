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

  it('Lookup : loads Guid from api', async () => {
    const store = useApplicationStore()
    store.getLookup()
    store.loadToken({setGuid: true})
    function delay(milliseconds) {
      return new Promise((resolve) => {
        setTimeout(resolve, milliseconds);
      });
    }
    await delay(6000);
    expect(store.getFields['Guid'].value).toHaveLength(36)
  })
})
