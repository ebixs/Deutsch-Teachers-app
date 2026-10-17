'use strict';
const { app, BrowserWindow, Menu, dialog, ipcMain, shell } = require('electron');
const path = require('path');
const fs = require('fs');

// ---- single instance (two copies writing the same file would be dangerous) ----
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) { app.quit(); }

// ---- fixed data location: %APPDATA%\LTeachers App ----
const legacyDataDir = path.join(app.getPath('appData'), 'AysudaLern');
const newDataDir = path.join(app.getPath('appData'), 'LTeachers App');
try { if (!fs.existsSync(newDataDir) && fs.existsSync(legacyDataDir)) fs.cpSync(legacyDataDir, newDataDir, { recursive: true }); } catch (e) { console.error('legacy data migration failed', e); }
app.setPath('userData', newDataDir);
const DATA_DIR = app.getPath('userData');
const DATA_FILE = path.join(DATA_DIR, 'aysudalern-data.json');
const BACKUP_DIR = path.join(DATA_DIR, 'backups');
const KEEP_AUTO_BACKUPS = 14;

let config = { startWithDemoData: false };
try { config = { ...config, ...JSON.parse(fs.readFileSync(path.join(__dirname, 'app-config.json'), 'utf8')) }; } catch (_) {}

// ---- persistent store (one JSON file, atomic writes, previous copy kept as .bak) ----
let store = {};
let dirty = false, timer = null;

function readJson(file) { return JSON.parse(fs.readFileSync(file, 'utf8')); }

function loadStore() {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  for (const f of [DATA_FILE, DATA_FILE + '.bak']) {
    try {
      if (!fs.existsSync(f)) continue;
      const d = readJson(f);
      if (d && typeof d === 'object' && !Array.isArray(d)) { store = d; return; }
    } catch (e) {
      // corrupted main file: keep it for inspection and fall through to the .bak copy
      try { fs.copyFileSync(f, f + '.corrupt-' + Date.now()); } catch (_) {}
    }
  }
  store = {};
}

function flushNow() {
  if (!dirty) return;
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    const tmp = DATA_FILE + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(store), 'utf8');
    if (fs.existsSync(DATA_FILE)) { try { fs.copyFileSync(DATA_FILE, DATA_FILE + '.bak'); } catch (_) {} }
    fs.renameSync(tmp, DATA_FILE);
    dirty = false;
  } catch (e) { console.error('save failed', e); }
}
function scheduleFlush() { dirty = true; clearTimeout(timer); timer = setTimeout(flushNow, 400); }

ipcMain.on('store:boot', (e) => { e.returnValue = { data: store, config, dataDir: DATA_DIR }; });
ipcMain.on('store:set', (_e, k, v) => { store[String(k)] = String(v); scheduleFlush(); });
ipcMain.on('store:remove', (_e, k) => { delete store[String(k)]; scheduleFlush(); });
ipcMain.on('store:clear', () => { store = {}; scheduleFlush(); });

// ---- backups ----
const pad = (n) => String(n).padStart(2, '0');
function stamp(d = new Date()) { return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; }
function snapshot() { return JSON.stringify({ app: 'LTeachers App', format: 1, createdAt: new Date().toISOString(), data: store }); }
const hasData = () => Object.keys(store).length > 0;

function autoBackup() {
  try {
    if (!hasData()) return;
    flushNow();
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
    fs.writeFileSync(path.join(BACKUP_DIR, `LTeachers App_Auto_${stamp()}.albackup`), snapshot(), 'utf8');
    const autos = fs.readdirSync(BACKUP_DIR).filter((f) => /^LTeachers App_Auto_.*\.albackup$/.test(f)).sort();
    autos.slice(0, Math.max(0, autos.length - KEEP_AUTO_BACKUPS)).forEach((f) => { try { fs.unlinkSync(path.join(BACKUP_DIR, f)); } catch (_) {} });
  } catch (e) { console.error('auto backup failed', e); }
}

let win = null;

