/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
//hooks/useClickOutside.tsx
import { useEffect, useRef } from 'react';

export const useClickOutside = (ref:any, callback:any) => {
    useEffect(() => {
        function handleClickOutside(event:any) {
            if (ref.current && !ref.current.contains(event.target)) {
                callback();
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [ref, callback]);
};