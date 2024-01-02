export default {
    setSessionStorage : (obj, key) => {
        if (obj[key]) {
            sessionStorage.setItem(key, obj[key]);
        }
    },
    isObjectEmpty: (objectName) => {
        return JSON.stringify(objectName) === "{}";
    },
    isObjectNonEmpty: (objectName) => {
        return JSON.stringify(objectName) !== "{}";
    },
    getAnyCase(object, key, fallback) {
        const asLowercase = key.toLowerCase();
        let found = object[Object.keys(object)
          .find(k => k.toLowerCase() === asLowercase)
        ];
        return found ? found : fallback
    },
    cleanNumber: (str) => {
        if (!str) return 0;
        return parseInt(str.replace(/,/g, ''), 10)
    },
    currencyFormatter: () => new Intl.NumberFormat('en-US', {style: 'currency', currency: 'USD'})
}
