/**
 * GPT Unloader - Content Script Entry Point
 * Implements DOM virtualization for ChatGPT to improve performance with long chats
 */

import { browserAPI } from '../shared/browser-api';
import {
    MESSAGE_SELECTOR,
    DEFAULT_SETTINGS,
    MESSAGES_CHECK_INTERVAL_MS,
    MESSAGES_CHECK_TIMEOUT_MS,
} from '../shared/constants';
import { setupObservers, rebuildObserver, scanMessages, setEnabled, setOnStatsChange } from './lib/observer-manager';
import { restoreAllMessages, getStats } from './lib/dom-virtualizer';
import { extractConversation, startNewChatWithSummary } from './lib/conversation';
import { showToast } from './lib/toast';
import { injectStyles } from './lib/styles';
import type { MessageType } from './types';

let enabled = DEFAULT_SETTINGS.ENABLED;
let bufferSize = DEFAULT_SETTINGS.BUFFER_SIZE;

/**
 * Broadcasts stats to the popup
 */
function broadcastStats(): void {
    browserAPI.runtime.sendMessage({ type: 'stats', data: getStats() }).catch(() => { });
}

/**
 * Waits for ChatGPT messages to appear in the DOM
 */
function waitForMessages(): void {
    const check = (): boolean => {
        const msgs = document.querySelectorAll(MESSAGE_SELECTOR);
        if (msgs.length > 0) {
            setupObservers(bufferSize);
            setOnStatsChange(broadcastStats);
            scanMessages();
            return true;
        }
        return false;
    };

    if (!check()) {
        const interval = setInterval(() => {
            if (check()) clearInterval(interval);
        }, MESSAGES_CHECK_INTERVAL_MS);
        setTimeout(() => clearInterval(interval), MESSAGES_CHECK_TIMEOUT_MS);
    }
}

/**
 * Handles keyboard shortcuts
 */
function handleKeydown(e: KeyboardEvent): void {
    if (e.altKey && e.key === 'u') {
        enabled = !enabled;
        setEnabled(enabled);
        browserAPI.storage.local.set({ enabled });
        if (!enabled) {
            restoreAllMessages();
        } else {
            scanMessages();
        }
        showToast(enabled ? 'GPT Unloader: ON' : 'GPT Unloader: OFF');
        broadcastStats();
    }
}

/**
 * Handles messages from the popup
 */
function handleMessage(
    message: MessageType,
    _sender: chrome.runtime.MessageSender,
    sendResponse: (response: unknown) => void
): true | undefined {
    if (message.type === 'getStats') {
        sendResponse({ stats: getStats() });
    } else if (message.type === 'getConversation') {
        sendResponse({ conversation: extractConversation() });
    } else if (message.type === 'startNewChat') {
        startNewChatWithSummary(message.summary);
        sendResponse({ success: true });
    }
    return true;
}

/**
 * Handles storage changes
 */
function handleStorageChange(changes: { [key: string]: chrome.storage.StorageChange }): void {
    if (changes.enabled) {
        enabled = changes.enabled.newValue as boolean;
        setEnabled(enabled);
        if (!enabled) {
            restoreAllMessages();
        } else {
            scanMessages();
        }
        broadcastStats();
    }
    if (changes.bufferSize) {
        bufferSize = changes.bufferSize.newValue as number;
        rebuildObserver(bufferSize);
    }
}

/**
 * Initializes the extension
 */
async function init(): Promise<void> {
    const result = await browserAPI.storage.local.get(['enabled', 'bufferSize']);
    if (result.enabled !== undefined) enabled = result.enabled as boolean;
    if (result.bufferSize !== undefined) bufferSize = result.bufferSize as number;
    setEnabled(enabled);

    injectStyles();
    waitForMessages();

    browserAPI.storage.onChanged.addListener(handleStorageChange);
    browserAPI.runtime.onMessage.addListener(handleMessage);
    document.addEventListener('keydown', handleKeydown);
}

init();