ipcMain.handle('backup:create', async () => {
  try {
    flushNow();
    const r = await dialog.showSaveDialog(win, {
      title: 'ذخیره Backup',
      defaultPath: path.join(app.getPath('documents'), `LTeachers App_Backup_${stamp()}.albackup`),
      filters: [{ name: 'LTeachers App Backup', extensions: ['albackup'] }]
    });
    if (r.canceled || !r.filePath) return { ok: false };
    fs.writeFileSync(r.filePath, snapshot(), 'utf8');
    return { ok: true, path: r.filePath };
  } catch (e) { return { ok: false, error: String(e.message || e) }; }
});

ipcMain.handle('backup:restore', async () => {
  try {
    const r = await dialog.showOpenDialog(win, {
      title: 'انتخاب فایل Backup',
      properties: ['openFile'],
      filters: [{ name: 'LTeachers App Backup', extensions: ['albackup', 'json'] }]
    });
    if (r.canceled || !r.filePaths[0]) return { ok: false };
    const b = readJson(r.filePaths[0]);
    if (!b || !(b.app === 'LTeachers App' || b.app === 'AysudaLern') || !b.data || typeof b.data !== 'object') {
      return { ok: false, error: 'این فایل، Backup معتبر LTeachers App نیست.' };
    }
    const c = await dialog.showMessageBox(win, {
      type: 'warning', buttons: ['بازیابی', 'لغو'], defaultId: 1, cancelId: 1,
      title: 'بازیابی Backup',
      message: 'اطلاعات فعلی با اطلاعات این Backup جایگزین می‌شود.',
      detail: 'قبل از بازیابی، یک نسخه از اطلاعات فعلی به‌طور خودکار نگه داشته می‌شود.'
    });
    if (c.response !== 0) return { ok: false };
    if (hasData()) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true });
      fs.writeFileSync(path.join(BACKUP_DIR, `LTeachers App_BeforeRestore_${Date.now()}.albackup`), snapshot(), 'utf8');
    }
    store = {};
    for (const [k, v] of Object.entries(b.data)) store[String(k)] = String(v);
    dirty = true; flushNow();
    win.webContents.reload();
    return { ok: true };
  } catch (e) { return { ok: false, error: 'فایل Backup قابل خواندن نیست.' }; }
});

ipcMain.on('backup:openFolder', () => { fs.mkdirSync(BACKUP_DIR, { recursive: true }); shell.openPath(BACKUP_DIR); });
ipcMain.on('win:refocus', () => { if (win && !win.isDestroyed()) { win.blur(); win.focus(); win.webContents.focus(); } });

// ---- window ----
function createWindow() {
  win = new BrowserWindow({
    width: 1400, height: 880, minWidth: 1000, minHeight: 680,
    backgroundColor: '#f7f2f0',
    title: 'LTeachers App — German Learning Studio',
    icon: path.join(__dirname, 'build', 'icon.ico'),
    autoHideMenuBar: true,
    show: false,
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, nodeIntegration: false, spellcheck: false }
  });
  Menu.setApplicationMenu(null);
  win.once('ready-to-show', () => { win.maximize(); win.show(); });
  win.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  win.webContents.on('will-navigate', (e) => e.preventDefault());
  win.webContents.session.on('will-download', (_e, item) => {
    // the old "JSON export" button uses a normal browser download; show a Save dialog for it
    item.setSaveDialogOptions({ defaultPath: path.join(app.getPath('documents'), item.getFilename()) });
  });
  win.loadFile(path.join(__dirname, 'renderer', 'index.html'));
  win.on('closed', () => { win = null; });
}

app.on('second-instance', () => { if (win) { if (win.isMinimized()) win.restore(); win.focus(); } });

app.whenReady().then(() => {
  if (!gotLock) return;
  loadStore();
  autoBackup();
  setInterval(autoBackup, 30 * 60 * 1000);
  createWindow();
});
app.on('before-quit', () => { flushNow(); autoBackup(); });
app.on('window-all-closed', () => { flushNow(); app.quit(); });
