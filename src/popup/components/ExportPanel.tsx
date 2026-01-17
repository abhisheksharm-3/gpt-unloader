import { browserAPI } from '../../shared/browser-api';
import type { ExportFormatType } from '../../shared/types';

type ExportPanelProps = {
    isOnChatGPT: boolean;
};

/**
 * Export panel with buttons for different export formats
 */
export function ExportPanel({ isOnChatGPT }: ExportPanelProps) {
    const handleExport = async (format: ExportFormatType) => {
        const tabs = await browserAPI.tabs.query({ active: true, currentWindow: true });
        const tab = tabs[0];
        if (tab?.id) {
            await browserAPI.tabs.sendMessage(tab.id, { type: 'exportConversation', format });
        }
    };

    if (!isOnChatGPT) return null;

    return (
        <div className="border-t border-zinc-800 pt-3 mt-3">
            <h3 className="text-xs font-medium text-zinc-400 mb-2">Export Conversation</h3>
            <div className="flex gap-2">
                <button
                    onClick={() => handleExport('markdown')}
                    className="flex-1 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs  transition-colors"
                >
                    Markdown
                </button>
                <button
                    onClick={() => handleExport('json')}
                    className="flex-1 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs  transition-colors"
                >
                    JSON
                </button>
                <button
                    onClick={() => handleExport('text')}
                    className="flex-1 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs  transition-colors"
                >
                    Text
                </button>
            </div>
        </div>
    );
}
