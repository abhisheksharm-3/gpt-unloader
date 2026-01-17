import { useState, useEffect, useCallback } from 'react';
import { browserAPI } from '../../shared/browser-api';
import type { MessageType } from '../../shared/types';

/**
 * Hook for obtaining the active ChatGPT tab and sending messages
 */
export function useActiveTab() {
    const [tabId, setTabId] = useState<number | null>(null);
    const [isOnChatGPT, setIsOnChatGPT] = useState(false);

    useEffect(() => {
        browserAPI.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
            const tab = tabs[0];
            if (tab?.id && (tab.url?.includes('chatgpt.com') || tab.url?.includes('chat.openai.com'))) {
                setTabId(tab.id);
                setIsOnChatGPT(true);
            }
        });
    }, []);

    const sendMessage = useCallback(
        async <T>(message: MessageType): Promise<T | null> => {
            if (!tabId) return null;
            return browserAPI.tabs.sendMessage(tabId, message);
        },
        [tabId]
    );

    return { tabId, isOnChatGPT, sendMessage };
}
