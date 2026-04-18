type NavigateEventType = {
    destination: { url: string };
};

type NavigationType = {
    addEventListener(type: 'navigate', listener: (event: NavigateEventType) => void): void;
};

/**
 * Watches for SPA route changes using the Navigation API (Chrome 102+).
 * Fires onNavigate whenever the pathname changes — ignores hash/search updates.
 */
export function watchNavigation(onNavigate: () => void): void {
    const nav = (window as unknown as { navigation: NavigationType }).navigation;
    if (!nav) return;

    nav.addEventListener('navigate', (event) => {
        const destination = new URL(event.destination.url);
        if (destination.pathname !== window.location.pathname) {
            onNavigate();
        }
    });
}
