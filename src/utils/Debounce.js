export default function debounce(func, time) {
    let timeout;
    let start = Date.now();
    return function(...args) {
        clearTimeout(timeout);
        if (Date.now() -start >= time) {
            start = Date.now();
            func(...args);
        }
        else {
            timeout = setTimeout(() => {
                start = Date.now();
                func(...args);
            }, time);
        }
    }
}