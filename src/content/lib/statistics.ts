import { MESSAGE_SELECTOR } from '../../shared/constants';
import { getMessageState } from './message-tracker';
import { extractMessageContent } from './message-extractor';
import type { ConversationStatsType } from '../../shared/types';

/**
 * Counts words in a string
 */
function countWords(text: string): number {
    return text.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Estimates token count (rough approximation: ~4 chars per token)
 */
function estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
}

/**
 * Gets comprehensive conversation statistics
 */
export function getConversationStats(): ConversationStatsType {
    const messages = document.querySelectorAll(MESSAGE_SELECTOR);

    let userMessages = 0;
    let assistantMessages = 0;
    let userWords = 0;
    let assistantWords = 0;
    let totalText = '';

    messages.forEach((msg) => {
        const element = msg as HTMLElement;
        const role = msg.getAttribute('data-message-author-role');
        const state = getMessageState(element);
        const content = extractMessageContent(element, state);

        totalText += content + ' ';
        const words = countWords(content);

        if (role === 'user') {
            userMessages++;
            userWords += words;
        } else if (role === 'assistant') {
            assistantMessages++;
            assistantWords += words;
        }
    });

    return {
        totalMessages: messages.length,
        userMessages,
        assistantMessages,
        totalWords: userWords + assistantWords,
        userWords,
        assistantWords,
        estimatedTokens: estimateTokens(totalText),
        conversationDuration: 0,
    };
}
