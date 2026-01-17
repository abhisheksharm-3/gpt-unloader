import { MESSAGE_SELECTOR } from '../../shared/constants';
import { getMessageState } from './message-tracker';
import type { ExtractedMessageType, MessageStateType } from '../../shared/types';

/**
 * Extracts text content from a message element, handling collapsed state
 * @param element - The message DOM element
 * @param state - The tracked state for this element
 */
export function extractMessageContent(element: HTMLElement, state: MessageStateType | undefined): string {
    if (state?.isCollapsed && state.originalHTML) {
        const temp = document.createElement('div');
        temp.innerHTML = state.originalHTML;
        return temp.textContent ?? '';
    }
    return element.textContent ?? '';
}

/**
 * Extracts all messages from the DOM for export/analysis
 */
export function extractAllMessages(): ExtractedMessageType[] {
    const messages: ExtractedMessageType[] = [];
    const msgElements = document.querySelectorAll(MESSAGE_SELECTOR);

    msgElements.forEach((msg) => {
        const element = msg as HTMLElement;
        const role = msg.getAttribute('data-message-author-role') ?? 'unknown';
        const state = getMessageState(element);
        const content = extractMessageContent(element, state);

        messages.push({ role, content: content.trim() });
    });

    return messages;
}
