type BufferSliderPropsType = {
    bufferSize: number;
    onBufferChange: (value: number) => void;
};

/**
 * Slider control for adjusting the virtualization buffer size
 */
export function BufferSlider({ bufferSize, onBufferChange }: BufferSliderPropsType) {
    return (
        <div className="border border-neutral-800 p-3 mb-4">
            <div className="flex items-center justify-between mb-2">
                <span className="text-neutral-500 text-xs uppercase tracking-wider">Buffer</span>
                <span className="text-neutral-300 text-xs">{bufferSize} messages</span>
            </div>
            <input
                type="range"
                min="1"
                max="10"
                value={bufferSize}
                onChange={(e) => onBufferChange(Number(e.target.value))}
                className="w-full h-1 bg-neutral-800 appearance-none cursor-pointer
          [&::-webkit-slider-thumb]:appearance-none
          [&::-webkit-slider-thumb]:w-3
          [&::-webkit-slider-thumb]:h-3
          [&::-webkit-slider-thumb]:bg-neutral-400
          [&::-webkit-slider-thumb]:hover:bg-neutral-300
          [&::-webkit-slider-thumb]:transition-colors
          [&::-moz-range-thumb]:w-3
          [&::-moz-range-thumb]:h-3
          [&::-moz-range-thumb]:bg-neutral-400
          [&::-moz-range-thumb]:border-0"
            />
            <div className="flex justify-between text-xs text-neutral-700 mt-1">
                <span>Aggressive</span>
                <span>Conservative</span>
            </div>
        </div>
    );
}
