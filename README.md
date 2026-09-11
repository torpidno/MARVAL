# 🛡️ Marvel Watch Tracker (MARVAL)

A sleek, modern, cross-platform **Marvel Cinematic Universe (MCU) Watch Order and Progress Tracker** built with **React 19**, **Vite**, **Tailwind CSS**, **Electron**, and **Capacitor**.

Track your journey through the Infinity Saga, Multiverse Saga, and beyond across Web, Desktop, and Android.

---

## ✨ Features

- 📅 **Dual Viewing Modes**: Seamlessly toggle between **Chronological Timeline** and **Release Order**.
- 🔍 **Advanced Filtering & Search**:
  - Filter by Phase (Phase 1 to Phase 6+).
  - Filter by Media Type (Movies, TV Shows, One-Shots, Special Presentations).
  - Filter by Status (Watched vs. Unwatched).
  - Instant live search by title, character, or keyword.
- 📊 **Progress & Analytics Dashboard**:
  - Total watch progress percentage.
  - Estimated hours watched vs. remaining.
  - Phase-by-phase completion breakdown.
- ☁️ **Cross-Device Cloud Sync (GitHub Gist)**:
  - Synchronize your watch progress seamlessly across Web, Desktop, and Android using GitHub Gists.
  - Automatic background sync on progress changes.
  - Conflict resolution & manual sync options.
- 💾 **Local Backup & Restore**: Export and import your watch history as JSON files.
- 🎬 **Detailed Media Info**: Pop-up modal containing synopses, release dates, durations, phase info, and character appearances.
- 📱 **Multi-Platform**:
  - 🌐 **Web**: Fast and responsive progressive web application.
  - 💻 **Desktop (Windows/Mac/Linux)**: Native desktop wrapper built with Electron.
  - 📱 **Android**: Native mobile experience built with Capacitor.

---

## 🛠️ Tech Stack

- **Frontend**: [React 19](https://react.dev/), [Vite](https://vitejs.dev/), [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Data & Visualizations**: [D3 Force](https://d3js.org/d3-force)
- **Desktop Runtime**: [Electron](https://www.electronjs.org/), [electron-builder](https://www.electron.build/)
- **Mobile Runtime**: [Capacitor Android](https://capacitorjs.com/)
- **Linter**: [Oxlint](https://oxc.rs/)

---

## 🚀 Quick Install & Getting Started

### Option 1: Download Pre-built Releases (Recommended for Users)
Pre-packaged desktop installers and Android builds are available on the [**GitHub Releases**](https://github.com/torpidno/MARVAL/releases) page:
- 🪟 **Windows**: Download the latest `.exe` installer from [Releases](https://github.com/torpidno/MARVAL/releases/latest).
- 📱 **Android**: Download the latest `.apk` from [Releases](https://github.com/torpidno/MARVAL/releases/latest).

---

### Option 2: Run from Source (Developers)

#### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/) (included with Node.js)
- [Git](https://git-scm.com/)

#### Setup Steps

1. **Clone the repository:**
   ```bash
   git clone https://github.com/torpidno/MARVAL.git
   cd MARVAL
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the Application:**

   - **Web (Browser)**:
     ```bash
     npm run dev
     ```
     Open [http://localhost:5173](http://localhost:5173) in your browser.

   - **Desktop (Electron)**:
     ```bash
     npm run electron
     ```

   - **Android (Capacitor)**:
     ```bash
     npm run android:sync
     npm run android:open
     ```

---

## 📦 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Starts the Vite development server on port 5173 |
| `npm run build` | Compiles and builds the production web app into `dist/` |
| `npm run preview` | Previews the production build locally |
| `npm run electron` | Builds the web app and launches the Electron desktop app |
| `npm run dist` | Packages the Electron app for production deployment (NSIS installer) |
| `npm run android:sync` | Builds the web app and syncs assets to the Capacitor Android project |
| `npm run android:open` | Opens the Android project in Android Studio |
| `npm run android:update`| Runs the custom Android sync & update PowerShell script |
| `npm run lint` | Runs Oxlint to check code quality |

---

## ☁️ Setting up Cloud Sync (GitHub Gist)

To sync your watch progress across devices:

1. Generate a **GitHub Personal Access Token (classic or fine-grained)** with `gist` permissions:
   - Go to [GitHub Tokens Settings](https://github.com/settings/tokens).
   - Create a token with the `gist` scope.
2. In the app, click the **Cloud Sync** icon in the navbar.
3. Paste your GitHub Token:
   - If you have an existing Gist ID with your progress, provide it to sync immediately.
   - Otherwise, leave the Gist ID blank to auto-create a new private Gist for your progress.

---

## 📁 Project Structure

```text
├── android/              # Capacitor Android native project
├── android-app/          # Standalone Android studio workspace
├── electron/             # Electron main process and preload scripts
├── public/               # Static assets & icons
├── src/
│   ├── assets/           # Application images and media assets
│   ├── components/       # UI components (Timeline, Dashboard, Modals, Navbar, etc.)
│   ├── constants/        # UI configuration and filter constants
│   ├── data/             # Complete MCU catalog database (marvelData.js)
│   ├── hooks/            # Custom hooks (useWatchProgress, useModalA11y, etc.)
│   ├── App.jsx           # Main application entry component
│   ├── index.css         # Tailwind and global styles
│   └── main.jsx          # React DOM mounting
├── capacitor.config.json # Capacitor runtime configuration
├── package.json          # Project metadata and dependencies
└── vite.config.js        # Vite build configuration
```

---

## 📄 License & Disclaimer

This project is open-source and intended for personal, educational, and non-commercial use only.

*Marvel, Marvel Cinematic Universe, and all related characters and elements are trademarks of Marvel Characters, Inc. / The Walt Disney Company.*

