import { useState, useEffect } from 'react';
import { browserAPI } from '../../shared/browser-api';
import type { ShortcutType } from '../../shared/types';

type ShortcutsPanelProps = {
    isOnChatGPT: boolean;
};

/**
 * Keyboard shortcuts panel component
 */
export function ShortcutsPanel({ isOnChatGPT }: ShortcutsPanelProps) {
    const [shortcuts, setShortcuts] = useState<ShortcutType[]>([]);
    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => {
        if (!isOnChatGPT) return;

        const fetchShortcuts = async () => {
            const tabs = await browserAPI.tabs.query({ active: true, currentWindow: true });
            const tab = tabs[0];
            if (tab?.id) {
                const response = await browserAPI.tabs.sendMessage(tab.id, { type: 'getShortcuts' });
                if (response?.shortcuts) {
                    setShortcuts(response.shortcuts);
                }
            }
        };

        fetchShortcuts();
    }, [isOnChatGPT]);

    if (!isOnChatGPT) return null;

    return (
        <div className="border-t border-zinc-800 pt-3 mt-3">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between text-xs font-medium text-zinc-400 hover:text-zinc-300 transition-colors"
            >
                <span>Keyboard Shortcuts</span>
                <span className="text-[10px]">{isExpanded ? '▲' : '▼'}</span>
            </button>

            {isExpanded && (
                <div className="mt-2 space-y-1">
                    {shortcuts.map((shortcut, i) => (
                        <div
                            key={i}
                            className="flex items-center justify-between py-1.5 text-xs"
                        >
                            <span className="text-zinc-400">{shortcut.description}</span>
                            <kbd className="px-1.5 py-0.5 bg-zinc-800  text-zinc-300 font-mono text-[10px] border border-zinc-700">
                                {shortcut.modifiers.length > 0 && `${shortcut.modifiers.join('+')}+`}{shortcut.key}
                            </kbd>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
