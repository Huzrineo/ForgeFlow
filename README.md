# ForgeFlow

**Local automation. Zero cloud. Full control.**

ForgeFlow is a privacy-first desktop automation engine that lets you build visual automations, run AI-powered actions, and keep your data 100% on-device.

<!-- ![ForgeFlow Screenshot](screenshots/screenshot01.png) -->

## ✨ Features

- 🎨 **Visual Automation Builder** - Node-based editor like n8n, with drag & drop
- 🤖 **AI-Native** - First-class AI actions (summarize, classify, extract, generate)
- 🔒 **Privacy-First** - All data stays local, no cloud required
- ⚡ **Fast & Lightweight** - Built with Go + React, minimal resource usage
- 🌙 **Dark Mode** - Beautiful dark UI by default

## 🚀 Quick Start

### Prerequisites

- Go 1.21+
- Node.js 20+
- [Wails CLI](https://wails.io/docs/gettingstarted/installation)

### Development

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/ForgeFlow.git
cd ForgeFlow

# Run in development mode (hot reload)
wails dev
```

### Build

```bash
# Build production binary
wails build
```

The binary will be in `build/bin/`.

## 🧩 Node Types

### Triggers
- **File Trigger** - React to file changes
- **Schedule** - Cron or interval-based
- **Webhook** - HTTP receiver
- **Manual** - Button press
- **System** - App/process events

### Actions
- **File Ops** - Move, rename, delete files
- **HTTP Request** - Call external APIs
- **Shell Command** - Run system commands (sandboxed)
- **Notify** - Desktop notifications

### AI Actions
- **Summarize** - AI-powered summaries
- **Classify** - Categorize content
- **Extract** - Pull out entities/data
- **Rewrite** - Transform text
- **Generate** - Create new content
- **Custom Prompt** - Your own AI prompts

## 🛠️ Tech Stack

| Component | Technology |
|-----------|------------|
| Framework | [Wails v2](https://wails.io) |
| Backend | Go 1.21+ |
| Frontend | React 19 + TypeScript 5.8 |
| Styling | Tailwind CSS v4 |
| Build | Vite 7 |
| Node Editor | @xyflow/react v12 |
| State | Zustand |
| Icons | Lucide React |

## 📁 Project Structure

```
ForgeFlow/
├── frontend/           # React frontend
│   ├── src/
│   │   ├── components/ # UI components
│   │   ├── stores/     # Zustand stores
│   │   └── types/      # TypeScript types
├── main.go             # App entry point
├── app.go              # App utilities
├── engine.go           # Execution engine
└── storage.go          # Persistence
```

## 🗺️ Roadmap

### Phase 1 (MVP)
- [x] Core engine
- [x] Visual builder UI
- [x] File + time triggers
- [ ] Manual run execution

### Phase 2
- [ ] AI nodes with OpenAI/local models
- [ ] HTTP actions
- [ ] Logs & debugger

### Phase 3
- [ ] Mobile companion app (Flutter)
- [ ] Notifications
- [ ] Plugin system

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

Built with ❤️ for privacy-conscious automation enthusiasts.
