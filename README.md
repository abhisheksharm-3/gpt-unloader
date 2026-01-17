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
</p>

---

## ✨ What's New in v2.3

- **Message Timestamps** — See when each message was sent (persists across refreshes)
- **Bookmarks** — Star important messages for quick access
- **Templates** — Save and reuse common prompts
- **API Cost Estimator** — Estimate costs with 30+ OpenAI models
- **Memory Dashboard** — Real-time chart showing memory savings
- **Reading Progress** — Resume reading where you left off
- **Multi-Tab Sync** — Manage all ChatGPT tabs from the popup
- **Context Menu** — Right-click actions on any ChatGPT page
- **Settings Panel** — Toggle features on/off

---

## 🚀 Features

### Core Performance
- **DOM Virtualization** — Collapses off-screen messages to reduce memory
- **Lazy Image Loading** — Defers images in collapsed messages
- **Configurable Buffer** — Adjust how many messages to keep rendered (3-20)
- **Real-time Stats** — Monitor memory savings, DOM nodes, and reduction %
- **Memory Chart** — Visualize savings over time

### Productivity Tools
- **Export Conversation** — Download as Markdown, JSON, or plain text
- **Search Within Conversation** — Find text with highlighting
- **Conversation Statistics** — Word count, token estimates, message ratios
- **API Cost Estimator** — Calculate estimated API costs per model
- **Bookmarks** — Star messages and jump to them from the popup
- **Templates** — Save common prompts for quick insertion
- **New Chat with Summary** — Start fresh with an AI-generated summary

### Quality of Life
- **Message Timestamps** — Relative times shown in the action toolbar
- **Reading Progress** — "Resume Reading" button on long conversations
- **Multi-Tab Sync** — See all ChatGPT tabs, optimize all at once
- **Context Menu** — Right-click to export, search, or toggle
- **Keyboard Shortcuts** — Quick actions without leaving your keyboard
- **Notification Badges** — Tab title updates when responses arrive
- **Theme Sync** — Matches ChatGPT's dark/light mode

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
3. **Chrome/Edge/Brave**: 
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
git clone https://github.com/abhisheksharm-3/gpt-unloader.git
cd gpt-unloader
npm install
npm run build
# Load the dist/ folder in your browser
```

---

## 🛠️ Development

```bash
npm run dev           # Start dev server (popup)
npm run build         # Build for production
npm run lint          # Lint code
npm run package       # Create release zip

# Version management
npm run version:patch # 2.3.0 → 2.3.1
npm run version:minor # 2.3.0 → 2.4.0
npm run version:major # 2.3.0 → 3.0.0
```

---

## 🔧 How It Works

1. **Collapse** — Messages leaving the viewport are replaced with lightweight placeholders
2. **Store** — Original content stored in memory for instant restoration
3. **Restore** — Scroll back and messages seamlessly reappear
4. **Defer Images** — Images in collapsed messages don't load until restored

**Results:**
- ⚡ Faster scrolling
- 💾 Lower memory usage (~98% reduction on long chats)
- 🔋 Better battery life
- 🧊 No more frozen tabs

---

## 📁 Project Structure

```
gpt-unloader/
├── src/
│   ├── background/        # Service worker (context menu, multi-tab)
│   ├── content/           # Content script (runs on ChatGPT)
│   │   ├── lib/
│   │   │   ├── dom-virtualizer.ts
│   │   │   ├── bookmarks.ts
│   │   │   ├── timestamps.ts
│   │   │   ├── reading-progress.ts
│   │   │   ├── templates.ts
│   │   │   └── ...
│   │   └── index.ts
│   ├── popup/             # React popup UI
│   │   ├── components/
│   │   │   ├── MemoryChart.tsx
│   │   │   ├── BookmarksPanel.tsx
│   │   │   ├── TemplatesPanel.tsx
│   │   │   ├── TabsPanel.tsx
│   │   │   ├── SettingsPanel.tsx
│   │   │   └── ...
│   │   └── hooks/
│   ├── shared/            # Shared types & constants
│   └── lib/               # Helper functions
├── public/
│   ├── manifest.json
│   └── icons/
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
| esbuild | Content/background script bundling |

---

## 🌐 Browser Compatibility

- ✅ Chrome (Manifest V3)
- ✅ Firefox (Manifest V3 + Gecko)
- ✅ Edge
- ✅ Brave
- ✅ Opera

---

<p align="center">
  <sub>Made with ❤️ for ChatGPT power users</sub>
</p>
