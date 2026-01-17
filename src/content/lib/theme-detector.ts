import type { ThemeType } from '../../shared/types';

/**
 * Detects ChatGPT's current theme by checking body classes and styles
 */
export function detectTheme(): ThemeType {
    const html = document.documentElement;
    const body = document.body;

    if (html.classList.contains('dark') || body.classList.contains('dark')) {
        return 'dark';
    }

    if (html.classList.contains('light') || body.classList.contains('light')) {
        return 'light';
    }

    const bgColor = getComputedStyle(body).backgroundColor;
    const rgb = bgColor.match(/\d+/g);

    if (rgb && rgb.length >= 3) {
        const luminance = (parseInt(rgb[0]) * 299 + parseInt(rgb[1]) * 587 + parseInt(rgb[2]) * 114) / 1000;
        return luminance < 128 ? 'dark' : 'light';
    }

    return 'dark';
}

/**
 * Watches for theme changes and calls callback
 */
export function watchTheme(callback: (theme: ThemeType) => void): MutationObserver {
    let lastTheme = detectTheme();

    const observer = new MutationObserver(() => {
        const newTheme = detectTheme();
        if (newTheme !== lastTheme) {
            lastTheme = newTheme;
            callback(newTheme);
        }
    });

    observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class'],
    });

    observer.observe(document.body, {
        attributes: true,
        attributeFilter: ['class', 'style'],
    });

    return observer;
}
