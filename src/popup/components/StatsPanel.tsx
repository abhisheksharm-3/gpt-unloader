import type { StatsType } from '../../shared/types';
import { formatBytes } from '../../lib/format-bytes';

type StatsPanelPropsType = {
    stats: StatsType;
    isOnChatGPT: boolean;
};

/**
 * Panel displaying performance statistics
 */
export function StatsPanel({ stats, isOnChatGPT }: StatsPanelPropsType) {
    const memoryReduction = stats.total > 0
        ? Math.round((stats.collapsed / stats.total) * 100)
        : 0;

    if (!isOnChatGPT || stats.total === 0) {
        return (
            <div className="border border-neutral-800 border-dashed p-4 mb-4 text-center">
                <div className="text-neutral-600 text-xs">
                    {isOnChatGPT ? 'No messages detected' : 'Open ChatGPT to see stats'}
                </div>
            </div>
        );
    }

    return (
        <div className="border border-neutral-800 p-3 mb-4">
            <div className="text-neutral-500 text-xs uppercase tracking-wider mb-3">Performance</div>

            <div className="grid grid-cols-3 gap-2 text-center mb-3">
                <div>
                    <div className="text-lg font-semibold text-neutral-100">{stats.total}</div>
                    <div className="text-xs text-neutral-600">Total</div>
                </div>
                <div>
                    <div className="text-lg font-semibold text-emerald-400">{stats.active}</div>
                    <div className="text-xs text-neutral-600">Active</div>
                </div>
                <div>
                    <div className="text-lg font-semibold text-amber-400">{stats.collapsed}</div>
                    <div className="text-xs text-neutral-600">Unloaded</div>
                </div>
            </div>

            <div className="border-t border-neutral-800 pt-3 space-y-2">
                <div className="flex justify-between items-center">
                    <span className="text-neutral-500 text-xs">Memory saved</span>
                    <span className="text-emerald-400 font-medium text-xs">{formatBytes(stats.savedBytes)}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-neutral-500 text-xs">DOM nodes</span>
                    <span className="text-neutral-300 font-medium text-xs">{stats.domNodes.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-neutral-500 text-xs">Reduction</span>
                    <span className="text-emerald-400 font-medium text-xs">~{memoryReduction}%</span>
                </div>
            </div>
        </div>
    );
}
