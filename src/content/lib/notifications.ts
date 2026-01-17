import { MESSAGE_SELECTOR } from '../../shared/constants';

let isWatching = false;
let lastMessageCount = 0;
let hasUnread = false;

const UNREAD_PREFIX = '● ';

/**
 * Updates the tab title to show unread indicator
 */
function updateTabTitle(showUnread: boolean): void {
    if (showUnread && !document.title.startsWith(UNREAD_PREFIX)) {
        document.title = UNREAD_PREFIX + document.title;
        hasUnread = true;
    } else if (!showUnread && document.title.startsWith(UNREAD_PREFIX)) {
        document.title = document.title.slice(UNREAD_PREFIX.length);
        hasUnread = false;
    }
}

/**
 * Checks for new messages
 */
function checkForNewMessages(): void {
    const messages = document.querySelectorAll(MESSAGE_SELECTOR);
    const currentCount = messages.length;

    if (currentCount > lastMessageCount) {
        const lastMessage = messages[messages.length - 1];
        const role = lastMessage?.getAttribute('data-message-author-role');

        if (role === 'assistant' && document.hidden) {
            updateTabTitle(true);
        }
    }

    lastMessageCount = currentCount;
}

/**
 * Handles visibility change - clears unread when tab becomes visible
 */
function handleVisibilityChange(): void {
    if (!document.hidden && hasUnread) {
        updateTabTitle(false);
    }
}

/**
 * Starts watching for new messages and updating tab title
 */
export function startNotificationWatcher(): void {
    if (isWatching) return;

    isWatching = true;
    lastMessageCount = document.querySelectorAll(MESSAGE_SELECTOR).length;

    document.addEventListener('visibilitychange', handleVisibilityChange);

    const observer = new MutationObserver(checkForNewMessages);

    const container = document.querySelector('[class*="react-scroll-to-bottom"]') ?? document.body;
    observer.observe(container, { childList: true, subtree: true });
}

/**
 * Check if there are unread messages
 */
export function hasUnreadMessages(): boolean {
    return hasUnread;
}

/**
 * Clears the unread indicator
 */
export function clearUnread(): void {
    if (hasUnread) {
        updateTabTitle(false);
    }
}
