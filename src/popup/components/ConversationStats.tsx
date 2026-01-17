import { useState, useEffect } from 'react';
import { browserAPI } from '../../shared/browser-api';
import type { ConversationStatsType } from '../../shared/types';

type ConversationStatsProps = {
    isOnChatGPT: boolean;
};

const INITIAL_STATS: ConversationStatsType = {
    totalMessages: 0,
    userMessages: 0,
    assistantMessages: 0,
    totalWords: 0,
    userWords: 0,
    assistantWords: 0,
    estimatedTokens: 0,
    conversationDuration: 0,
};

/**
 * Conversation statistics display component
 */
export function ConversationStats({ isOnChatGPT }: ConversationStatsProps) {
    const [stats, setStats] = useState<ConversationStatsType>(INITIAL_STATS);
    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => {
        if (!isOnChatGPT) return;

        const fetchStats = async () => {
            const tabs = await browserAPI.tabs.query({ active: true, currentWindow: true });
            const tab = tabs[0];
            if (tab?.id) {
                const response = await browserAPI.tabs.sendMessage(tab.id, { type: 'getConversationStats' });
                if (response?.stats) {
                    setStats(response.stats);
                }
            }
        };

        fetchStats();
    }, [isOnChatGPT]);

    if (!isOnChatGPT) return null;

    const ratio = stats.userMessages > 0
        ? (stats.assistantMessages / stats.userMessages).toFixed(1)
        : '0';

    return (
        <div className="border-t border-zinc-800 pt-3 mt-3">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between text-xs font-medium text-zinc-400 hover:text-zinc-300 transition-colors"
            >
                <span>Conversation Statistics</span>
                <span className="text-[10px]">{isExpanded ? '▲' : '▼'}</span>
            </button>

            {isExpanded && (
                <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-zinc-800/50 p-2 ">
                        <div className="text-zinc-500 text-[10px]">Messages</div>
                        <div className="text-white font-medium">{stats.totalMessages}</div>
                        <div className="text-zinc-500 text-[10px] mt-1">
                            You: {stats.userMessages} • AI: {stats.assistantMessages}
                        </div>
                    </div>

                    <div className="bg-zinc-800/50 p-2 ">
                        <div className="text-zinc-500 text-[10px]">Words</div>
                        <div className="text-white font-medium">{stats.totalWords.toLocaleString()}</div>
                        <div className="text-zinc-500 text-[10px] mt-1">
                            You: {stats.userWords.toLocaleString()} • AI: {stats.assistantWords.toLocaleString()}
                        </div>
                    </div>

                    <div className="bg-zinc-800/50 p-2 ">
                        <div className="text-zinc-500 text-[10px]">Est. Tokens</div>
                        <div className="text-white font-medium">{stats.estimatedTokens.toLocaleString()}</div>
                    </div>

                    <div className="bg-zinc-800/50 p-2 ">
                        <div className="text-zinc-500 text-[10px]">Response Ratio</div>
                        <div className="text-white font-medium">{ratio}x</div>
                    </div>
                </div>
            )}
        </div>
    );
}
