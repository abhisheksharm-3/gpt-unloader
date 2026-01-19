import type { MessageStateType, StatsType, MemoryDataPointType } from '../../shared/types';
import { getMessages } from './message-tracker';
import LZString from 'lz-string';

const MAX_HISTORY_POINTS = 20;

let savedBytes = 0;
let uncompressedBytes = 0;
let memoryHistory: MemoryDataPointType[] = [];

// Store detached elements for restoration
const detachedElements = new Map<HTMLElement, {
    placeholder: HTMLElement;
    parentElement: HTMLElement;
    nextSibling: Node | null;
}>();

/**
 * Gets the current saved bytes count
 */
export function getSavedBytes(): number {
    return savedBytes;
}

/**
 * Resets the saved bytes counter
 */
export function resetSavedBytes(): void {
    savedBytes = 0;
    uncompressedBytes = 0;
    memoryHistory = [];
}

/**
 * Records a memory data point
 */
function recordMemoryPoint(): void {
    memoryHistory.push({
        timestamp: Date.now(),
        savedBytes,
    });

    if (memoryHistory.length > MAX_HISTORY_POINTS) {
        memoryHistory.shift();
    }
}

/**
 * Gets memory usage history
 */
export function getMemoryHistory(): MemoryDataPointType[] {
    return [...memoryHistory];
}

/**
 * Strips SVG elements - they consume ~1MB+ in typical conversations
 */
function stripSVGs(html: string): string {
    return html.replace(/<svg[^>]*>[\s\S]*?<\/svg>/gi, '<span data-svg-placeholder="1"></span>');
}

/**
 * Strips code blocks and stores only placeholders
 * Code blocks are often the heaviest content in ChatGPT responses
 */
