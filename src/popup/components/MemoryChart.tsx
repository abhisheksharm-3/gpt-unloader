import { useState, useEffect, useRef } from 'react';
import { useActiveTab } from '../hooks/useActiveTab';
import type { MemoryDataPointType } from '../../shared/types';

type MemoryChartPropsType = {
    isOnChatGPT: boolean;
};

/**
 * Mini canvas-based memory chart for the popup
 */
export function MemoryChart({ isOnChatGPT }: MemoryChartPropsType) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [history, setHistory] = useState<MemoryDataPointType[]>([]);
    const { sendMessage } = useActiveTab();

    useEffect(() => {
        if (!isOnChatGPT) return;

        const fetchHistory = async () => {
            const response = await sendMessage<{ history: MemoryDataPointType[] }>({ type: 'getMemoryHistory' });
            if (response?.history) {
                setHistory(response.history);
            }
        };

        fetchHistory();
        const interval = setInterval(fetchHistory, 2000);
        return () => clearInterval(interval);
    }, [isOnChatGPT, sendMessage]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || history.length < 2) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const width = canvas.width;
        const height = canvas.height;
        const padding = 4;

        ctx.clearRect(0, 0, width, height);

        const values = history.map((h) => h.savedBytes);
        const maxValue = Math.max(...values, 1);
        const stepX = (width - padding * 2) / (history.length - 1);

        ctx.beginPath();
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        history.forEach((point, i) => {
            const x = padding + i * stepX;
            const y = height - padding - (point.savedBytes / maxValue) * (height - padding * 2);

            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });

        ctx.stroke();

        ctx.beginPath();
        ctx.lineTo(padding + (history.length - 1) * stepX, height - padding);
        ctx.lineTo(padding, height - padding);
        ctx.closePath();
        ctx.fillStyle = 'rgba(16, 185, 129, 0.1)';
        ctx.fill();
    }, [history]);

    if (!isOnChatGPT || history.length < 2) return null;

    const currentSaved = history[history.length - 1]?.savedBytes ?? 0;
    const formatBytes = (bytes: number): string => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    return (
        <div className="border border-zinc-800 p-2 mb-3">
            <div className="flex justify-between items-center mb-1">
                <span className="text-zinc-500 text-[10px] uppercase tracking-wider">Memory Saved</span>
                <span className="text-emerald-400 text-xs font-mono">{formatBytes(currentSaved)}</span>
            </div>
            <canvas
                ref={canvasRef}
                width={200}
                height={40}
                className="w-full"
            />
        </div>
    );
}
