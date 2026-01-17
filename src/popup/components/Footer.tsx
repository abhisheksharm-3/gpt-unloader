/**
 * Footer with version and links
 */
export function Footer() {
    return (
        <div className="pt-3 border-t border-neutral-800 flex justify-between items-center">
            <span className="text-neutral-700 text-xs">v1.0.0</span>
            <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral-600 text-xs hover:text-neutral-400 transition-colors"
            >
                GitHub
            </a>
        </div>
    );
}
