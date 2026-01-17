import { MESSAGE_SELECTOR, MAX_INJECTION_RETRIES, INJECTION_RETRY_DELAY_MS } from '../../shared/constants';
import { getMessageState } from './message-tracker';
import { extractMessageContent } from './message-extractor';
import type { ExtractedMessageType } from '../../shared/types';
import { showToast } from './toast';

const NEW_CHAT_SELECTORS = [
    'a[href="/"]',
    '[data-testid="create-new-chat-button"]',
    'nav a[href="/"]',
    'button[aria-label*="New chat"]',
    'button[aria-label*="new chat"]',
    '[aria-label="New chat"]',
    'nav button:first-child',
];

const TEXTAREA_SELECTORS = [
    '#prompt-textarea',
    'textarea[data-id="root"]',
    'textarea[placeholder*="Message"]',
    'textarea[placeholder*="Send"]',
    'div[contenteditable="true"]',
    'textarea',
];

const URL_CHANGE_TIMEOUT_MS = 5000;
const URL_CHECK_INTERVAL_MS = 100;

/**
 * Finds an element matching one of the selectors
 */
function findElement(selectors: string[]): Element | null {
    for (const selector of selectors) {
        const element = document.querySelector(selector);
        if (element) return element;
    }
    return null;
}

/**
 * Extracts the conversation from the current page
 */
export function extractConversation(): ExtractedMessageType[] {
    const conversation: ExtractedMessageType[] = [];
    const msgs = document.querySelectorAll(MESSAGE_SELECTOR);

    msgs.forEach((msg) => {
        const element = msg as HTMLElement;
        const role = msg.getAttribute('data-message-author-role') ?? 'unknown';
        const state = getMessageState(element);
        const content = extractMessageContent(element, state);

        conversation.push({
            role,
            content: content.trim().substring(0, 500),
        });
    });

    return conversation;
}

/**
 * Waits for URL to change from the original URL
 */
function waitForUrlChange(originalUrl: string): Promise<boolean> {
    return new Promise((resolve) => {
        const startTime = Date.now();

        const checkUrl = () => {
            if (window.location.href !== originalUrl) {
                resolve(true);
                return;
            }

            if (Date.now() - startTime > URL_CHANGE_TIMEOUT_MS) {
                resolve(false);
                return;
            }

            setTimeout(checkUrl, URL_CHECK_INTERVAL_MS);
        };

        checkUrl();
    });
}

/**
 * Waits for the textarea to be available and empty (new chat state)
 */
function waitForEmptyTextarea(): Promise<Element | null> {
    return new Promise((resolve) => {
        let attempts = 0;

        const check = () => {
            attempts++;
            if (attempts > MAX_INJECTION_RETRIES) {
                resolve(null);
                return;
            }

            const textarea = findElement(TEXTAREA_SELECTORS);

            if (textarea) {
                const hasMessages = document.querySelectorAll(MESSAGE_SELECTOR).length > 0;
                if (!hasMessages) {
                    resolve(textarea);
                    return;
                }
            }

            setTimeout(check, INJECTION_RETRY_DELAY_MS);
        };

        check();
    });
}

/**
 * Injects summary text into the textarea
 */
function injectSummary(textarea: Element, summary: string): void {
    if (textarea.tagName === 'TEXTAREA') {
        (textarea as HTMLTextAreaElement).value = summary;
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
        textarea.dispatchEvent(new Event('change', { bubbles: true }));
    } else if ((textarea as HTMLElement).contentEditable === 'true') {
        (textarea as HTMLElement).textContent = summary;
        textarea.dispatchEvent(new InputEvent('input', { bubbles: true, data: summary }));
    }

    (textarea as HTMLElement).focus();
    showToast('Summary ready - press Enter to send!');
    textarea.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

/**
 * Starts a new chat with the provided summary
 */
export async function startNewChatWithSummary(summary: string): Promise<void> {
    const originalUrl = window.location.href;
    let newChatBtn = findElement(NEW_CHAT_SELECTORS);

    if (!newChatBtn) {
        const buttons = document.querySelectorAll('a, button');
        for (const btn of buttons) {
            if (btn.textContent?.toLowerCase().includes('new chat')) {
                newChatBtn = btn;
                break;
            }
        }
    }

    showToast('Starting new chat...');

    if (newChatBtn) {
        (newChatBtn as HTMLElement).click();
    } else {
        window.location.href = '/';
    }

    const urlChanged = await waitForUrlChange(originalUrl);

    if (!urlChanged) {
        showToast('Could not navigate to new chat');
        return;
    }

    const textarea = await waitForEmptyTextarea();

    if (textarea) {
        injectSummary(textarea, summary);
    } else {
        showToast('Could not find textarea - please paste manually');
        navigator.clipboard.writeText(summary).catch(() => { });
    }
}
