const STORAGE_KEY = 'gpt-unloader-reading-position';
const RESUME_BUTTON_ID = 'gpt-unloader-resume-btn';
const DEBOUNCE_MS = 1000;
const BOTTOM_THRESHOLD = 100;

let saveTimeout: ReturnType<typeof setTimeout> | null = null;
let isEnabled = true;

type ReadingPositionType = {
    conversationId: string;
    scrollTop: number;
    timestamp: number;
};

/**
 * Gets the current conversation ID from URL
 */
function getConversationId(): string {
    const match = window.location.pathname.match(/\/c\/([a-zA-Z0-9-]+)/);
    return match ? match[1] : 'home';
}

/**
 * Gets the scroll container
 */
function getScrollContainer(): HTMLElement | null {
    return document.querySelector('main') as HTMLElement;
}

/**
 * Saves the current reading position (debounced)
 */
function saveReadingPosition(): void {
    if (!isEnabled) return;

    if (saveTimeout) clearTimeout(saveTimeout);

    saveTimeout = setTimeout(() => {
        const container = getScrollContainer();
        if (!container) return;

        const isAtBottom = container.scrollHeight - container.scrollTop - container.clientHeight < BOTTOM_THRESHOLD;

        if (isAtBottom) {
            localStorage.removeItem(STORAGE_KEY);
            hideResumeButton();
            return;
        }

        const position: ReadingPositionType = {
            conversationId: getConversationId(),
            scrollTop: container.scrollTop,
            timestamp: Date.now(),
        };

        localStorage.setItem(STORAGE_KEY, JSON.stringify(position));
    }, DEBOUNCE_MS);
}

/**
 * Gets the saved reading position
 */
function getReadingPosition(): ReadingPositionType | null {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return null;

    const position = JSON.parse(saved) as ReadingPositionType;

    if (position.conversationId !== getConversationId()) return null;

    const oneDay = 24 * 60 * 60 * 1000;
    if (Date.now() - position.timestamp > oneDay) {
        localStorage.removeItem(STORAGE_KEY);
        return null;
    }

    return position;
}

/**
 * Shows the resume reading button
 */
function showResumeButton(scrollTop: number): void {
    if (document.getElementById(RESUME_BUTTON_ID)) return;

    const button = document.createElement('button');
    button.id = RESUME_BUTTON_ID;
    button.innerHTML = '↓ Resume Reading';
    button.style.cssText = `
        position: fixed;
        bottom: 80px;
        left: 50%;
        transform: translateX(-50%);
        background: #10b981;
        color: white;
        border: none;
        padding: 8px 16px;
        font-size: 12px;
        font-family: monospace;
        cursor: pointer;
        z-index: 999999;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        transition: opacity 0.3s;
    `;

    button.onclick = () => {
        const container = getScrollContainer();
        if (container) {
            container.scrollTo({ top: scrollTop, behavior: 'smooth' });
        }
        hideResumeButton();
        localStorage.removeItem(STORAGE_KEY);
    };

    document.body.appendChild(button);
}

/**
 * Hides the resume reading button
 */
function hideResumeButton(): void {
    document.getElementById(RESUME_BUTTON_ID)?.remove();
}

/**
 * Initializes reading progress tracking
 */
export function initReadingProgress(): void {
    if (!isEnabled) return;

    const container = getScrollContainer();
    if (!container) return;

    container.addEventListener('scroll', saveReadingPosition, { passive: true });

    const position = getReadingPosition();
    if (position) {
        setTimeout(() => showResumeButton(position.scrollTop), 500);
    }
}

/**
 * Cleans up reading progress tracking
 */
export function cleanupReadingProgress(): void {
    const container = getScrollContainer();
    if (container) {
        container.removeEventListener('scroll', saveReadingPosition);
    }
    hideResumeButton();
    if (saveTimeout) clearTimeout(saveTimeout);
}

/**
 * Sets enabled state for reading progress
 */
export function setReadingProgressEnabled(enabled: boolean): void {
    isEnabled = enabled;
    if (enabled) {
        initReadingProgress();
    } else {
        cleanupReadingProgress();
    }
}
