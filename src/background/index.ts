/**
 * GPT Unloader Background Service Worker
 * Handles context menus and multi-tab coordination
 */

import { browserAPI } from '../shared/browser-api';
import type { ChatTabType, UserPreferencesType } from '../shared/types';

const CHATGPT_PATTERNS = ['*://chatgpt.com/*', '*://chat.openai.com/*'];
const tabRegistry = new Map<number, ChatTabType>();

/**
 * Checks if a URL is a ChatGPT page
 */
function isChatGPTUrl(url: string | undefined): boolean {
    if (!url) return false;
    return url.includes('chatgpt.com') || url.includes('chat.openai.com');
}

/**
 * Creates context menu items
 */
function createContextMenus(): void {
    browserAPI.contextMenus.removeAll(() => {
        browserAPI.contextMenus.create({
            id: 'gpt-unloader-export',
            title: 'Export Conversation',
            contexts: ['page'],
            documentUrlPatterns: CHATGPT_PATTERNS,
        });

        browserAPI.contextMenus.create({
            id: 'gpt-unloader-search',
            title: 'Search in Conversation',
            contexts: ['page'],
            documentUrlPatterns: CHATGPT_PATTERNS,
        });

        browserAPI.contextMenus.create({
            id: 'gpt-unloader-toggle',
            title: 'Toggle GPT Unloader',
            contexts: ['page'],
            documentUrlPatterns: CHATGPT_PATTERNS,
        });
    });
}

/**
 * Handles context menu clicks
 */
browserAPI.contextMenus.onClicked.addListener((info, tab) => {
    if (!tab?.id) return;

    switch (info.menuItemId) {
        case 'gpt-unloader-export':
            browserAPI.tabs.sendMessage(tab.id, { type: 'exportConversation', format: 'markdown' });
            break;
        case 'gpt-unloader-search':
            // Open popup for search - can't do this directly, show toast instead
            browserAPI.tabs.sendMessage(tab.id, { type: 'showSearchPrompt' });
            break;
        case 'gpt-unloader-toggle':
            browserAPI.storage.local.get(['enabled']).then((result) => {
                const newState = !result.enabled;
                browserAPI.storage.local.set({ enabled: newState });
            });
            break;
    }
});

/**
 * Updates tab registry when tabs change
 */
function updateTabRegistry(): void {
    browserAPI.tabs.query({}).then((tabs) => {
        const chatGPTTabs = tabs.filter((t) => isChatGPTUrl(t.url));

        // Remove tabs that no longer exist
        tabRegistry.forEach((_, tabId) => {
            if (!chatGPTTabs.find((t) => t.id === tabId)) {
                tabRegistry.delete(tabId);
            }
        });

        // Add/update existing tabs
        chatGPTTabs.forEach((tab) => {
            if (tab.id) {
                tabRegistry.set(tab.id, {
                    tabId: tab.id,
                    title: tab.title ?? 'ChatGPT',
                    url: tab.url ?? '',
                    messageCount: tabRegistry.get(tab.id)?.messageCount ?? 0,
                });
            }
        });
    });
}

/**
 * Gets all ChatGPT tabs
 */
function getChatGPTTabs(): ChatTabType[] {
    return Array.from(tabRegistry.values());
}

/**
 * Handles messages from popup/content scripts
 */
browserAPI.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'getChatGPTTabs') {
        updateTabRegistry();
        sendResponse({ tabs: getChatGPTTabs() });
        return true;
    }

    if (message.type === 'updateTabStats' && sender.tab?.id) {
        const existing = tabRegistry.get(sender.tab.id);
        if (existing) {
            existing.messageCount = message.messageCount ?? 0;
        }
        return true;
    }

    if (message.type === 'optimizeAllTabs') {
        tabRegistry.forEach((_, tabId) => {
            browserAPI.tabs.sendMessage(tabId, { type: 'forceOptimize' }).catch(() => { });
        });
        sendResponse({ success: true });
        return true;
    }

    if (message.type === 'focusTab') {
        browserAPI.tabs.update(message.tabId, { active: true });
        sendResponse({ success: true });
        return true;
    }

    return false;
});

// Tab event listeners
browserAPI.tabs.onUpdated.addListener((_tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && isChatGPTUrl(tab.url)) {
        updateTabRegistry();
    }
});

browserAPI.tabs.onRemoved.addListener((tabId) => {
    tabRegistry.delete(tabId);
});

// Check preferences for context menu
browserAPI.storage.local.get(['preferences']).then((result) => {
    const prefs = result.preferences as UserPreferencesType | undefined;
    if (prefs?.enableContextMenu !== false) {
        createContextMenus();
    }
});

// Listen for preference changes
browserAPI.storage.onChanged.addListener((changes) => {
    if (changes.preferences) {
        const prefs = changes.preferences.newValue as UserPreferencesType | undefined;
        if (prefs?.enableContextMenu) {
            createContextMenus();
        } else {
            browserAPI.contextMenus.removeAll();
        }
    }
});

// Initial setup
updateTabRegistry();
