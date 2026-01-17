/**
 * Shared types for GPT Unloader extension
 */

/** Runtime statistics for DOM virtualization */
export type StatsType = {
    total: number;
    active: number;
    collapsed: number;
    savedBytes: number;
    domNodes: number;
};

/** A single message extracted from the conversation */
export type ConversationMessageType = {
    role: string;
    content: string;
    timestamp?: number;
};

/** State tracking for a virtualized message element */
export type MessageStateType = {
    element: HTMLElement;
    originalHTML: string;
    originalHeight: number;
    isCollapsed: boolean;
};

/** Extension settings stored in browser.storage */
export type SettingsType = {
    enabled: boolean;
    bufferSize: number;
    theme: ThemeType;
};

/** Theme options */
export type ThemeType = 'dark' | 'light' | 'auto';

/** Conversation statistics */
export type ConversationStatsType = {
    totalMessages: number;
    userMessages: number;
    assistantMessages: number;
    totalWords: number;
    userWords: number;
    assistantWords: number;
    estimatedTokens: number;
    conversationDuration: number;
};

/** Search result */
export type SearchResultType = {
    messageIndex: number;
    role: string;
    matchCount: number;
    preview: string;
};

/** Export format options */
export type ExportFormatType = 'markdown' | 'json' | 'text';

/** Keyboard shortcut definition */
export type ShortcutType = {
    key: string;
    modifiers: string[];
    action: string;
    description: string;
};
