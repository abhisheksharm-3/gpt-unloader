import { browserAPI } from '../../shared/browser-api';
import { MESSAGE_SELECTOR } from '../../shared/constants';
import type { BookmarkType } from '../../shared/types';
import { showToast } from './toast';

const STORAGE_KEY = 'gpt-unloader-bookmarks';
const BOOKMARK_BTN_CLASS = 'gpt-unloader-bookmark-btn';

// SVG icons matching ChatGPT's icon style
const BOOKMARK_EMPTY_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>`;
const BOOKMARK_FILLED_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>`;

/**
 * Gets the current conversation ID from URL
 */
function getConversationId(): string {
    const match = window.location.pathname.match(/\/c\/([a-zA-Z0-9-]+)/);
    return match ? match[1] : 'home';
}

/**
 * Gets all bookmarks from storage
 */
async function getAllBookmarks(): Promise<BookmarkType[]> {
    const result = await browserAPI.storage.local.get([STORAGE_KEY]);
    return (result[STORAGE_KEY] as BookmarkType[] | undefined) ?? [];
}

/**
 * Saves bookmarks to storage
 */
async function saveBookmarks(bookmarks: BookmarkType[]): Promise<void> {
    await browserAPI.storage.local.set({ [STORAGE_KEY]: bookmarks });
}

/**
 * Gets bookmarks for current conversation
 */
export async function getBookmarks(): Promise<BookmarkType[]> {
    const all = await getAllBookmarks();
    const conversationId = getConversationId();
    return all.filter((b) => b.conversationId === conversationId);
}

/**
 * Toggles bookmark for a message
 */
export async function toggleBookmark(messageIndex: number): Promise<boolean> {
    const conversationId = getConversationId();
    const all = await getAllBookmarks();

    const existingIndex = all.findIndex(
        (b) => b.conversationId === conversationId && b.messageIndex === messageIndex
    );

    if (existingIndex >= 0) {
        all.splice(existingIndex, 1);
        await saveBookmarks(all);
        showToast('Bookmark removed');
        updateBookmarkButton(messageIndex, false);
        return false;
    }

    const msgs = document.querySelectorAll(MESSAGE_SELECTOR);
    const msg = msgs[messageIndex] as HTMLElement | undefined;
    if (!msg) return false;

    const role = msg.getAttribute('data-message-author-role') ?? 'unknown';
    const preview = (msg.textContent ?? '').trim().substring(0, 100);

    const bookmark: BookmarkType = {
        id: `${conversationId}-${messageIndex}-${Date.now()}`,
        conversationId,
        messageIndex,
        role,
        preview,
        createdAt: Date.now(),
    };

    all.push(bookmark);
    await saveBookmarks(all);
    showToast('Message bookmarked!');
    updateBookmarkButton(messageIndex, true);
    return true;
}

/**
 * Scrolls to a specific message
 */
export function scrollToMessage(messageIndex: number): void {
    const msgs = document.querySelectorAll(MESSAGE_SELECTOR);
    const msg = msgs[messageIndex] as HTMLElement | undefined;
    if (msg) {
        msg.scrollIntoView({ behavior: 'smooth', block: 'center' });
        msg.style.outline = '2px solid #10b981';
        setTimeout(() => {
            msg.style.outline = '';
        }, 2000);
    }
}

/**
 * Updates bookmark button state
 */
function updateBookmarkButton(messageIndex: number, isBookmarked: boolean): void {
    const msgs = document.querySelectorAll(MESSAGE_SELECTOR);
    const msg = msgs[messageIndex] as HTMLElement | undefined;
    if (!msg) return;

    const btn = msg.closest('[data-testid^="conversation-turn"]')?.querySelector(`.${BOOKMARK_BTN_CLASS}`) as HTMLButtonElement | null;
    if (btn) {
        btn.innerHTML = `<span class="flex items-center justify-center touch:w-10 h-8 w-8">${isBookmarked ? BOOKMARK_FILLED_SVG : BOOKMARK_EMPTY_SVG}</span>`;
        btn.setAttribute('aria-pressed', isBookmarked.toString());
        btn.title = isBookmarked ? 'Remove bookmark' : 'Bookmark message';
        if (isBookmarked) {
            btn.style.color = '#fbbf24';
        } else {
            btn.style.color = '';
        }
    }
}

/**
 * Finds the toolbar container for a message
 */
function findToolbar(messageElement: HTMLElement): HTMLElement | null {
    // Navigate up to find the conversation turn container
    const turnContainer = messageElement.closest('[data-testid^="conversation-turn"]');
    if (!turnContainer) return null;

    // Find the toolbar wrapper (contains action buttons)
    const toolbar = turnContainer.querySelector('.flex.flex-wrap.items-center');
    return toolbar as HTMLElement | null;
}

/**
 * Creates a bookmark button matching ChatGPT's style
 */
function createBookmarkButton(isBookmarked: boolean, messageIndex: number): HTMLButtonElement {
    const btn = document.createElement('button');
    btn.className = `${BOOKMARK_BTN_CLASS} text-token-text-secondary hover:bg-token-bg-secondary rounded-lg`;
    btn.setAttribute('aria-label', isBookmarked ? 'Remove bookmark' : 'Bookmark message');
    btn.setAttribute('aria-pressed', isBookmarked.toString());
    btn.setAttribute('data-state', 'closed');
    btn.innerHTML = `<span class="flex items-center justify-center touch:w-10 h-8 w-8">${isBookmarked ? BOOKMARK_FILLED_SVG : BOOKMARK_EMPTY_SVG}</span>`;

    if (isBookmarked) {
        btn.style.color = '#fbbf24';
    }

    btn.onclick = (e) => {
        e.stopPropagation();
        e.preventDefault();
        toggleBookmark(messageIndex);
    };

    return btn;
}

/**
 * Injects bookmark buttons into ChatGPT's toolbars
 */
export async function injectBookmarkButtons(): Promise<void> {
    const bookmarks = await getBookmarks();
    const bookmarkedIndices = new Set(bookmarks.map((b) => b.messageIndex));

    document.querySelectorAll(MESSAGE_SELECTOR).forEach((msg, index) => {
        const messageElement = msg as HTMLElement;
        const toolbar = findToolbar(messageElement);

        if (!toolbar) return;
        if (toolbar.querySelector(`.${BOOKMARK_BTN_CLASS}`)) return;

        const isBookmarked = bookmarkedIndices.has(index);
        const bookmarkBtn = createBookmarkButton(isBookmarked, index);

        // Insert after the copy button (first button in toolbar)
        const copyBtn = toolbar.querySelector('[data-testid="copy-turn-action-button"]');
        if (copyBtn) {
            copyBtn.insertAdjacentElement('afterend', bookmarkBtn);
        } else {
            // Fallback: insert at the beginning
            toolbar.insertBefore(bookmarkBtn, toolbar.firstChild);
        }
    });
}
