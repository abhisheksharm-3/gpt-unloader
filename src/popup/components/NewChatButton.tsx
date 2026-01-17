type NewChatButtonPropsType = {
    isLoading: boolean;
    onClick: () => void;
};

/**
 * Button to initiate a new chat with conversation summary
 */
export function NewChatButton({ isLoading, onClick }: NewChatButtonPropsType) {
    return (
        <button
            onClick={onClick}
            disabled={isLoading}
            className="w-full px-3 py-2 text-xs font-medium bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 hover:border-neutral-700 transition-colors mb-4 flex items-center justify-center gap-2"
        >
            {isLoading ? (
                <span className="text-neutral-500">Loading...</span>
            ) : (
                <>
                    <span className="text-amber-400">⚡</span>
                    <span>New Chat with Summary</span>
                </>
            )}
        </button>
    );
}
