import type { StatsType } from '../../shared/types';
import { formatBytes } from '../../lib/format-bytes';

type PerformanceChartProps = {
    stats: StatsType;
    isOnChatGPT: boolean;
};

/**
 * Performance visualization component with memory usage bar chart
 */
export function PerformanceChart({ stats, isOnChatGPT }: PerformanceChartProps) {
    if (!isOnChatGPT || stats.total === 0) return null;

    const activePercent = Math.round((stats.active / stats.total) * 100);
    const collapsedPercent = 100 - activePercent;
    const reduction = stats.total > 0 ? Math.round((stats.collapsed / stats.total) * 100) : 0;

    return (
        <div className="border-t border-zinc-800 pt-3 mt-3">
            <h3 className="text-xs font-medium text-zinc-400 mb-2">Performance Overview</h3>

            <div className="space-y-3">
                <div>
                    <div className="flex justify-between text-[10px] text-zinc-500 mb-1">
                        <span>Memory Optimization</span>
                        <span>{formatBytes(stats.savedBytes)} saved</span>
                    </div>
                    <div className="h-2 bg-zinc-800  overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-300"
                            style={{ width: `${reduction}%` }}
                        />
                    </div>
                </div>

                <div>
                    <div className="flex justify-between text-[10px] text-zinc-500 mb-1">
                        <span>Message Status</span>
                        <span>{stats.active} active / {stats.collapsed} virtualized</span>
                    </div>
                    <div className="h-2 bg-zinc-800  overflow-hidden flex">
                        <div
                            className="h-full bg-blue-500 transition-all duration-300"
                            style={{ width: `${activePercent}%` }}
                        />
                        <div
                            className="h-full bg-emerald-500 transition-all duration-300"
                            style={{ width: `${collapsedPercent}%` }}
                        />
                    </div>
                    <div className="flex justify-between text-[10px] mt-1">
                        <span className="text-blue-400">● Active</span>
                        <span className="text-emerald-400">● Virtualized</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="bg-zinc-800/50 p-2 ">
                        <div className="text-lg font-bold text-emerald-400">{reduction}%</div>
                        <div className="text-[10px] text-zinc-500">DOM Reduction</div>
                    </div>
                    <div className="bg-zinc-800/50 p-2 ">
                        <div className="text-lg font-bold text-blue-400">{stats.domNodes.toLocaleString()}</div>
                        <div className="text-[10px] text-zinc-500">DOM Nodes</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
