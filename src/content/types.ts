/**
 * Content script types for DOM virtualization
 */

/** State tracking for a virtualized message element */
export type MessageStateType = {
    element: HTMLElement;
    originalHTML: string;
    originalHeight: number;
    isCollapsed: boolean;
};

/** Runtime statistics */
export type ContentStatsType = {
    total: number;
    active: number;
    collapsed: number;
    savedBytes: number;
    domNodes: number;
};

/** Extracted conversation message */
export type ExtractedMessageType = {
    role: string;
    content: string;
};

/** Message types for popup-content script communication */
export type MessageType =
    | { type: 'getStats' }
    | { type: 'getConversation' }
    | { type: 'startNewChat'; summary: string };
