export default {
    URLS: {
        INIT: '/homeloan/getlookup?includeNonDropdown=true',
        INIT_BROKER_PORTAL: '/homeloan/getlookup?includeNonDropdown=true&isBrokerPortal=true',
        HOMELOAN: '/homeloan',
        CALCULATOR: 'homeloan/repaymentscalculator',
        STAGING_HOME: 'https://staging.heartland.co.nz/home-loans',
        PROD_HOME: 'https://heartland.co.nz/home-loans',
        ADDRESSRIGHT_API_CALL: 'https://www.addressright.co.nz/autocomplete.json?api_key=195425_UK71hnPZ2H9C6FfV&type=Address&mixcase=1&term=',
    },
    FIELD_NAMES: {
        QUERY_STRING: 'Query_String',
        ORIGIN_WEBPAGE: 'OriginWebpage'
    },
    TEXT_INPUT_FIELDS: ['text', 'number', 'date', 'address', 'currency', 'email', 'tel', 'autocomplete', 'textarea', 'addressright'],
    ACCEPTED_FINANCIAL_STATEMENT_LABEL: ` I have read and understood the following statement regarding financial advice:<br />
            You are protected by responsible lending laws. Because of these
            protections, the recommendations given to you about Heartland loans are
            not regulated financial advice. This means that duties and requirements
            imposed on people who give financial advice do not apply to these
            recommendations. This includes a duty to comply with a code of conduct
            and a requirement to be licensed.`,
    CURRENCY: new Intl.NumberFormat('en-NZ', { style: 'currency', currency: 'NZD' })        
}