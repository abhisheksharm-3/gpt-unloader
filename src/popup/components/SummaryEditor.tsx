type SummaryEditorPropsType = {
    summaryText: string;
    onSummaryChange: (text: string) => void;
    onCancel: () => void;
    onStartNewChat: () => void;
};

/**
 * Editor view for modifying the conversation summary before starting a new chat
 */
export function SummaryEditor({
    summaryText,
    onSummaryChange,
    onCancel,
    onStartNewChat,
}: SummaryEditorPropsType) {
    return (
        <div className="w-96 bg-neutral-950 text-neutral-100 p-4 font-mono text-sm">
            <div className="border-b border-neutral-800 pb-3 mb-4">
                <h1 className="text-base font-semibold tracking-tight">New Chat with Summary</h1>
                <p className="text-neutral-500 text-xs mt-1">Edit the summary before starting</p>
            </div>

            <textarea
                value={summaryText}
                onChange={(e) => onSummaryChange(e.target.value)}
                className="w-full h-48 bg-neutral-900 border border-neutral-800 p-3 text-xs resize-none focus:outline-none focus:border-neutral-700"
                placeholder="Summary will appear here..."
            />

            <div className="flex gap-2 mt-4">
                <button
                    onClick={onCancel}
                    className="flex-1 px-3 py-2 text-xs font-medium bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 transition-colors"
                >
                    Cancel
                </button>
                <button
                    onClick={onStartNewChat}
                    className="flex-1 px-3 py-2 text-xs font-medium bg-emerald-950 text-emerald-400 border border-emerald-800 hover:bg-emerald-900 transition-colors"
                >
                    Start New Chat
                </button>
            </div>
        </div>
    );
}
