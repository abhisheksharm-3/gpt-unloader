/**
 * Browser API compatibility layer for Chrome and Firefox
 */

declare const browser: typeof chrome | undefined;

/** Cross-browser extension API (Chrome/Firefox compatible) */
export const browserAPI = (typeof browser !== 'undefined' ? browser : chrome) as typeof chrome;

/**
 * Checks if the extension context is still valid
 */
export function isContextValid(): boolean {
    try {
        return !!browserAPI.runtime?.id;
    } catch {
        return false;
    }
}

/**
 * Safely sends a message to the runtime, handling invalidated context
 */
export function safeSendMessage(message: unknown): void {
    if (!isContextValid()) return;
    browserAPI.runtime.sendMessage(message).catch(() => { });
}
