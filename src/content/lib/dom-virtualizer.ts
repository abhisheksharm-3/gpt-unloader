import type { MessageStateType, StatsType, MemoryDataPointType } from '../../shared/types';
import { getMessages } from './message-tracker';

const MAX_HISTORY_POINTS = 20;

let savedBytes = 0;
let memoryHistory: MemoryDataPointType[] = [];

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
    memoryHistory = [];
}

/**
 * Records a memory data point
 */
function recordMemoryPoint(): void {
    memoryHistory.push({
        timestamp: Date.now(),
        savedBytes,
    });

    if (memoryHistory.length > MAX_HISTORY_POINTS) {
        memoryHistory.shift();
    }
}

/**
 * Gets memory usage history
 */
export function getMemoryHistory(): MemoryDataPointType[] {
    return [...memoryHistory];
}

/**
 * Defers image loading in an element
 */
function deferImages(element: HTMLElement): void {
    element.querySelectorAll('img[src]').forEach((img) => {
        const imgEl = img as HTMLImageElement;
        if (imgEl.src && !imgEl.dataset.gptUnloaderSrc) {
            imgEl.dataset.gptUnloaderSrc = imgEl.src;
            imgEl.removeAttribute('src');
        }
    });
}

/**
 * Restores deferred images in an element
 */
function restoreImages(element: HTMLElement): void {
    element.querySelectorAll('img[data-gpt-unloader-src]').forEach((img) => {
        const imgEl = img as HTMLImageElement;
        if (imgEl.dataset.gptUnloaderSrc) {
            imgEl.src = imgEl.dataset.gptUnloaderSrc;
            delete imgEl.dataset.gptUnloaderSrc;
        }
    });
}

/**
 * Collapses a message element (removes DOM content, keeps placeholder)
 */
export function collapseMessage(element: HTMLElement, state: MessageStateType): void {
    if (state.isCollapsed) return;

    state.originalHTML = element.innerHTML;
    state.originalHeight = element.offsetHeight;
    savedBytes += state.originalHTML.length * 2;

    deferImages(element);

    const placeholder = document.createElement('div');
    placeholder.className = 'gpt-unloader-placeholder';
    element.replaceChildren(placeholder);
    element.style.height = state.originalHeight + 'px';
    element.style.minHeight = state.originalHeight + 'px';
    element.style.contain = 'strict';
    element.classList.add('gpt-unloader-collapsed');

    state.isCollapsed = true;
    recordMemoryPoint();
}

/**
 * Restores a collapsed message element
 */
export function restoreMessage(element: HTMLElement, state: MessageStateType): void {
    if (!state.isCollapsed || !state.originalHTML) return;

    savedBytes -= state.originalHTML.length * 2;
    element.innerHTML = state.originalHTML;
    element.style.height = '';
    element.style.minHeight = '';
    element.style.contain = '';
    element.classList.remove('gpt-unloader-collapsed');

    restoreImages(element);

    state.isCollapsed = false;
    state.originalHTML = '';
    recordMemoryPoint();
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
