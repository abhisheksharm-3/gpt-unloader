import type { MessageStateType } from '../types';

/** Tracked messages map */
const messages = new Map<HTMLElement, MessageStateType>();

/**
 * Gets the messages map
 */
export function getMessages(): Map<HTMLElement, MessageStateType> {
    return messages;
}

/**
 * Tracks a new message element
 * @param element - The message DOM element to track
 */
export function trackMessage(element: HTMLElement): void {
    const state: MessageStateType = {
        element,
        originalHTML: '',
        originalHeight: 0,
        isCollapsed: false,
    };
    messages.set(element, state);
}

/**
 * Checks if a message is already being tracked
 * @param element - The message DOM element
 */
export function isTracked(element: HTMLElement): boolean {
    return messages.has(element);
}

/**
 * Gets the state for a tracked message
 * @param element - The message DOM element
 */
export function getMessageState(element: HTMLElement): MessageStateType | undefined {
    return messages.get(element);
}

/**
 * Clears all tracked messages
 */
export function clearMessages(): void {
    messages.clear();
}
