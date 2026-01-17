/**
 * Browser API compatibility layer for Chrome and Firefox
 */

declare const browser: typeof chrome | undefined;

/** Cross-browser extension API (Chrome/Firefox compatible) */
export const browserAPI = (typeof browser !== 'undefined' ? browser : chrome) as typeof chrome;
