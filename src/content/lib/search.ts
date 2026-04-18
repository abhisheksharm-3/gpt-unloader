import { getMessages } from './message-tracker';
import { extractMessageContent } from './message-extractor';
import type { SearchResultType } from '../../shared/types';

const HIGHLIGHT_CLASS = 'gpt-unloader-highlight';
let currentHighlights: HTMLElement[] = [];

/**
 * Clears all search highlights
 */
export function clearSearchHighlights(): void {
    currentHighlights.forEach((el) => {
        const parent = el.parentNode;
        if (parent) {
            parent.replaceChild(document.createTextNode(el.textContent ?? ''), el);
            parent.normalize();
        }
    });
    currentHighlights = [];
}

/**
 * Highlights text matches in an element
 */
function highlightMatches(element: HTMLElement, query: string): number {
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    let matchCount = 0;

    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    const textNodes: Text[] = [];

    while (walker.nextNode()) {
        textNodes.push(walker.currentNode as Text);
    }

    textNodes.forEach((node) => {
        const text = node.textContent ?? '';
        if (regex.test(text)) {
            const span = document.createElement('span');
            span.innerHTML = text.replace(regex, `<mark class="${HIGHLIGHT_CLASS}">$1</mark>`);

            const marks = span.querySelectorAll(`.${HIGHLIGHT_CLASS}`);
            matchCount += marks.length;
            marks.forEach((mark) => currentHighlights.push(mark as HTMLElement));

            node.parentNode?.replaceChild(span, node);
        }
    });

    return matchCount;
}

/** Searches all tracked messages including currently collapsed ones. */
export function searchMessages(query: string): SearchResultType[] {
    clearSearchHighlights();

    if (!query.trim()) return [];

    const results: SearchResultType[] = [];
    const messages = getMessages();
    let index = 0;

    messages.forEach((state, element) => {
        const role = element.getAttribute('data-message-author-role') ?? 'unknown';
        const content = extractMessageContent(element);

        const lowerContent = content.toLowerCase();
        const lowerQuery = query.toLowerCase();

        if (lowerContent.includes(lowerQuery)) {
            const matchCount = (lowerContent.match(new RegExp(lowerQuery, 'g')) ?? []).length;
            const matchIndex = lowerContent.indexOf(lowerQuery);
            const start = Math.max(0, matchIndex - 30);
            const end = Math.min(content.length, matchIndex + query.length + 30);
            const preview = (start > 0 ? '...' : '') + content.substring(start, end) + (end < content.length ? '...' : '');

            results.push({ messageIndex: index, role, matchCount, preview: preview.trim() });

            // Only highlight in-DOM elements; collapsed elements are detached
            if (!state.isCollapsed) {
                highlightMatches(element, query);
            }
        }
        index++;
    });

    return results;
}

/**
 * Scrolls to a specific message by index
 */
export function scrollToMessage(index: number): void {
    const messages = getMessages();
    const entries = Array.from(messages.entries());
    const entry = entries[index];
    if (!entry) return;

    const [element, state] = entry;

    // If collapsed, restore first so the element is in the DOM
    if (state.isCollapsed) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.style.outline = '2px solid #10b981';
        setTimeout(() => {
            element.style.outline = '';
        }, 2000);
    }
}
