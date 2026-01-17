# GPT Unloader

A Chrome/Firefox extension that improves ChatGPT performance with long conversations by virtualizing the DOM.

## Features

- **DOM Virtualization** - Automatically collapses messages outside the viewport to reduce memory usage
- **Configurable Buffer** - Adjust how many messages to keep in memory
- **Performance Stats** - Real-time display of memory savings and DOM node reduction
- **New Chat with Summary** - Start a fresh chat with a summary of your current conversation
- **Keyboard Shortcut** - Toggle with Alt+U

## Installation

### From Release (Recommended)

1. Download the latest `.zip` from [Releases](https://github.com/abhisheksharm-3/gpt-unloader/releases)
2. Extract the zip file
3. **Chrome**: Go to `chrome://extensions`, enable "Developer mode", click "Load unpacked", select the extracted folder
4. **Firefox**: Go to `about:debugging`, click "This Firefox", "Load Temporary Add-on", select `manifest.json`

### From Source

```bash
# Clone the repository
git clone https://github.com/abhisheksharm-3/gpt-unloader.git
cd gpt-unloader

# Install dependencies
npm install

# Build the extension
npm run build

# Load the dist/ folder in your browser
```

## Development

```bash
# Start development server (popup only)
npm run dev

# Build for production
npm run build

# Lint code
npm run lint

# Create release package
npm run package
```

## How It Works

When you scroll through a long ChatGPT conversation:

1. Messages that leave the viewport are "collapsed" - their DOM content is replaced with a lightweight placeholder
2. Original content is stored in memory and restored when you scroll back
3. This dramatically reduces the number of DOM nodes the browser needs to manage

## Build Output

```
dist/
├── content.js    # Content script (IIFE format)
├── popup.js      # React popup UI
├── popup.css     # Tailwind styles
├── index.html    # Popup HTML
├── manifest.json # Extension manifest
└── icons/        # Extension icons
```

## Tech Stack

- **React 19** - Popup UI
- **TypeScript** - Type safety
- **Tailwind CSS 4** - Styling
- **Vite (Rolldown)** - Popup bundling
- **esbuild** - Content script bundling (IIFE format)

## Browser Compatibility

- Chrome (Manifest V3)
- Firefox (Manifest V3 with Gecko compatibility)
