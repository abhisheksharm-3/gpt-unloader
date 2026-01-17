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

/** Model pricing per 1M tokens (input/output) - Standard tier from OpenAI API [page:2][web:2] */
export const MODEL_PRICING = {
    // GPT-5 series
    'gpt-5.2': { input: 1.75, output: 14.00 },
    'gpt-5.1': { input: 1.25, output: 10.00 },
    'gpt-5': { input: 1.25, output: 10.00 },
    'gpt-5-mini': { input: 0.25, output: 2.00 },
    'gpt-5-nano': { input: 0.05, output: 0.40 },
    'gpt-5.2-pro': { input: 21.00, output: 168.00 },
    'gpt-5-pro': { input: 15.00, output: 120.00 },

    // GPT-4 series
    'gpt-4.1': { input: 2.00, output: 8.00 },
    'gpt-4.1-mini': { input: 0.40, output: 1.60 },
    'gpt-4.1-nano': { input: 0.10, output: 0.40 },
    'gpt-4o': { input: 2.50, output: 10.00 },
    'gpt-4o-2024-05-13': { input: 5.00, output: 15.00 },
    'gpt-4o-mini': { input: 0.15, output: 0.60 },

    // o-series (reasoning models)
    'o1': { input: 15.00, output: 60.00 },
    'o1-pro': { input: 150.00, output: 600.00 },
    'o1-mini': { input: 1.10, output: 4.40 },
    'o3': { input: 2.00, output: 8.00 },
    'o3-pro': { input: 20.00, output: 80.00 },
    'o3-mini': { input: 1.10, output: 4.40 },
    'o3-deep-research': { input: 10.00, output: 40.00 },
    'o4-mini': { input: 1.10, output: 4.40 },
    'o4-mini-deep-research': { input: 2.00, output: 8.00 },

    // Realtime and audio
    'gpt-realtime': { input: 4.00, output: 16.00 },
    'gpt-realtime-mini': { input: 0.60, output: 2.40 },
    'gpt-4o-realtime-preview': { input: 5.00, output: 20.00 },
    'gpt-4o-mini-realtime-preview': { input: 0.60, output: 2.40 },
    'gpt-audio': { input: 2.50, output: 10.00 },
    'gpt-audio-mini': { input: 0.60, output: 2.40 },
    'gpt-4o-audio-preview': { input: 2.50, output: 10.00 },
    'gpt-4o-mini-audio-preview': { input: 0.15, output: 0.60 },

    // Legacy models [page:2]
    'gpt-4-turbo': { input: 10.00, output: 30.00 },
    'gpt-4-turbo-2024-04-09': { input: 10.00, output: 30.00 },
    'gpt-3.5-turbo': { input: 0.50, output: 1.50 },
    'gpt-3.5-turbo-0125': { input: 0.50, output: 1.50 },

    // Other chat/completions models
    'gpt-5-chat-latest': { input: 1.25, output: 10.00 },
    'computer-use-preview': { input: 3.00, output: 12.00 },
    'codex-mini-latest': { input: 1.50, output: 6.00 },
};


