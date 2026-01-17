import { useState, useEffect } from 'react';
import { useActiveTab } from '../hooks/useActiveTab';
import { MODEL_PRICING } from '../../shared/constants';
import type { ConversationStatsType } from '../../shared/types';

type ConversationStatsPropsType = {
    isOnChatGPT: boolean;
};

type ModelKeyType = keyof typeof MODEL_PRICING;

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

// Get all available models from pricing
const ALL_MODELS = Object.keys(MODEL_PRICING) as ModelKeyType[];

/**
 * Calculates estimated API cost
 */
function calculateCost(tokens: number, model: ModelKeyType): { input: number; output: number; total: number } {
    const pricing = MODEL_PRICING[model];
    // Assume 30% input, 70% output for typical conversation
    const inputTokens = tokens * 0.3;
    const outputTokens = tokens * 0.7;

    const inputCost = (inputTokens / 1_000_000) * pricing.input;
    const outputCost = (outputTokens / 1_000_000) * pricing.output;

    return {
        input: inputCost,
        output: outputCost,
        total: inputCost + outputCost,
    };
}

/**
 * Conversation statistics display component with API cost estimator
 */
export function ConversationStats({ isOnChatGPT }: ConversationStatsPropsType) {
    const [stats, setStats] = useState<ConversationStatsType>(INITIAL_STATS);
    const [isExpanded, setIsExpanded] = useState(false);
    const [selectedModel, setSelectedModel] = useState<ModelKeyType>('gpt-4o');
    const { sendMessage } = useActiveTab();

    useEffect(() => {
        if (!isOnChatGPT) return;

        sendMessage<{ stats: ConversationStatsType }>({ type: 'getConversationStats' }).then((response) => {
            if (response?.stats) {
                setStats(response.stats);
            }
        });
    }, [isOnChatGPT, sendMessage]);

    if (!isOnChatGPT) return null;

    const ratio = stats.userMessages > 0
        ? (stats.assistantMessages / stats.userMessages).toFixed(1)
        : '0';

    const cost = calculateCost(stats.estimatedTokens, selectedModel);

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
                <div className="mt-2 space-y-2">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-zinc-800/50 p-2">
                            <div className="text-zinc-500 text-[10px]">Messages</div>
                            <div className="text-white font-medium">{stats.totalMessages}</div>
                            <div className="text-zinc-500 text-[10px] mt-1">
                                You: {stats.userMessages} • AI: {stats.assistantMessages}
                            </div>
                        </div>

                        <div className="bg-zinc-800/50 p-2">
                            <div className="text-zinc-500 text-[10px]">Words</div>
                            <div className="text-white font-medium">{stats.totalWords.toLocaleString()}</div>
                            <div className="text-zinc-500 text-[10px] mt-1">
                                You: {stats.userWords.toLocaleString()} • AI: {stats.assistantWords.toLocaleString()}
                            </div>
                        </div>

                        <div className="bg-zinc-800/50 p-2">
                            <div className="text-zinc-500 text-[10px]">Est. Tokens</div>
                            <div className="text-white font-medium">{stats.estimatedTokens.toLocaleString()}</div>
                        </div>

                        <div className="bg-zinc-800/50 p-2">
                            <div className="text-zinc-500 text-[10px]">Response Ratio</div>
                            <div className="text-white font-medium">{ratio}x</div>
                        </div>
                    </div>

                    {/* API Cost Estimator */}
                    <div className="bg-zinc-800/50 p-2">
                        <div className="flex items-center justify-between mb-2">
                            <div className="text-zinc-500 text-[10px]">Estimated API Cost</div>
                            <select
                                value={selectedModel}
                                onChange={(e) => setSelectedModel(e.target.value as ModelKeyType)}
                                className="bg-zinc-700 text-zinc-300 text-[10px] px-1.5 py-0.5 border-none outline-none cursor-pointer"
                            >
                                {ALL_MODELS.map((model) => (
                                    <option key={model} value={model}>
                                        {model}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="text-emerald-400 font-medium text-lg">
                            ${cost.total.toFixed(4)}
                        </div>
                        <div className="text-zinc-500 text-[10px] mt-1">
                            Input: ${cost.input.toFixed(4)} • Output: ${cost.output.toFixed(4)}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
