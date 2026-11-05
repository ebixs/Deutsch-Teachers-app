<div align="center">

# Deutsch-Teachers-app

### A tidy workspace for German teachers

**From managing students and planning classes to tracking payments and learning progress, all in one desktop app.**

[فارسی](README.md) · **English** · [Deutsch](README.de.md)

</div>

---

> **Note on the interface language:** the app was built for Persian-speaking German teachers, so the user interface is in Persian (right-to-left). This page explains what the app does for readers who do not read Persian.

## About

**Deutsch-Teachers-app** is a Windows desktop application that helps teachers of German manage their daily teaching and admin work in one place: students, classes, attendance, payments and learning progress. It started as a tool I built for my own German teacher and was later published as a general version for other teachers.

Each teacher enters their own profile and data. German coursebooks and the CEFR levels A1 to C2 are built into the student records.

## Features

| Area | What it does |
| --- | --- |
| **Dashboard** | Today's classes, number of students, outstanding payments and notes at a glance |
| **Students** | Contact details, CEFR level, coursebook, current lesson, progress, notes and photo |
| **Classes and calendar** | Private and group classes, scheduling, attendance |
| **Payments** | Per-lesson, monthly or package payments, in euro and toman |
| **Whiteboard** | Pen, highlighter, shapes, text, eraser, undo/redo, zoom and pan for use during lessons |
| **Reports** | Overview of classes, attendance, progress and finances |
| **Backups** | Automatic backups, manual backup and restore |
| **Profile and settings** | Teacher profile and picture |

## Install

The Windows installer is built by GitHub Actions.

1. Open the [Actions page](https://github.com/ebixs/Deutsch-Teachers-app/actions).
2. Open the latest successful run named **Build Deutsch-Teachers-app for Windows**.
3. Download the artifact **Deutsch-Teachers-app-Windows**. It contains the installer (`Deutsch-Teachers-app_Setup.exe`) and a portable version (`Deutsch-Teachers-app_Portable.exe`).
4. Run the installer, or start the portable version directly.

The installer is not code-signed, so Windows SmartScreen may show a warning. There is no ready-made release download yet; the build artifacts are the only way to get the app.

### Run from source

```bash
npm install
npm start          # starts Electron
npm run dist       # builds the Windows installer into dist/
```

## Data and privacy

- All data stays on your computer in a single JSON file: `%APPDATA%\Deutsch-Teachers-app\deutsch-teachers-data.json`. Normal use does not need an internet connection.
- Writes are atomic and the previous copy is kept as a `.bak` file.
- The app makes automatic backups (the 14 most recent are kept) in the `backups` folder next to the data file. Manual backups use the `.albackup` format. Before a restore, the app saves a copy of the current state.
- Keep backups in a safe place, separate from the main computer, and mind who else can use a shared computer, because the data contains student information.

## Tech stack

Electron (main process and preload script) with a single-page interface in plain HTML, CSS and JavaScript. Installers are built with electron-builder (NSIS and portable) in a GitHub Actions workflow. The app allows only one running instance, so two copies cannot write to the same data file.

## Project information

- **Version:** 1.0.0
- **Type:** desktop application (Windows)
- **Developer:** Ebrahim Salimi · [github.com/ebixs](https://github.com/ebixs)
- **Issues and suggestions:** [GitHub Issues](https://github.com/ebixs/Deutsch-Teachers-app/issues)
