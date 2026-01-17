type StatusTogglePropsType = {
    isEnabled: boolean;
    onToggle: () => void;
};

/**
 * Toggle button for enabling/disabling the extension
 */
export function StatusToggle({ isEnabled, onToggle }: StatusTogglePropsType) {
    return (
        <div className="flex items-center justify-between mb-4">
            <div>
                <span className="text-neutral-400">Status</span>
                <span className="text-neutral-600 text-xs ml-2">(Alt+U)</span>
            </div>
            <button
                onClick={onToggle}
                className={`px-3 py-1 text-xs font-medium transition-colors border ${isEnabled
                        ? 'bg-emerald-950 text-emerald-400 border-emerald-800 hover:bg-emerald-900'
                        : 'bg-neutral-900 text-neutral-500 border-neutral-800 hover:bg-neutral-800'
                    }`}
            >
                {isEnabled ? 'ACTIVE' : 'PAUSED'}
            </button>
        </div>
    );
}
