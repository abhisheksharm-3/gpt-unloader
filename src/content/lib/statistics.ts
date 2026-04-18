import { getMessages } from './message-tracker';
import { extractMessageContent } from './message-extractor';
import type { ConversationStatsType } from '../../shared/types';

function countWords(text: string): number {
    return text.trim().split(/\s+/).filter(Boolean).length;
}

function estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
}

/** Returns stats for all tracked messages, including currently collapsed ones. */
export function getConversationStats(): ConversationStatsType {
    const messages = getMessages();

    let userMessages = 0;
    let assistantMessages = 0;
    let userWords = 0;
    let assistantWords = 0;
    let totalText = '';

    messages.forEach((_, element) => {
        const role = element.getAttribute('data-message-author-role');
        const content = extractMessageContent(element);

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
        totalMessages: messages.size,
        userMessages,
        assistantMessages,
        totalWords: userWords + assistantWords,
        userWords,
        assistantWords,
        estimatedTokens: estimateTokens(totalText),
        conversationDuration: 0,
    };
}
