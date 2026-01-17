/**
 * Shared constants for GPT Unloader extension
 */

/** CSS selector for ChatGPT message elements */
export const MESSAGE_SELECTOR = '[data-message-author-role]';

/** Priority-ordered selectors for finding the chat container */
export const CONTAINER_SELECTORS = ['main', '[role="main"]', 'body'];

/** Default extension settings */
export const DEFAULT_SETTINGS = {
    ENABLED: true,
    BUFFER_SIZE: 3,
};

/** Multiplier for calculating IntersectionObserver rootMargin */
export const ROOT_MARGIN_MULTIPLIER = 400;

/** Stats polling interval in milliseconds */
export const STATS_POLL_INTERVAL_MS = 2000;

/** Maximum retry attempts for textarea injection */
export const MAX_INJECTION_RETRIES = 10;

/** Delay between injection retries in milliseconds */
export const INJECTION_RETRY_DELAY_MS = 300;

/** Wait time after messages check in milliseconds */
export const MESSAGES_CHECK_INTERVAL_MS = 500;

/** Maximum time to wait for messages in milliseconds */
export const MESSAGES_CHECK_TIMEOUT_MS = 30000;

/** Default user preferences for toggleable features */
export const DEFAULT_PREFERENCES = {
    showTimestamps: true,
    showReadingProgress: true,
    enableContextMenu: true,
};

/** Model pricing per 1M tokens (input/output) */
export const MODEL_PRICING = {
    'gpt-4o': { input: 2.50, output: 10.00 },
    'gpt-4o-mini': { input: 0.15, output: 0.60 },
    'gpt-4-turbo': { input: 10.00, output: 30.00 },
    'gpt-3.5-turbo': { input: 0.50, output: 1.50 },
};

