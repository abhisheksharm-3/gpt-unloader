/**
 * Generates a summary from conversation messages
 * @param conversation - Array of conversation messages
 * @returns Formatted summary string
 */
import type { ConversationMessageType } from '../shared/types';

export function generateSummary(conversation: ConversationMessageType[]): string {
    const userMessages = conversation.filter(m => m.role === 'user').map(m => m.content);
    const assistantMessages = conversation.filter(m => m.role === 'assistant').map(m => m.content);

    let summary = '📋 **Previous Conversation Summary**\n\n';
    summary += `This chat had ${conversation.length} messages.\n\n`;

    if (userMessages.length > 0) {
        summary += '**Key topics discussed:**\n';
        userMessages.slice(0, 3).forEach((msg, i) => {
            const topic = msg.substring(0, 100).replace(/\n/g, ' ');
            summary += `${i + 1}. ${topic}${msg.length > 100 ? '...' : ''}\n`;
        });
        summary += '\n';
    }

    if (assistantMessages.length > 0) {
        summary += '**Last response preview:**\n';
        const lastResponse = assistantMessages[assistantMessages.length - 1];
        summary += lastResponse.substring(0, 200).replace(/\n/g, ' ');
        if (lastResponse.length > 200) summary += '...';
        summary += '\n\n';
    }

    summary += '---\nPlease continue helping me with this context in mind.';

    return summary;
}
