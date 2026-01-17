import { browserAPI } from '../../shared/browser-api';
import type { TemplateType } from '../../shared/types';
import { showToast } from './toast';

const STORAGE_KEY = 'gpt-unloader-templates';

const TEXTAREA_SELECTORS = [
    '#prompt-textarea',
    'textarea[data-id="root"]',
    'textarea[placeholder*="Message"]',
    'div[contenteditable="true"]',
    'textarea',
];

/**
 * Finds the textarea element
 */
function findTextarea(): HTMLElement | null {
    for (const selector of TEXTAREA_SELECTORS) {
        const element = document.querySelector(selector) as HTMLElement | null;
        if (element) return element;
    }
    return null;
}

/**
 * Gets all templates from storage
 */
export async function getTemplates(): Promise<TemplateType[]> {
    const result = await browserAPI.storage.local.get([STORAGE_KEY]);
    return (result[STORAGE_KEY] as TemplateType[] | undefined) ?? [];
}

/**
 * Saves a new template
 */
export async function saveTemplate(name: string, content: string): Promise<void> {
    const templates = await getTemplates();

    const template: TemplateType = {
        id: `template-${Date.now()}`,
        name,
        content,
        createdAt: Date.now(),
    };

    templates.push(template);
    await browserAPI.storage.local.set({ [STORAGE_KEY]: templates });
    showToast('Template saved!');
}

/**
 * Deletes a template by ID
 */
export async function deleteTemplate(id: string): Promise<void> {
    const templates = await getTemplates();
    const filtered = templates.filter((t) => t.id !== id);
    await browserAPI.storage.local.set({ [STORAGE_KEY]: filtered });
}

/**
 * Inserts template content into the textarea
 */
export function insertTemplate(content: string): void {
    const textarea = findTextarea();
    if (!textarea) {
        showToast('Could not find textarea');
        return;
    }

    if (textarea.tagName === 'TEXTAREA') {
        (textarea as HTMLTextAreaElement).value = content;
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
    } else if (textarea.contentEditable === 'true') {
        textarea.textContent = content;
        textarea.dispatchEvent(new InputEvent('input', { bubbles: true, data: content }));
    }

    textarea.focus();
    showToast('Template inserted!');
}
