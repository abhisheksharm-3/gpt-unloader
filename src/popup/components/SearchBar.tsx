import { useState } from 'react';
import { useActiveTab } from '../hooks/useActiveTab';
import type { SearchResultType } from '../../shared/types';

type SearchBarPropsType = {
    isOnChatGPT: boolean;
};

/**
 * Search bar component with results display
 */
export function SearchBar({ isOnChatGPT }: SearchBarPropsType) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResultType[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const { sendMessage } = useActiveTab();

    const handleSearch = async () => {
        if (!query.trim()) {
            setResults([]);
            return;
        }

        setIsSearching(true);
        const response = await sendMessage<{ results: SearchResultType[] }>({ type: 'search', query });
        setResults(response?.results ?? []);
        setIsSearching(false);
    };

    const handleClear = async () => {
        setQuery('');
        setResults([]);
        await sendMessage({ type: 'clearSearch' });
    };

    if (!isOnChatGPT) return null;

    return (
        <div className="border-t border-zinc-800 pt-3 mt-3">
            <h3 className="text-xs font-medium text-zinc-400 mb-2">Search Conversation</h3>
            <div className="flex gap-2 mb-2">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="Search messages..."
                    className="flex-1 px-2 py-1.5 bg-zinc-800 border border-zinc-700  text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                />
                <button
                    onClick={handleSearch}
                    disabled={isSearching}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs  transition-colors disabled:opacity-50"
                >
                    {isSearching ? '...' : 'Find'}
                </button>
                {results.length > 0 && (
                    <button
                        onClick={handleClear}
                        className="px-2 py-1.5 bg-zinc-700 hover:bg-zinc-600 text-zinc-300 text-xs  transition-colors"
                    >
                        ✕
                    </button>
                )}
            </div>

            {results.length > 0 && (
                <div className="max-h-32 overflow-y-auto space-y-1">
                    {results.map((result, i) => (
                        <div
                            key={i}
                            className="p-2 bg-zinc-800/50  text-xs border-l-2 border-emerald-500"
                        >
                            <div className="text-zinc-400 text-[10px] mb-1">
                                {result.role === 'user' ? 'You' : 'ChatGPT'} • {result.matchCount} match{result.matchCount > 1 ? 'es' : ''}
                            </div>
                            <div className="text-zinc-300 line-clamp-2">{result.preview}</div>
                        </div>
                    ))}
                </div>
            )}

            {query && results.length === 0 && !isSearching && (
                <div className="text-xs text-zinc-500 text-center py-2">No results found</div>
            )}
        </div>
    );
}
