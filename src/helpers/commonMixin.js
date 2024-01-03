export default {
    setSessionStorage: (obj, key) => {
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
    transformStringToInteger: (str) => {
        // Check if the input is a string
        if (typeof str === 'string') {
            // Use a regular expression to check if the string contains only numbers and commas
            if (/^[0-9,]+$/.test(str)) {
                // Remove commas and convert the string to an integer
                return parseInt(str.replace(/,/g, ''), 10);
            } else {
                // If the string contains other characters, handle it as needed
                // console.log('The string contains invalid characters');
                return str
            }
        } else {
            // If the input is not a string, handle it as needed
            // console.log('Input is not a string');
            return str
        }
    },
    transformArrayValues: (array) => {
        // Iterate through the array
        for (let i = 0; i < array.length; i++) {
          // Check if the 'value' property is a string and transform it to an integer
          if (typeof array[i].value === 'string') {
            array[i].value = transformStringToInteger(array[i].value);
          }
        }
        return array;
    }
}
