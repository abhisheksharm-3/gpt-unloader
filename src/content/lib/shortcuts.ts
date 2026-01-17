import type { ShortcutType } from '../../shared/types';

/**
 * Available keyboard shortcuts
 */
export const SHORTCUTS: ShortcutType[] = [
    {
        key: 'U',
        modifiers: ['Alt'],
        action: 'toggle',
        description: 'Toggle GPT Unloader on/off',
    },
    {
        key: 'E',
        modifiers: ['Alt'],
        action: 'export',
        description: 'Export conversation',
    },
    {
        key: 'F',
        modifiers: ['Alt'],
        action: 'search',
        description: 'Search in conversation',
    },
    {
        key: 'Escape',
        modifiers: [],
        action: 'closeSearch',
        description: 'Close search',
    },
];

/**
 * Gets all available shortcuts
 */
export function getShortcuts(): ShortcutType[] {
    return SHORTCUTS;
}

/**
 * Formats a shortcut for display
 */
export function formatShortcut(shortcut: ShortcutType): string {
    const parts = [...shortcut.modifiers, shortcut.key];
    return parts.join('+');
}
