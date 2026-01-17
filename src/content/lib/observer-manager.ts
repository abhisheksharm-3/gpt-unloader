import { MESSAGE_SELECTOR, CONTAINER_SELECTORS, ROOT_MARGIN_MULTIPLIER } from '../../shared/constants';
import { trackMessage, isTracked, getMessages, getMessageState } from './message-tracker';
import { collapseMessage, restoreMessage } from './dom-virtualizer';

let intersectionObserver: IntersectionObserver | null = null;
let mutationObserver: MutationObserver | null = null;
let currentEnabled = true;
let onStatsChange: (() => void) | null = null;

/**
 * Sets the stats change callback
 */
export function setOnStatsChange(callback: () => void): void {
    onStatsChange = callback;
}

/**
 * Creates the intersection observer callback
 */
function createIntersectionCallback(): IntersectionObserverCallback {
    return (entries) => {
        if (!currentEnabled) return;

        entries.forEach((entry) => {
            const state = getMessageState(entry.target as HTMLElement);
            if (!state) return;

            if (entry.isIntersecting && state.isCollapsed) {
                restoreMessage(entry.target as HTMLElement, state);
            } else if (!entry.isIntersecting && !state.isCollapsed) {
                collapseMessage(entry.target as HTMLElement, state);
            }
        });

        onStatsChange?.();
    };
}

/**
 * Creates a new IntersectionObserver with the given buffer size
 */
function createIntersectionObserver(bufferSize: number): IntersectionObserver {
    const rootMargin = `${bufferSize * ROOT_MARGIN_MULTIPLIER}px 0px`;
    return new IntersectionObserver(createIntersectionCallback(), { rootMargin, threshold: 0 });
}

/**
 * Sets up the observers for message tracking
 */
export function setupObservers(bufferSize: number): void {
    intersectionObserver = createIntersectionObserver(bufferSize);

    mutationObserver = new MutationObserver((mutations) => {
        let hasChanges = false;

        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType !== 1) return;
                const element = node as HTMLElement;

                if (element.matches?.(MESSAGE_SELECTOR) && !isTracked(element)) {
                    trackMessage(element);
                    if (currentEnabled && intersectionObserver) {
                        intersectionObserver.observe(element);
                    }
                    hasChanges = true;
                }

                const nested = element.querySelectorAll?.(MESSAGE_SELECTOR) ?? [];
                nested.forEach((msg) => {
                    const msgElement = msg as HTMLElement;
                    if (!isTracked(msgElement)) {
                        trackMessage(msgElement);
                        if (currentEnabled && intersectionObserver) {
                            intersectionObserver.observe(msgElement);
                        }
                        hasChanges = true;
                    }
                });
            });
        });

        if (hasChanges) {
            onStatsChange?.();
        }
    });

    for (const selector of CONTAINER_SELECTORS) {
        const container = document.querySelector(selector);
        if (container) {
            mutationObserver.observe(container, { childList: true, subtree: true });
            break;
        }
    }
}

/**
 * Rebuilds the IntersectionObserver with a new buffer size
 */
export function rebuildObserver(bufferSize: number): void {
    if (intersectionObserver) {
        intersectionObserver.disconnect();
    }

    intersectionObserver = createIntersectionObserver(bufferSize);

    if (currentEnabled) {
        const messages = getMessages();
        messages.forEach((_, element) => {
            intersectionObserver!.observe(element);
        });
    }
}

/**
 * Scans for existing messages and starts tracking them
 */
export function scanMessages(): void {
    const msgs = document.querySelectorAll(MESSAGE_SELECTOR);
    msgs.forEach((msg) => {
        const element = msg as HTMLElement;
        if (!isTracked(element)) {
            trackMessage(element);
            if (currentEnabled && intersectionObserver) {
                intersectionObserver.observe(element);
            }
        }
    });
    onStatsChange?.();
}

/**
 * Updates the enabled state for observers
 */
export function setEnabled(enabled: boolean): void {
    currentEnabled = enabled;
}

/**
 * Gets the current enabled state
 */
export function getEnabled(): boolean {
    return currentEnabled;
}
