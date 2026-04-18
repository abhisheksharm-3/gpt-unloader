import type { MessageStateType, StatsType, MemoryDataPointType } from '../../shared/types';
import { getMessages } from './message-tracker';

const MAX_HISTORY_POINTS = 20;

let savedBytes = 0;
let memoryHistory: MemoryDataPointType[] = [];

type DetachedEntryType = {
    placeholder: HTMLDivElement;
    parent: HTMLElement;
    nextSibling: Node | null;
};

const collapsedElements = new Map<HTMLElement, DetachedEntryType>();

export function getSavedBytes(): number {
    return savedBytes;
}

export function resetSavedBytes(): void {
    savedBytes = 0;
    memoryHistory = [];
}

function recordMemoryPoint(): void {
    memoryHistory.push({ timestamp: Date.now(), savedBytes });
    if (memoryHistory.length > MAX_HISTORY_POINTS) {
        memoryHistory.shift();
    }
}

export function getMemoryHistory(): MemoryDataPointType[] {
    return [...memoryHistory];
}

function estimateElementSize(element: HTMLElement): number {
    const html = element.outerHTML;
    const nodeCount = element.querySelectorAll('*').length + 1;
    return (html.length * 2) + (nodeCount * 200);
}

/**
 * Removes element from DOM and inserts a same-height placeholder.
 * Returns the placeholder so the caller can register it with IntersectionObserver.
 * Returns null if already collapsed or parentless.
 */
export function collapseMessage(element: HTMLElement, state: MessageStateType): HTMLDivElement | null {
    if (state.isCollapsed) return null;

    const parent = element.parentElement;
    if (!parent) return null;

    const estimatedSize = estimateElementSize(element);
    state.originalHeight = element.offsetHeight;

    const placeholder = document.createElement('div');
    placeholder.className = 'gpt-unloader-placeholder';
    placeholder.style.cssText = `height:${state.originalHeight}px;min-height:${state.originalHeight}px;contain:strict;content-visibility:hidden;background:transparent;`;

    const nextSibling = element.nextSibling;
    parent.replaceChild(placeholder, element);
    collapsedElements.set(element, { placeholder, parent, nextSibling });

    savedBytes += estimatedSize;
    state.isCollapsed = true;
    recordMemoryPoint();

    return placeholder;
}

/**
 * Reinserts the detached element into the DOM, removing its placeholder.
 * No-op if element is not collapsed or missing from the map.
 */
export function restoreMessage(element: HTMLElement, state: MessageStateType): void {
    if (!state.isCollapsed) return;

    const entry = collapsedElements.get(element);
    if (!entry) return;

    const { placeholder, parent } = entry;

    if (placeholder.parentElement === parent) {
        parent.replaceChild(element, placeholder);
    }

    collapsedElements.delete(element);

    const estimatedSize = estimateElementSize(element);
    savedBytes = Math.max(0, savedBytes - estimatedSize);

    state.isCollapsed = false;
    state.originalHeight = 0;
    recordMemoryPoint();
}

export function restoreAllMessages(): void {
    const messages = getMessages();
    messages.forEach((state, element) => {
        if (state.isCollapsed) {
            restoreMessage(element, state);
        }
    });
}

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

function cleanupCollapsedElements(): void {
    const messages = getMessages();
    const tracked = new Set(messages.keys());

    collapsedElements.forEach((_, element) => {
        if (!tracked.has(element)) {
            collapsedElements.delete(element);
        }
    });
}

export function triggerGCHint(): void {
    cleanupCollapsedElements();

    try {
        const blob = new Blob([new ArrayBuffer(1 * 1024 * 1024)]);
        URL.revokeObjectURL(URL.createObjectURL(blob));
    } catch {
        // ignore
    }
}