function stripCodeBlocks(html: string): string {
    // Replace large code blocks with placeholders containing just the language
    return html.replace(
        /<pre[^>]*>\s*<code[^>]*class="[^"]*language-([^"]*)"[^>]*>[\s\S]*?<\/code>\s*<\/pre>/gi,
        '<pre data-code-placeholder="$1"><code>[Code block removed for memory - will reload on scroll]</code></pre>'
    );
}

/**
 * Aggressive HTML sanitization for maximum compression
 */
function sanitizeHTML(html: string): string {
    let sanitized = html;

    // Strip SVGs (big win)
    sanitized = stripSVGs(sanitized);

    // Strip large code blocks (huge win for code-heavy chats)
    sanitized = stripCodeBlocks(sanitized);

    // Remove all data-* attributes except our own
    sanitized = sanitized.replace(/\s+data-(?!gpt-unloader)[a-z-]+="[^"]*"/gi, '');

    // Remove class attributes (ChatGPT uses lots of Tailwind classes)
    sanitized = sanitized.replace(/\s+class="[^"]*"/g, '');

    // Remove style attributes
    sanitized = sanitized.replace(/\s+style="[^"]*"/g, '');

    // Remove id attributes
    sanitized = sanitized.replace(/\s+id="[^"]*"/g, '');

    // Collapse whitespace
    sanitized = sanitized.replace(/\s{2,}/g, ' ');

    // Remove comments
    sanitized = sanitized.replace(/<!--[\s\S]*?-->/g, '');

    return sanitized.trim();
}

/**
 * Compresses HTML string using LZ-String
 */
function compressHTML(html: string): string {
    const sanitized = sanitizeHTML(html);
    return LZString.compressToUTF16(sanitized);
}

/**
 * Decompresses HTML string
 */
function decompressHTML(compressed: string): string {
    return LZString.decompressFromUTF16(compressed) || '';
}

/**
 * Estimates the memory size of a DOM element and its children
 */
function estimateElementSize(element: HTMLElement): number {
    // Rough estimate: HTML length * 2 (UTF-16) + DOM overhead per node
    const html = element.outerHTML;
    const nodeCount = element.querySelectorAll('*').length + 1;
    const DOM_NODE_OVERHEAD = 200; // Approximate bytes per DOM node
    return (html.length * 2) + (nodeCount * DOM_NODE_OVERHEAD);
}

/**
 * Collapses a message by COMPLETELY removing it from DOM
 * This is the most aggressive memory-saving approach
 */
export function collapseMessage(element: HTMLElement, state: MessageStateType): void {
    if (state.isCollapsed) return;

    const parent = element.parentElement;
    if (!parent) return;

    // Estimate memory we'll save
    const estimatedSize = estimateElementSize(element);

    // Store the raw HTML and compress it
    const rawHTML = element.innerHTML;
    state.originalHTML = compressHTML(rawHTML);
    state.originalHeight = element.offsetHeight;
    state.isCompressed = true;

    // Create a minimal placeholder that will be inserted in place of the element
    const placeholder = document.createElement('div');
    placeholder.className = 'gpt-unloader-placeholder';
    placeholder.style.cssText = `
        height: ${state.originalHeight}px;
        min-height: ${state.originalHeight}px;
        contain: strict;
        content-visibility: hidden;
        background: transparent;
    `;
    placeholder.dataset.gptUnloaderOriginalId = element.dataset.messageId || '';

    // Store position info for restoration
    const nextSibling = element.nextSibling;

    // COMPLETELY remove the element from DOM and replace with placeholder
    parent.replaceChild(placeholder, element);

    // Store the detached element info
    detachedElements.set(element, {
        placeholder,
        parentElement: parent,
        nextSibling
    });

    // Track memory saved (both DOM removal + compression savings)
    uncompressedBytes += estimatedSize;
    savedBytes += estimatedSize; // Full element removed

    state.isCollapsed = true;
    recordMemoryPoint();
}

/**
 * Restores a collapsed message by reinserting it into DOM
 */
export function restoreMessage(element: HTMLElement, state: MessageStateType): void {
    if (!state.isCollapsed || !state.originalHTML) return;

    const detachedInfo = detachedElements.get(element);
    if (!detachedInfo) return;

    const { placeholder, parentElement } = detachedInfo;

    // Decompress HTML
    const html = state.isCompressed
        ? decompressHTML(state.originalHTML)
        : state.originalHTML;

    // Restore the element content
    element.innerHTML = html;
    element.style.height = '';
    element.style.minHeight = '';
    element.style.contain = '';
    element.style.contentVisibility = '';
    element.classList.remove('gpt-unloader-collapsed');

    // Reinsert the element into DOM, replacing the placeholder
    if (placeholder.parentElement === parentElement) {
        parentElement.replaceChild(element, placeholder);
    }

    // Cleanup
    detachedElements.delete(element);

    // Calculate saved bytes delta
    const estimatedSize = estimateElementSize(element);
    uncompressedBytes -= estimatedSize;
    savedBytes -= estimatedSize;

    state.isCollapsed = false;
    state.isCompressed = false;
    state.originalHTML = '';
    recordMemoryPoint();
}

/**
 * Restores all collapsed messages
 */
export function restoreAllMessages(): void {
    const messages = getMessages();
    messages.forEach((state, element) => {
        if (state.isCollapsed) {
            restoreMessage(element, state);
        }
    });
}

/**
 * Gets current statistics
 */
export function getStats(): StatsType {
    const messages = getMessages();
    let active = 0;
    let collapsed = 0;

    messages.forEach((state) => {
        if (state.isCollapsed) collapsed++;
        else active++;
    });

    return {
        total: messages.size,
        active,
        collapsed,
        savedBytes,
        domNodes: document.body.querySelectorAll('*').length,
    };
}

/**
 * Forces browser garbage collection hint
 * Note: This is just a hint, actual GC is browser-controlled
 */
export function triggerGCHint(): void {
    // Clear any detached elements that are no longer needed
    const messages = getMessages();
    const activeElements = new Set(messages.keys());

    detachedElements.forEach((_, element) => {
        if (!activeElements.has(element)) {
            detachedElements.delete(element);
        }
    });

    // Hint to browser to run GC (not guaranteed)
    if (typeof window !== 'undefined') {
        // Create and revoke a large blob to trigger memory pressure response
        try {
            const blob = new Blob([new ArrayBuffer(50 * 1024 * 1024)]); // 50MB
            URL.revokeObjectURL(URL.createObjectURL(blob));
        } catch {
            // Ignore errors
        }
    }
}
