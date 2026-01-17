const TOAST_ID = 'gpt-unloader-toast';
const TOAST_DURATION_MS = 2000;

const TOAST_STYLES = `
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: #171717;
  color: #10b981;
  padding: 12px 20px;
  font-family: monospace;
  font-size: 14px;
  z-index: 999999;
  border: 1px solid #10b981;
`;

/**
 * Shows a toast notification
 * @param message - The message to display
 */
export function showToast(message: string): void {
    const existing = document.getElementById(TOAST_ID);
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = TOAST_ID;
    toast.textContent = message;
    toast.style.cssText = TOAST_STYLES;
    document.body.appendChild(toast);

    setTimeout(() => toast.remove(), TOAST_DURATION_MS);
}
