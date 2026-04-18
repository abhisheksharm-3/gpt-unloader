import { MESSAGE_SELECTOR } from '../../shared/constants';
import type { ExtractedMessageType } from '../../shared/types';

/** Extracts text from a message element. Works on both in-DOM and detached elements. */
export function extractMessageContent(element: HTMLElement): string {
    return element.textContent ?? '';
}

export function extractAllMessages(): ExtractedMessageType[] {
    const messages: ExtractedMessageType[] = [];
    const msgElements = document.querySelectorAll(MESSAGE_SELECTOR);

    msgElements.forEach((msg) => {
        const element = msg as HTMLElement;
        const role = msg.getAttribute('data-message-author-role') ?? 'unknown';
        messages.push({ role, content: extractMessageContent(element).trim() });
    });

    return messages;
}
