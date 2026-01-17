import { useState, useEffect } from 'react';
import { useActiveTab } from '../hooks/useActiveTab';
import type { BookmarkType } from '../../shared/types';

type BookmarksPanelPropsType = {
    isOnChatGPT: boolean;
};

/**
 * Bookmarks panel showing saved message bookmarks
 */
export function BookmarksPanel({ isOnChatGPT }: BookmarksPanelPropsType) {
    const [bookmarks, setBookmarks] = useState<BookmarkType[]>([]);
    const [isExpanded, setIsExpanded] = useState(false);
    const { sendMessage } = useActiveTab();

    useEffect(() => {
        if (!isOnChatGPT) return;

        sendMessage<{ bookmarks: BookmarkType[] }>({ type: 'getBookmarks' }).then((response) => {
            if (response?.bookmarks) {
                setBookmarks(response.bookmarks);
            }
        });
    }, [isOnChatGPT, sendMessage]);

    const handleScrollTo = async (messageIndex: number) => {
        await sendMessage({ type: 'scrollToMessage', messageIndex });
        window.close();
    };

    if (!isOnChatGPT) return null;

    return (
        <div className="border-t border-zinc-800 pt-3 mt-3">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between text-xs font-medium text-zinc-400 hover:text-zinc-300 transition-colors"
            >
                <span>Bookmarks ({bookmarks.length})</span>
                <span className="text-[10px]">{isExpanded ? '▲' : '▼'}</span>
            </button>

            {isExpanded && (
                <div className="mt-2 space-y-1 max-h-32 overflow-y-auto">
                    {bookmarks.length === 0 ? (
                        <div className="text-zinc-500 text-xs text-center py-2">
                            No bookmarks yet. Click ☆ on messages to bookmark.
                        </div>
                    ) : (
                        bookmarks.map((bookmark) => (
                            <button
                                key={bookmark.id}
                                onClick={() => handleScrollTo(bookmark.messageIndex)}
                                className="w-full p-2 bg-zinc-800/50 hover:bg-zinc-700/50 text-left transition-colors"
                            >
                                <div className="text-zinc-400 text-[10px]">
                                    {bookmark.role === 'user' ? 'You' : 'ChatGPT'}
                                </div>
                                <div className="text-zinc-300 text-xs line-clamp-2">
                                    {bookmark.preview}
                                </div>
                            </button>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
