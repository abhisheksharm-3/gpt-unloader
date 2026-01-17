/**
 * Injects content script styles into the document
 */
export function injectStyles(): void {
    const style = document.createElement('style');
    style.textContent = `
    .gpt-unloader-collapsed {
      pointer-events: none !important;
    }
    .gpt-unloader-placeholder {
      width: 100%;
      height: 100%;
      background: rgba(16, 185, 129, 0.03);
    }
  `;
    document.head.appendChild(style);
}
