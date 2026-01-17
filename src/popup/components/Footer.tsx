import { useState, useEffect } from 'react';
import { browserAPI } from '../../shared/browser-api';

/**
 * Footer with version and links
 */
export function Footer() {
    const [version, setVersion] = useState('');

    useEffect(() => {
        const manifest = browserAPI.runtime.getManifest();
        setVersion(manifest.version);
    }, []);

    return (
        <div className="pt-3 border-t border-neutral-800 flex justify-between items-center">
            <span className="text-neutral-700 text-xs">v{version}</span>
            <a
                href="https://github.com/abhisheksharm-3/gpt-unloader"
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral-600 text-xs hover:text-neutral-400 transition-colors"
            >
                GitHub
            </a>
        </div>
    );
}
