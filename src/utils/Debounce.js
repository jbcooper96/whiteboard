import { useCallback } from "react";
import React from "react"

export default function useDebouncedCallback(callback, delay) {
    let timeoutId;

    return useCallback((...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            callback(...args);
        }, delay);
    }, [callback, delay]);
}