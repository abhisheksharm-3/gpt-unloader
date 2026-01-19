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
    isCompressed?: boolean; // Whether originalHTML is LZ-String compressed
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

/** Extracted conversation message (for export/analysis) */
export type ExtractedMessageType = {
    role: string;
    content: string;
};

/** User preferences for toggleable features */
export type UserPreferencesType = {
    showTimestamps: boolean;
    showReadingProgress: boolean;
    enableContextMenu: boolean;
};

/** Bookmark entry */
export type BookmarkType = {
    id: string;
    conversationId: string;
    messageIndex: number;
    role: string;
    preview: string;
    createdAt: number;
};

/** Conversation template */
export type TemplateType = {
    id: string;
    name: string;
    content: string;
    createdAt: number;
};

/** Tab info for multi-tab sync */
export type ChatTabType = {
    tabId: number;
    title: string;
    url: string;
    messageCount: number;
};

/** Memory history data point */
export type MemoryDataPointType = {
    timestamp: number;
    savedBytes: number;
};

/** Message types for popup-content script communication */
export type MessageType =
    | { type: 'getStats' }
    | { type: 'getConversation' }
    | { type: 'startNewChat'; summary: string }
    | { type: 'getConversationStats' }
    | { type: 'exportConversation'; format: ExportFormatType }
    | { type: 'search'; query: string }
    | { type: 'clearSearch' }
    | { type: 'getTheme' }
    | { type: 'getShortcuts' }
    | { type: 'getBookmarks' }
    | { type: 'toggleBookmark'; messageIndex: number }
    | { type: 'scrollToMessage'; messageIndex: number }
    | { type: 'insertTemplate'; content: string }
    | { type: 'getMemoryHistory' }
    | { type: 'preferencesChanged'; preferences: UserPreferencesType };

