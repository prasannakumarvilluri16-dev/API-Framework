import { test, expect } from '@playwright/test';




/*export const stringFormat= (str, ...args) => {
    return str.replace(/{(\d+)}/g, (match, index) => {
        return typeof args[index] !== 'undefined' ? args[index] : match;
    });
};*/


export const stringFormat = (str: string, ...args: any[]): string => {
    return str.replace(/{(\d+)}/g, (match: string, index: number) => 
        args[index] ? args[index].toString() : "");
};