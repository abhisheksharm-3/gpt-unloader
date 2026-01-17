import { useState, useEffect } from 'react';
import { browserAPI } from '../../shared/browser-api';
import { useActiveTab } from '../hooks/useActiveTab';
import type { TemplateType } from '../../shared/types';

const STORAGE_KEY = 'gpt-unloader-templates';

type TemplatesPanelPropsType = {
    isOnChatGPT: boolean;
};

/**
 * Templates panel for managing and inserting conversation templates
 */
export function TemplatesPanel({ isOnChatGPT }: TemplatesPanelPropsType) {
    const [templates, setTemplates] = useState<TemplateType[]>([]);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [newName, setNewName] = useState('');
    const [newContent, setNewContent] = useState('');
    const { sendMessage } = useActiveTab();

    useEffect(() => {
        browserAPI.storage.local.get([STORAGE_KEY]).then((result) => {
            setTemplates((result[STORAGE_KEY] as TemplateType[] | undefined) ?? []);
        });
    }, []);

    const handleAdd = async () => {
        if (!newName.trim() || !newContent.trim()) return;

        const template: TemplateType = {
            id: `template-${Date.now()}`,
            name: newName.trim(),
            content: newContent.trim(),
            createdAt: Date.now(),
        };

        const updated = [...templates, template];
        setTemplates(updated);
        await browserAPI.storage.local.set({ [STORAGE_KEY]: updated });
        setNewName('');
        setNewContent('');
        setIsAdding(false);
    };

    const handleDelete = async (id: string) => {
        const updated = templates.filter((t) => t.id !== id);
        setTemplates(updated);
        await browserAPI.storage.local.set({ [STORAGE_KEY]: updated });
    };

    const handleInsert = async (content: string) => {
        if (isOnChatGPT) {
            await sendMessage({ type: 'insertTemplate', content });
            window.close();
        }
    };

    return (
        <div className="border-t border-zinc-800 pt-3 mt-3">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between text-xs font-medium text-zinc-400 hover:text-zinc-300 transition-colors"
            >
                <span>Templates ({templates.length})</span>
                <span className="text-[10px]">{isExpanded ? '▲' : '▼'}</span>
            </button>

            {isExpanded && (
                <div className="mt-2 space-y-2">
                    {templates.map((template) => (
                        <div
                            key={template.id}
                            className="p-2 bg-zinc-800/50 group"
                        >
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-zinc-300 text-xs font-medium">{template.name}</span>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {isOnChatGPT && (
                                        <button
                                            onClick={() => handleInsert(template.content)}
                                            className="text-emerald-400 text-[10px] hover:underline"
                                        >
                                            Insert
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleDelete(template.id)}
                                        className="text-red-400 text-[10px] hover:underline"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                            <div className="text-zinc-500 text-[10px] line-clamp-2">
                                {template.content}
                            </div>
                        </div>
                    ))}

                    {isAdding ? (
                        <div className="space-y-2">
                            <input
                                type="text"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                placeholder="Template name..."
                                className="w-full px-2 py-1 bg-zinc-800 border border-zinc-700 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                            />
                            <textarea
                                value={newContent}
                                onChange={(e) => setNewContent(e.target.value)}
                                placeholder="Template content..."
                                rows={3}
                                className="w-full px-2 py-1 bg-zinc-800 border border-zinc-700 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 resize-none"
                            />
                            <div className="flex gap-2">
                                <button
                                    onClick={handleAdd}
                                    className="flex-1 px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs transition-colors"
                                >
                                    Save
                                </button>
                                <button
                                    onClick={() => setIsAdding(false)}
                                    className="flex-1 px-2 py-1 bg-zinc-700 hover:bg-zinc-600 text-zinc-300 text-xs transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={() => setIsAdding(true)}
                            className="w-full py-1.5 border border-dashed border-zinc-700 text-zinc-500 text-xs hover:border-zinc-500 hover:text-zinc-400 transition-colors"
                        >
                            + Add Template
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
