import { useState, useEffect, useCallback } from 'react';
import { browserAPI } from '../../shared/browser-api';
import { DEFAULT_PREFERENCES } from '../../shared/constants';
import type { UserPreferencesType } from '../../shared/types';

/**
 * Hook for managing user preferences for toggleable features
 */
export function usePreferences() {
    const [preferences, setPreferences] = useState<UserPreferencesType>(DEFAULT_PREFERENCES);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        browserAPI.storage.local.get(['preferences']).then((result) => {
            if (result.preferences) {
                setPreferences({ ...DEFAULT_PREFERENCES, ...result.preferences });
            }
            setIsLoaded(true);
        });

        const handleChange = (changes: { [key: string]: chrome.storage.StorageChange }) => {
            if (changes.preferences?.newValue) {
                setPreferences({ ...DEFAULT_PREFERENCES, ...(changes.preferences.newValue as UserPreferencesType) });
            }
        };

        browserAPI.storage.onChanged.addListener(handleChange);
        return () => browserAPI.storage.onChanged.removeListener(handleChange);
    }, []);

    const updatePreference = useCallback(
        <K extends keyof UserPreferencesType>(key: K, value: UserPreferencesType[K]) => {
            const newPreferences = { ...preferences, [key]: value };
            setPreferences(newPreferences);
            browserAPI.storage.local.set({ preferences: newPreferences });
        },
        [preferences]
    );

    return { preferences, updatePreference, isLoaded };
}
