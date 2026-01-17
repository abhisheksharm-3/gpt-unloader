import { usePreferences } from '../hooks/usePreferences';

type ToggleRowPropsType = {
    label: string;
    description: string;
    isChecked: boolean;
    onChange: (checked: boolean) => void;
};

function ToggleRow({ label, description, isChecked, onChange }: ToggleRowPropsType) {
    return (
        <div className="flex items-center justify-between py-2">
            <div>
                <div className="text-zinc-300 text-xs">{label}</div>
                <div className="text-zinc-500 text-[10px]">{description}</div>
            </div>
            <button
                onClick={() => onChange(!isChecked)}
                className={`w-10 h-5 rounded-full transition-colors relative ${isChecked ? 'bg-emerald-600' : 'bg-zinc-700'
                    }`}
            >
                <div
                    className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${isChecked ? 'translate-x-5' : 'translate-x-0.5'
                        }`}
                />
            </button>
        </div>
    );
}

/**
 * Settings panel with toggleable feature preferences
 */
export function SettingsPanel() {
    const { preferences, updatePreference } = usePreferences();

    return (
        <div className="space-y-1">
            <h3 className="text-xs font-medium text-zinc-400 mb-3">Feature Settings</h3>

            <ToggleRow
                label="Message Timestamps"
                description="Show when messages were sent"
                isChecked={preferences.showTimestamps}
                onChange={(v) => updatePreference('showTimestamps', v)}
            />

            <ToggleRow
                label="Reading Progress"
                description="Resume where you left off"
                isChecked={preferences.showReadingProgress}
                onChange={(v) => updatePreference('showReadingProgress', v)}
            />

            <ToggleRow
                label="Context Menu"
                description="Right-click quick actions"
                isChecked={preferences.enableContextMenu}
                onChange={(v) => updatePreference('enableContextMenu', v)}
            />
        </div>
    );
}
