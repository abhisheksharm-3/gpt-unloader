import { MESSAGE_SELECTOR } from '../../shared/constants';

const TIMESTAMP_CLASS = 'gpt-unloader-timestamp';
const STORAGE_KEY = 'gpt-unloader-timestamps';
const UPDATE_INTERVAL_MS = 60000;

type TimestampStorageType = {
    [conversationId: string]: {
        [messageHash: string]: number;
    };
};

let updateInterval: ReturnType<typeof setInterval> | null = null;
let isEnabled = true;

/**
 * Gets the current conversation ID from URL
 */
function getConversationId(): string {
    const match = window.location.pathname.match(/\/c\/([a-zA-Z0-9-]+)/);
    return match ? match[1] : 'home';
}

/**
 * Creates a simple hash from message content for identification
 */
function getMessageHash(element: HTMLElement, index: number): string {
    const role = element.getAttribute('data-message-author-role') ?? 'unknown';
    const text = (element.textContent ?? '').trim().substring(0, 50);
    // Use role + index + first 50 chars as identifier
    return `${role}-${index}-${text.replace(/\s+/g, '_').substring(0, 30)}`;
}

/**
 * Gets stored timestamps from localStorage
 */
function getStoredTimestamps(): TimestampStorageType {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : {};
    } catch {
        return {};
    }
}

/**
 * Saves timestamps to localStorage
 */
function saveTimestamps(data: TimestampStorageType): void {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
        // Storage full or unavailable
    }
}

/**
 * Gets or creates timestamp for a message
 */
function getMessageTimestamp(element: HTMLElement, index: number): number {
    const conversationId = getConversationId();
    const messageHash = getMessageHash(element, index);
    const stored = getStoredTimestamps();

    // Check if we have a stored timestamp
    if (stored[conversationId]?.[messageHash]) {
        return stored[conversationId][messageHash];
    }

    // Create new timestamp - estimate based on message position
    // Earlier messages get earlier timestamps (spread over last 24 hours as estimate)
    const allMessages = document.querySelectorAll(MESSAGE_SELECTOR);
    const totalMessages = allMessages.length;
    const position = index / Math.max(totalMessages, 1);

    // Estimate: spread messages over last hour for recent, or based on session
    const now = Date.now();
    const estimatedAge = position < 0.9
        ? Math.floor((1 - position) * 60 * 60 * 1000) // Spread over last hour
        : Math.floor((1 - position) * 5 * 60 * 1000); // Last 5 mins for recent

    const timestamp = now - estimatedAge;

    // Save it
    if (!stored[conversationId]) {
        stored[conversationId] = {};
    }
    stored[conversationId][messageHash] = timestamp;
    saveTimestamps(stored);

    return timestamp;
}

/**
 * Formats a timestamp as relative time
 */
function formatRelativeTime(timestamp: number): string {
    const now = Date.now();
    const diff = now - timestamp;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return 'now';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days === 1) return '1d';
    if (days < 7) return `${days}d`;

    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/**
 * Finds the toolbar container for a message
 */
function findToolbar(messageElement: HTMLElement): HTMLElement | null {
    const turnContainer = messageElement.closest('[data-testid^="conversation-turn"]');
    if (!turnContainer) return null;
    const toolbar = turnContainer.querySelector('.flex.flex-wrap.items-center');
    return toolbar as HTMLElement | null;
}

/**
 * Creates timestamp element matching ChatGPT's style
 */
function createTimestampElement(timestamp: number, index: number): HTMLSpanElement {
    const span = document.createElement('span');
    span.className = TIMESTAMP_CLASS;
    span.textContent = formatRelativeTime(timestamp);
    span.dataset.timestamp = timestamp.toString();
    span.dataset.messageIndex = index.toString();
    span.style.cssText = `
        font-size: 11px;
        color: var(--token-text-tertiary, #6b7280);
        padding: 0 8px;
        display: flex;
        align-items: center;
        height: 30px;
    `;
    span.title = new Date(timestamp).toLocaleString();
    return span;
}

/**
 * Injects timestamp into a message's toolbar
 */
function injectTimestamp(element: HTMLElement, index: number): void {
    const toolbar = findToolbar(element);
    if (!toolbar) return;
    if (toolbar.querySelector(`.${TIMESTAMP_CLASS}`)) return;

    const timestamp = getMessageTimestamp(element, index);
    const timestampEl = createTimestampElement(timestamp, index);

    // Insert at the end of the toolbar
    toolbar.appendChild(timestampEl);
}

/**
 * Updates all timestamps display
 */
function updateTimestamps(): void {
    if (!isEnabled) return;

    document.querySelectorAll(`.${TIMESTAMP_CLASS}`).forEach((el) => {
        const timestampStr = (el as HTMLElement).dataset.timestamp;
        if (timestampStr) {
            const timestamp = parseInt(timestampStr, 10);
            el.textContent = formatRelativeTime(timestamp);
        }
    });
}

/**
 * Injects timestamps into all messages
 */
export function injectAllTimestamps(): void {
    if (!isEnabled) return;

    document.querySelectorAll(MESSAGE_SELECTOR).forEach((msg, index) => {
        injectTimestamp(msg as HTMLElement, index);
    });
}

/**
 * Starts the timestamp updater
 */
export function startTimestampUpdater(): void {
    if (updateInterval) return;
    updateInterval = setInterval(updateTimestamps, UPDATE_INTERVAL_MS);
}

/**
 * Stops the timestamp updater
 */
export function stopTimestampUpdater(): void {
    if (updateInterval) {
        clearInterval(updateInterval);
        updateInterval = null;
    }
}

/**
 * Removes all timestamps
 */
export function removeAllTimestamps(): void {
    document.querySelectorAll(`.${TIMESTAMP_CLASS}`).forEach((el) => el.remove());
}

/**
 * Sets enabled state for timestamps
 */
export function setTimestampsEnabled(enabled: boolean): void {
    isEnabled = enabled;
    if (enabled) {
        injectAllTimestamps();
        startTimestampUpdater();
    } else {
        stopTimestampUpdater();
        removeAllTimestamps();
    }
}
