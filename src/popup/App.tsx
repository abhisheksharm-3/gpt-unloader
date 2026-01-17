import { useState } from 'react';
import { useSettings } from './hooks/useSettings';
import { useStats } from './hooks/useStats';
import { useActiveTab } from './hooks/useActiveTab';
import { generateSummary } from '../lib/generate-summary';
import { StatusToggle } from './components/StatusToggle';
import { StatsPanel } from './components/StatsPanel';
import { BufferSlider } from './components/BufferSlider';
import { Footer } from './components/Footer';
import { SummaryEditor } from './components/SummaryEditor';
import { NewChatButton } from './components/NewChatButton';
import { ExportPanel } from './components/ExportPanel';
import { SearchBar } from './components/SearchBar';
import { ConversationStats } from './components/ConversationStats';
import { ShortcutsPanel } from './components/ShortcutsPanel';
import type { ConversationMessageType } from '../shared/types';

type ActiveTabType = 'main' | 'tools';

/**
 * Main popup application component
 */
function App() {
    const { isEnabled, bufferSize, handleToggle, handleBufferChange } = useSettings();
    const { stats, isOnChatGPT } = useStats();
    const { sendMessage } = useActiveTab();
    const [isShowingSummary, setIsShowingSummary] = useState(false);
    const [summaryText, setSummaryText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<ActiveTabType>('main');

    const handleNewChatWithSummary = async () => {
        setIsLoading(true);
        const response = await sendMessage<{ conversation: ConversationMessageType[] }>({ type: 'getConversation' });
        if (response?.conversation) {
            const summary = generateSummary(response.conversation);
            setSummaryText(summary);
            setIsShowingSummary(true);
        }
        setIsLoading(false);
    };

    const handleStartNewChat = async () => {
        await sendMessage({ type: 'startNewChat', summary: summaryText });
        setIsShowingSummary(false);
        window.close();
    };

    if (isShowingSummary) {
        return (
            <SummaryEditor
                summaryText={summaryText}
                onSummaryChange={setSummaryText}
                onCancel={() => setIsShowingSummary(false)}
                onStartNewChat={handleStartNewChat}
            />
        );
    }

    const shouldShowNewChatButton = isOnChatGPT && stats.total > 5;

    return (
        <div className="w-80 bg-neutral-950 text-neutral-100 p-4 font-mono text-sm">
            <div className="border-b border-neutral-800 pb-3 mb-4">
                <h1 className="text-base font-semibold tracking-tight">GPT Unloader</h1>
                <p className="text-neutral-500 text-xs mt-1">DOM virtualization for ChatGPT</p>
            </div>

            {isOnChatGPT && (
                <div className="flex gap-1 mb-4">
                    <button
                        onClick={() => setActiveTab('main')}
                        className={`flex-1 py-1.5 text-xs transition-colors ${activeTab === 'main'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                            }`}
                    >
                        Performance
                    </button>
                    <button
                        onClick={() => setActiveTab('tools')}
                        className={`flex-1 py-1.5 text-xs transition-colors ${activeTab === 'tools'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                            }`}
                    >
                        Tools
                    </button>
                </div>
            )}

            {activeTab === 'main' && (
                <>
                    <StatusToggle isEnabled={isEnabled} onToggle={handleToggle} />
                    <StatsPanel stats={stats} isOnChatGPT={isOnChatGPT} />
                    <BufferSlider bufferSize={bufferSize} onBufferChange={handleBufferChange} />

                    {shouldShowNewChatButton && (
                        <NewChatButton isLoading={isLoading} onClick={handleNewChatWithSummary} />
                    )}
                </>
            )}

            {activeTab === 'tools' && (
                <>
                    <SearchBar isOnChatGPT={isOnChatGPT} />
                    <ExportPanel isOnChatGPT={isOnChatGPT} />
                    <ConversationStats isOnChatGPT={isOnChatGPT} />
                    <ShortcutsPanel isOnChatGPT={isOnChatGPT} />
                </>
            )}

            <Footer />
        </div>
    );
}

export default App;
