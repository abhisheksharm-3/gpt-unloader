import { useState, useEffect, useCallback } from 'react';
import { browserAPI } from '../../shared/browser-api';
import type { SettingsType } from '../../shared/types';
import { DEFAULT_SETTINGS } from '../../shared/constants';

/**
 * Hook for managing extension settings (enabled state and buffer size)
 */
export function useSettings() {
    const [isEnabled, setIsEnabled] = useState(DEFAULT_SETTINGS.ENABLED);
    const [bufferSize, setBufferSize] = useState(DEFAULT_SETTINGS.BUFFER_SIZE);

    useEffect(() => {
        browserAPI.storage.local
            .get(['enabled', 'bufferSize'])
            .then((result: Partial<SettingsType>) => {
                if (result.enabled !== undefined) setIsEnabled(result.enabled);
                if (result.bufferSize !== undefined) setBufferSize(result.bufferSize);
            });
    }, []);

    const handleToggle = useCallback(async () => {
        const newValue = !isEnabled;
        setIsEnabled(newValue);
        await browserAPI.storage.local.set({ enabled: newValue });
    }, [isEnabled]);

    const handleBufferChange = useCallback(async (value: number) => {
        setBufferSize(value);
        await browserAPI.storage.local.set({ bufferSize: value });
    }, []);

    return {
        isEnabled,
        bufferSize,
        handleToggle,
        handleBufferChange,
    };
}
