import { MESSAGE_SELECTOR, MAX_INJECTION_RETRIES, INJECTION_RETRY_DELAY_MS } from '../../shared/constants';
import { getMessageState } from './message-tracker';
import type { ExtractedMessageType } from '../types';
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
        const role = msg.getAttribute('data-message-author-role');
        const state = getMessageState(msg as HTMLElement);

        let content = '';
        if (state?.isCollapsed && state.originalHTML) {
            const temp = document.createElement('div');
            temp.innerHTML = state.originalHTML;
            content = temp.textContent ?? '';
        } else {
            content = msg.textContent ?? '';
        }

        conversation.push({
            role: role ?? 'unknown',
            content: content.trim().substring(0, 500),
        });
    });

    return conversation;
}

/**
 * Injects summary text into the textarea with retry logic
 */
function injectSummaryWithRetry(summary: string, attempt: number): void {
    if (attempt > MAX_INJECTION_RETRIES) {
        showToast('Could not inject summary - please paste manually');
        return;
    }

    const textarea = findElement(TEXTAREA_SELECTORS);

    if (textarea) {
        if (textarea.tagName === 'TEXTAREA') {
            (textarea as HTMLTextAreaElement).value = summary;
            textarea.dispatchEvent(new Event('input', { bubbles: true }));
            textarea.dispatchEvent(new Event('change', { bubbles: true }));
        } else if ((textarea as HTMLElement).contentEditable === 'true') {
            (textarea as HTMLElement).innerHTML = summary.replace(/\n/g, '<br>');
            textarea.dispatchEvent(new InputEvent('input', { bubbles: true, data: summary }));
        }

        (textarea as HTMLElement).focus();
        showToast('Summary ready - press Enter to send!');
        textarea.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
        setTimeout(() => injectSummaryWithRetry(summary, attempt + 1), INJECTION_RETRY_DELAY_MS);
    }
}

/**
 * Starts a new chat with the provided summary
 */
export function startNewChatWithSummary(summary: string): void {
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

    if (newChatBtn) {
        (newChatBtn as HTMLElement).click();
        injectSummaryWithRetry(summary, 0);
    } else {
        window.location.href = '/';
        setTimeout(() => injectSummaryWithRetry(summary, 0), 1500);
    }
}
