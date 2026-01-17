const STATUS_ID = 'gpt-unloader-status';
const FADE_OUT_DELAY_MS = 3000;

type StatusStateType = 'optimizing' | 'ready' | 'hidden';

let statusElement: HTMLDivElement | null = null;
let fadeTimeout: ReturnType<typeof setTimeout> | null = null;

const STATUS_STYLES = `
    #${STATUS_ID} {
        position: fixed;
        bottom: 20px;
        left: 20px;
        background: #171717;
        color: #10b981;
        padding: 12px 16px;
        font-family: -apple-system, BlinkMacSystemFont, sans-serif;
        font-size: 12px;
        z-index: 999999;
        border: 1px solid #10b981;
        max-width: 280px;
        transition: opacity 0.3s ease, transform 0.3s ease;
    }
    #${STATUS_ID}.hidden {
        opacity: 0;
        transform: translateY(10px);
        pointer-events: none;
    }
    #${STATUS_ID} .status-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 4px;
    }
    #${STATUS_ID} .status-warning {
        color: #a1a1aa;
        font-size: 10px;
        line-height: 1.3;
    }
    #${STATUS_ID} .spinner {
        width: 12px;
        height: 12px;
        border: 2px solid #10b981;
        border-top-color: transparent;
        border-radius: 50%;
        animation: gpt-unloader-spin 0.8s linear infinite;
        flex-shrink: 0;
    }
    @keyframes gpt-unloader-spin {
        to { transform: rotate(360deg); }
    }
`;

/**
 * Injects the status indicator styles
 */
function injectStatusStyles(): void {
    if (document.getElementById(`${STATUS_ID}-styles`)) return;
    const style = document.createElement('style');
    style.id = `${STATUS_ID}-styles`;
    style.textContent = STATUS_STYLES;
    document.head.appendChild(style);
}

/**
 * Creates the status indicator element
 */
function createStatusElement(): HTMLDivElement {
    injectStatusStyles();

    let element = document.getElementById(STATUS_ID) as HTMLDivElement;
    if (element) return element;

    element = document.createElement('div');
    element.id = STATUS_ID;
    element.className = 'hidden';
    document.body.appendChild(element);

    return element;
}

/**
 * Updates the status indicator
 */
export function setStatus(state: StatusStateType, messageCount?: number): void {
    if (!statusElement) {
        statusElement = createStatusElement();
    }

    if (fadeTimeout) {
        clearTimeout(fadeTimeout);
        fadeTimeout = null;
    }

    switch (state) {
        case 'optimizing':
            statusElement.innerHTML = `
                <div class="status-header">
                    <div class="spinner"></div>
                    <span>Optimizing${messageCount ? ` ${messageCount} messages` : ''}...</span>
                </div>
                <div class="status-warning">
                    Page may be briefly unresponsive. Please wait.
                </div>
            `;
            statusElement.classList.remove('hidden');
            break;
        case 'ready':
            statusElement.innerHTML = `
                <span>✓ Optimized</span>
            `;
            statusElement.classList.remove('hidden');
            fadeTimeout = setTimeout(() => {
                statusElement?.classList.add('hidden');
            }, FADE_OUT_DELAY_MS);
            break;
        case 'hidden':
            statusElement.classList.add('hidden');
            break;
    }
}

/**
 * Hides the status indicator
 */
export function hideStatus(): void {
    setStatus('hidden');
}
