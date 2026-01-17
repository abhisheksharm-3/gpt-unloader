# GPT Unloader

<p align="center">
  <img src="public/icons/icon128.png" alt="GPT Unloader Logo" width="128" height="128">
</p>

<p align="center">
  <strong>Supercharge ChatGPT performance with DOM virtualization</strong>
</p>

<p align="center">
  <a href="https://github.com/abhisheksharm-3/gpt-unloader/releases">
    <img src="https://img.shields.io/github/v/release/abhisheksharm-3/gpt-unloader?style=flat-square" alt="Release">
  </a>
  <a href="https://github.com/abhisheksharm-3/gpt-unloader/blob/main/LICENSE">
    <img src="https://img.shields.io/github/license/abhisheksharm-3/gpt-unloader?style=flat-square" alt="License">
  </a>
</p>

---

## 🚀 Features

### Core Performance
- **DOM Virtualization** - Automatically collapses messages outside the viewport to dramatically reduce memory usage
- **Configurable Buffer** - Adjust how many messages to keep rendered (3-20 messages)
- **Real-time Stats** - Monitor memory savings, DOM nodes, and reduction percentage

### Productivity Tools
- **Export Conversation** - Download your chat as Markdown, JSON, or plain text
- **Search Within Conversation** - Find text across all messages with highlighting
- **Conversation Statistics** - Word count, token estimates, message ratios
- **New Chat with Summary** - Start a fresh chat with an AI-generated summary

### Quality of Life
- **Keyboard Shortcuts** - Quick actions without leaving your keyboard
- **Notification Badges** - Tab title updates when new responses arrive
- **Theme Sync** - Automatically matches ChatGPT's dark/light mode

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Alt+U` | Toggle GPT Unloader on/off |
| `Alt+E` | Export conversation as Markdown |
| `Alt+F` | Open search |
| `Escape` | Close search / clear highlights |

---

## 📦 Installation

### From GitHub Releases (Recommended)

1. Download the latest `.zip` from [Releases](https://github.com/abhisheksharm-3/gpt-unloader/releases)
2. Extract the zip file
3. **Chrome**: 
   - Go to `chrome://extensions`
   - Enable "Developer mode" (top right)
   - Click "Load unpacked"
   - Select the extracted folder
4. **Firefox**: 
   - Go to `about:debugging`
   - Click "This Firefox" → "Load Temporary Add-on"
   - Select `manifest.json` from the extracted folder

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

---

## 🛠️ Development

```bash
# Start development server (popup only)
npm run dev

# Build for production
npm run build

# Lint code
npm run lint

# Bump version (updates package.json & manifest.json)
npm run version:patch   # 2.1.0 → 2.1.1
npm run version:minor   # 2.1.0 → 2.2.0
npm run version:major   # 2.1.0 → 3.0.0

# Create release package
npm run package
```

---

## 🔧 How It Works

When you scroll through a long ChatGPT conversation:

1. **Collapse** - Messages that leave the viewport are "collapsed" - their DOM content is replaced with a lightweight placeholder
2. **Store** - Original content is stored in memory for instant restoration
3. **Restore** - When you scroll back, messages are seamlessly restored
4. **Notify** - Stats are broadcast to the popup in real-time

This dramatically reduces the number of DOM nodes the browser needs to manage, resulting in:
- ⚡ Faster scrolling
- 💾 Lower memory usage
- 🔋 Better battery life
- 🧊 No more frozen tabs

---

## 📁 Project Structure

```
gpt-unloader/
├── src/
│   ├── content/           # Content script (runs on ChatGPT)
│   │   ├── lib/           # Modular utilities
│   │   │   ├── dom-virtualizer.ts
│   │   │   ├── export.ts
│   │   │   ├── search.ts
│   │   │   ├── statistics.ts
│   │   │   └── ...
│   │   └── index.ts       # Entry point
│   ├── popup/             # React popup UI
│   │   ├── components/    # UI components
│   │   ├── hooks/         # Custom React hooks
│   │   └── App.tsx        # Main component
│   ├── shared/            # Shared utilities & types
│   └── lib/               # Helper functions
├── public/
│   ├── manifest.json      # Extension manifest
│   └── icons/             # Extension icons
└── dist/                  # Build output
```

---

## 🏗️ Tech Stack

| Technology | Purpose |
|------------|---------|
| React 19 | Popup UI |
| TypeScript | Type safety |
| Tailwind CSS 4 | Styling |
| Vite (Rolldown) | Popup bundling |
| esbuild | Content script bundling (IIFE) |

---

## 🌐 Browser Compatibility

- ✅ Chrome (Manifest V3)
- ✅ Firefox (Manifest V3 with Gecko compatibility)
- ✅ Edge (Chromium-based)
- ✅ Brave
- ✅ Opera

---

## 📄 License

MIT © [Abhishek Sharma](https://github.com/abhisheksharm-3)

---

<p align="center">
  <sub>Made with ❤️ for ChatGPT power users</sub>
</p>
