import type { MessageStateType, StatsType } from '../../shared/types';
import { getMessages } from './message-tracker';

/** Saved bytes tracker */
let savedBytes = 0;

/**
 * Gets the current saved bytes count
 */
export function getSavedBytes(): number {
    return savedBytes;
}

/**
 * Resets the saved bytes counter
 */
export function resetSavedBytes(): void {
    savedBytes = 0;
}

/**
 * Collapses a message element (removes DOM content, keeps placeholder)
 * @param element - The message element to collapse
 * @param state - The message state object
 */
export function collapseMessage(element: HTMLElement, state: MessageStateType): void {
    if (state.isCollapsed) return;

    state.originalHTML = element.innerHTML;
    state.originalHeight = element.offsetHeight;
    savedBytes += state.originalHTML.length * 2;

    const placeholder = document.createElement('div');
    placeholder.className = 'gpt-unloader-placeholder';
    element.replaceChildren(placeholder);
    element.style.height = state.originalHeight + 'px';
    element.style.minHeight = state.originalHeight + 'px';
    element.style.contain = 'strict';
    element.classList.add('gpt-unloader-collapsed');

    state.isCollapsed = true;
}

/**
 * Restores a collapsed message element
 * @param element - The message element to restore
 * @param state - The message state object
 */
export function restoreMessage(element: HTMLElement, state: MessageStateType): void {
    if (!state.isCollapsed || !state.originalHTML) return;

    savedBytes -= state.originalHTML.length * 2;
    element.innerHTML = state.originalHTML;
    element.style.height = '';
    element.style.minHeight = '';
    element.style.contain = '';
    element.classList.remove('gpt-unloader-collapsed');

    state.isCollapsed = false;
    state.originalHTML = '';
}

/**
 * Restores all collapsed messages
 */
export function restoreAllMessages(): void {
    const messages = getMessages();
    messages.forEach((state, element) => {
        if (state.isCollapsed) {
            restoreMessage(element, state);
        }
    });
}

/**
 * Gets current statistics
 */
export function getStats(): StatsType {
    const messages = getMessages();
    let active = 0;
    let collapsed = 0;

    messages.forEach((state) => {
        if (state.isCollapsed) collapsed++;
        else active++;
    });

    return {
        total: messages.size,
        active,
        collapsed,
        savedBytes,
        domNodes: document.body.querySelectorAll('*').length,
    };
}
