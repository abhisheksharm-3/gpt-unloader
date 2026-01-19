import { MESSAGE_SELECTOR, CONTAINER_SELECTORS, ROOT_MARGIN_MULTIPLIER } from '../../shared/constants';
import { trackMessage, isTracked, getMessages, getMessageState } from './message-tracker';
import { collapseMessage, restoreMessage, triggerGCHint } from './dom-virtualizer';
import { setStatus } from './status-indicator';

const CHUNK_SIZE = 20;
const CHUNK_DELAY_MS = 0;
const GC_TRIGGER_INTERVAL_MS = 30000; // Trigger GC hint every 30 seconds

let intersectionObserver: IntersectionObserver | null = null;
let mutationObserver: MutationObserver | null = null;
let placeholderObserver: IntersectionObserver | null = null;
let currentEnabled = true;
let onStatsChange: (() => void) | null = null;
let isProcessing = false;
let gcInterval: ReturnType<typeof setInterval> | null = null;

// Map placeholders back to their original elements
const placeholderToElement = new Map<HTMLElement, HTMLElement>();

/**
 * Sets the stats change callback
 */
export function setOnStatsChange(callback: () => void): void {
    onStatsChange = callback;
}

/**
 * Creates the intersection observer callback for original elements
 */
function createIntersectionCallback(): IntersectionObserverCallback {
    return (entries) => {
        if (!currentEnabled) return;

        entries.forEach((entry) => {
            const element = entry.target as HTMLElement;
            const state = getMessageState(element);
            if (!state) return;

            if (!entry.isIntersecting && !state.isCollapsed) {
                // Element is leaving viewport - collapse it
                collapseMessage(element, state);

                // Find the placeholder that replaced this element and observe it
                const placeholder = document.querySelector(
                    `.gpt-unloader-placeholder[data-gpt-unloader-original-id="${element.dataset.messageId || ''}"]`
                ) as HTMLElement;

                if (placeholder && placeholderObserver) {
                    placeholderToElement.set(placeholder, element);
                    placeholderObserver.observe(placeholder);
                }

                // Unobserve the original element since it's detached
                intersectionObserver?.unobserve(element);
            }
        });

        onStatsChange?.();
    };
}

/**
 * Creates the intersection observer callback for placeholders
 */
function createPlaceholderCallback(): IntersectionObserverCallback {
    return (entries) => {
        if (!currentEnabled) return;

        entries.forEach((entry) => {
            const placeholder = entry.target as HTMLElement;
            const originalElement = placeholderToElement.get(placeholder);

            if (!originalElement) return;

            const state = getMessageState(originalElement);
            if (!state) return;

            if (entry.isIntersecting && state.isCollapsed) {
                // Placeholder is entering viewport - restore the element
                restoreMessage(originalElement, state);

                // Stop observing placeholder
                placeholderObserver?.unobserve(placeholder);
                placeholderToElement.delete(placeholder);

                // Start observing the restored element again
                if (intersectionObserver) {
                    intersectionObserver.observe(originalElement);
                }
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
 * Creates a placeholder observer
 */
function createPlaceholderObserver(bufferSize: number): IntersectionObserver {
    const rootMargin = `${bufferSize * ROOT_MARGIN_MULTIPLIER}px 0px`;
    return new IntersectionObserver(createPlaceholderCallback(), { rootMargin, threshold: 0 });
}

/**
 * Processes a batch of messages without blocking the main thread
 */
function processMessageBatch(
    elements: HTMLElement[],
    startIndex: number,
    onProgress: (processed: number, total: number) => void,
    onComplete: () => void
): void {
    const endIndex = Math.min(startIndex + CHUNK_SIZE, elements.length);

    for (let i = startIndex; i < endIndex; i++) {
        const element = elements[i];
        if (!isTracked(element)) {
            trackMessage(element);
            if (currentEnabled && intersectionObserver) {
                intersectionObserver.observe(element);
            }
        }
    }

    onProgress(endIndex, elements.length);

    if (endIndex < elements.length) {
        if ('requestIdleCallback' in window) {
            requestIdleCallback(() => {
                processMessageBatch(elements, endIndex, onProgress, onComplete);
            }, { timeout: 50 });
        } else {
            setTimeout(() => {
                processMessageBatch(elements, endIndex, onProgress, onComplete);
            }, CHUNK_DELAY_MS);
        }
    } else {
        onComplete();
    }
}

/**
 * Sets up the observers for message tracking
 */
export function setupObservers(bufferSize: number): void {
    intersectionObserver = createIntersectionObserver(bufferSize);
    placeholderObserver = createPlaceholderObserver(bufferSize);

    mutationObserver = new MutationObserver((mutations) => {
        let hasChanges = false;

        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType !== 1) return;
                const element = node as HTMLElement;

                // Skip our own placeholders
                if (element.classList?.contains('gpt-unloader-placeholder')) return;

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

    // Start periodic GC hint
    gcInterval = setInterval(() => {
        triggerGCHint();
    }, GC_TRIGGER_INTERVAL_MS);
}

/**
 * Rebuilds the IntersectionObserver with a new buffer size
 */
export function rebuildObserver(bufferSize: number): void {
    if (intersectionObserver) {
        intersectionObserver.disconnect();
    }
    if (placeholderObserver) {
        placeholderObserver.disconnect();
    }

    intersectionObserver = createIntersectionObserver(bufferSize);
    placeholderObserver = createPlaceholderObserver(bufferSize);
    placeholderToElement.clear();

    if (currentEnabled) {
        const messages = getMessages();
        messages.forEach((state, element) => {
            if (state.isCollapsed) {
                // Find placeholder and observe it
                const placeholder = document.querySelector(
                    `.gpt-unloader-placeholder[data-gpt-unloader-original-id="${element.dataset.messageId || ''}"]`
                ) as HTMLElement;
                if (placeholder) {
                    placeholderToElement.set(placeholder, element);
                    placeholderObserver!.observe(placeholder);
                }
            } else {
                intersectionObserver!.observe(element);
            }
        });
    }
}

/**
 * Scans for existing messages and starts tracking them (chunked, non-blocking)
 */
export function scanMessages(): void {
    if (isProcessing) return;

    const msgs = document.querySelectorAll(MESSAGE_SELECTOR);
    const elements = Array.from(msgs) as HTMLElement[];

    if (elements.length === 0) {
        onStatsChange?.();
        return;
    }

    isProcessing = true;
    setStatus('optimizing', elements.length);

    processMessageBatch(
        elements,
        0,
        (processed, total) => {
            if (processed % 50 === 0 || processed === total) {
                setStatus('optimizing', total - processed);
            }
        },
        () => {
            isProcessing = false;
            setStatus('ready');
            onStatsChange?.();
        }
    );
}

/**
 * Updates the enabled state for observers
 */
export function setEnabled(enabled: boolean): void {
    currentEnabled = enabled;

    if (!enabled && gcInterval) {
        clearInterval(gcInterval);
        gcInterval = null;
    } else if (enabled && !gcInterval) {
        gcInterval = setInterval(() => {
            triggerGCHint();
        }, GC_TRIGGER_INTERVAL_MS);
    }
}

/**
 * Gets the current enabled state
 */
export function getEnabled(): boolean {
    return currentEnabled;
}
