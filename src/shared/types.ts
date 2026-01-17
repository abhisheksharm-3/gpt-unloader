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
};
