import { MESSAGE_SELECTOR } from '../../shared/constants';
import { getMessageState } from './message-tracker';
import type { ExportFormatType } from '../../shared/types';

/**
 * Extracts all messages for export
 */
function extractAllMessages(): Array<{ role: string; content: string }> {
    const messages: Array<{ role: string; content: string }> = [];
    const msgElements = document.querySelectorAll(MESSAGE_SELECTOR);

    msgElements.forEach((msg) => {
        const role = msg.getAttribute('data-message-author-role') ?? 'unknown';
        const state = getMessageState(msg as HTMLElement);

        let content = '';
        if (state?.isCollapsed && state.originalHTML) {
            const temp = document.createElement('div');
            temp.innerHTML = state.originalHTML;
            content = temp.textContent ?? '';
        } else {
            content = msg.textContent ?? '';
        }

        messages.push({ role, content: content.trim() });
    });

    return messages;
}

/**
 * Exports conversation as Markdown
 */
function exportAsMarkdown(): string {
    const messages = extractAllMessages();
    const title = document.title.replace(' | ChatGPT', '').trim();

    let markdown = `# ${title}\n\n`;
    markdown += `*Exported on ${new Date().toLocaleString()}*\n\n---\n\n`;

    messages.forEach((msg) => {
        const roleLabel = msg.role === 'user' ? '**You:**' : '**ChatGPT:**';
        markdown += `${roleLabel}\n\n${msg.content}\n\n---\n\n`;
    });

    return markdown;
}

/**
 * Exports conversation as JSON
 */
function exportAsJSON(): string {
    const messages = extractAllMessages();
    const title = document.title.replace(' | ChatGPT', '').trim();

    return JSON.stringify({
        title,
        exportedAt: new Date().toISOString(),
        url: window.location.href,
        messages,
    }, null, 2);
}

/**
 * Exports conversation as plain text
 */
function exportAsText(): string {
    const messages = extractAllMessages();
    const title = document.title.replace(' | ChatGPT', '').trim();

    let text = `${title}\n${'='.repeat(title.length)}\n\n`;

    messages.forEach((msg) => {
        const roleLabel = msg.role === 'user' ? 'You' : 'ChatGPT';
        text += `[${roleLabel}]\n${msg.content}\n\n`;
    });

    return text;
}

/**
 * Exports conversation in the specified format
 */
export function exportConversation(format: ExportFormatType): string {
    switch (format) {
        case 'markdown':
            return exportAsMarkdown();
        case 'json':
            return exportAsJSON();
        case 'text':
            return exportAsText();
        default:
            return exportAsMarkdown();
    }
}

/**
 * Downloads the exported content as a file
 */
export function downloadExport(content: string, format: ExportFormatType): void {
    const title = document.title.replace(' | ChatGPT', '').trim().replace(/[^a-z0-9]/gi, '-');
    const extensions: Record<ExportFormatType, string> = {
        markdown: 'md',
        json: 'json',
        text: 'txt',
    };
    const mimeTypes: Record<ExportFormatType, string> = {
        markdown: 'text/markdown',
        json: 'application/json',
        text: 'text/plain',
    };

    const blob = new Blob([content], { type: mimeTypes[format] });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title}.${extensions[format]}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
