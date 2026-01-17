import { useState, useEffect, useCallback } from 'react';
import { browserAPI } from '../../shared/browser-api';
import type { StatsType } from '../../shared/types';

const INITIAL_STATS: StatsType = {
    total: 0,
    active: 0,
    collapsed: 0,
    savedBytes: 0,
    domNodes: 0,
};

/**
 * Hook for managing stats fetching and real-time updates from content script
 */
export function useStats() {
    const [stats, setStats] = useState<StatsType>(INITIAL_STATS);
    const [isOnChatGPT, setIsOnChatGPT] = useState(false);

    const fetchStats = useCallback(async () => {
        const tabs = await browserAPI.tabs.query({ active: true, currentWindow: true });
        const tab = tabs[0];
        if (tab?.id && (tab.url?.includes('chatgpt.com') || tab.url?.includes('chat.openai.com'))) {
            setIsOnChatGPT(true);
            const response = await browserAPI.tabs.sendMessage(tab.id, { type: 'getStats' });
            if (response?.stats) {
                setStats(response.stats);
            }
        }
    }, []);

    useEffect(() => {
        const handleMessage = (message: { type: string; data: StatsType }) => {
            if (message.type === 'stats') {
                setStats(message.data);
            }
        };

        browserAPI.runtime.onMessage.addListener(handleMessage);

        // Fetch initial stats on mount
        browserAPI.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
            const tab = tabs[0];
            if (tab?.id && (tab.url?.includes('chatgpt.com') || tab.url?.includes('chat.openai.com'))) {
                setIsOnChatGPT(true);
                browserAPI.tabs.sendMessage(tab.id, { type: 'getStats' }).then((response) => {
                    if (response?.stats) {
                        setStats(response.stats);
                    }
                });
            }
        });

        return () => {
            browserAPI.runtime.onMessage.removeListener(handleMessage);
        };
    }, []);

    return { stats, isOnChatGPT, fetchStats };
}
