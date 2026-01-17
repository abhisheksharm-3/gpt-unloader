import { useState, useEffect } from 'react';
import { browserAPI } from '../../shared/browser-api';
import type { StatsType } from '../../shared/types';
import { useActiveTab } from './useActiveTab';

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
    const { tabId, isOnChatGPT, sendMessage } = useActiveTab();

    useEffect(() => {
        const handleMessage = (message: { type: string; data: StatsType }) => {
            if (message.type === 'stats') {
                setStats(message.data);
            }
        };

        browserAPI.runtime.onMessage.addListener(handleMessage);

        if (tabId && isOnChatGPT) {
            sendMessage<{ stats: StatsType }>({ type: 'getStats' }).then((response) => {
                if (response?.stats) {
                    setStats(response.stats);
                }
            });
        }

        return () => {
            browserAPI.runtime.onMessage.removeListener(handleMessage);
        };
    }, [tabId, isOnChatGPT, sendMessage]);

    return { stats, isOnChatGPT };
}
