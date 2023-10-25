// export function debounce(func, timeout = 300) {
//     let timer;
//     console.log(1, func, timeout)
//     return (...args) => {
//         console.log(2)
//         clearTimeout(timer);
//         timer = setTimeout(() => {
//             func.apply(this, args);
//         }, timeout);
//     };
// }