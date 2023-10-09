export default {
    URLS: {
        INIT: '/homeloan/getlookup?includeNonDropdown=true',
        INIT_BROKER_PORTAL: '/homeloan/getlookup?includeNonDropdown=true&isBrokerPortal=true',
        HOMELOAN: '/homeloan',
        STAGING_HOME: 'https://staging.heartland.co.nz/home-loans',
        PROD_HOME: 'https://heartland.co.nz/home-loans'
    },
    FIELD_NAMES: {
        QUERY_STRING: 'Query_String',
        ORIGIN_WEBPAGE: 'OriginWebpage'
    },
    TEXT_INPUT_FIELDS: ['text', 'number', 'date', 'address', 'currency', 'email', 'tel', 'autocomplete', 'textarea', 'addressright']
}