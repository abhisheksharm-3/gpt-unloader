import { useState, useEffect } from 'react';
import { browserAPI } from '../../shared/browser-api';
import type { ChatTabType } from '../../shared/types';

/**
 * Tabs panel showing all open ChatGPT tabs for multi-tab sync
 */
export function TabsPanel() {
    const [tabs, setTabs] = useState<ChatTabType[]>([]);
    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => {
        browserAPI.runtime.sendMessage({ type: 'getChatGPTTabs' }).then((response: { tabs: ChatTabType[] } | undefined) => {
            if (response?.tabs) {
                setTabs(response.tabs);
            }
        }).catch(() => { });
    }, []);

    const handleFocusTab = (tabId: number) => {
        browserAPI.runtime.sendMessage({ type: 'focusTab', tabId });
        window.close();
    };

    const handleOptimizeAll = () => {
        browserAPI.runtime.sendMessage({ type: 'optimizeAllTabs' });
    };

    if (tabs.length <= 1) return null;

    return (
        <div className="border-t border-zinc-800 pt-3 mt-3">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between text-xs font-medium text-zinc-400 hover:text-zinc-300 transition-colors"
            >
                <span>ChatGPT Tabs ({tabs.length})</span>
                <span className="text-[10px]">{isExpanded ? '▲' : '▼'}</span>
            </button>

            {isExpanded && (
                <div className="mt-2 space-y-1">
                    {tabs.map((tab) => (
                        <button
                            key={tab.tabId}
                            onClick={() => handleFocusTab(tab.tabId)}
                            className="w-full p-2 bg-zinc-800/50 hover:bg-zinc-700/50 text-left transition-colors flex items-center justify-between"
                        >
                            <span className="text-zinc-300 text-xs truncate flex-1">
                                {tab.title.replace(' | ChatGPT', '')}
                            </span>
                            {tab.messageCount > 0 && (
                                <span className="text-zinc-500 text-[10px] ml-2">
                                    {tab.messageCount} msgs
                                </span>
                            )}
                        </button>
                    ))}

                    <button
                        onClick={handleOptimizeAll}
                        className="w-full py-1.5 mt-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs transition-colors"
                    >
                        ⚡ Optimize All Tabs
                    </button>
                </div>
            )}
        </div>
    );
}
