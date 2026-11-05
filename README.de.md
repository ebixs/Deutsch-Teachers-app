<div align="center">

# Deutsch-Teachers-app

### Ein übersichtlicher Arbeitsplatz für Deutschlehrkräfte

**Von der Verwaltung der Lernenden und der Kursplanung bis zur Zahlungsverfolgung und zum Lernfortschritt: alles in einer Desktop-Anwendung.**

[فارسی](README.md) · [English](README.en.md) · **Deutsch**

</div>

---

> **Hinweis zur Sprache der Oberfläche:** Die Anwendung wurde für persischsprachige Deutschlehrkräfte entwickelt. Die Benutzeroberfläche ist deshalb auf Persisch (von rechts nach links). Diese Seite erklärt für Leserinnen und Leser ohne Persischkenntnisse, was die Anwendung kann.

## Über das Projekt

**Deutsch-Teachers-app** ist eine Windows-Desktop-Anwendung, mit der Lehrkräfte für Deutsch ihren Unterrichts- und Verwaltungsalltag an einem Ort organisieren: Lernende, Kurse, Anwesenheit, Zahlungen und Lernfortschritt. Ich habe sie zuerst für meinen eigenen Deutschlehrer gebaut und später als allgemeine Version für andere Lehrkräfte veröffentlicht.

Jede Lehrkraft trägt ihr eigenes Profil und ihre eigenen Daten ein. Deutsche Lehrbücher und die GER-Niveaus A1 bis C2 sind in den Datensätzen der Lernenden vorgesehen.

## Funktionen

| Bereich | Was er leistet |
| --- | --- |
| **Dashboard** | Kurse des Tages, Anzahl der Lernenden, offene Zahlungen und Notizen auf einen Blick |
| **Lernende** | Kontaktdaten, GER-Niveau, Lehrbuch, aktuelle Lektion, Fortschritt, Notizen und Foto |
| **Kurse und Kalender** | Einzel- und Gruppenunterricht, Terminplanung, Anwesenheit |
| **Zahlungen** | Zahlung pro Stunde, monatlich oder als Paket, in Euro und Toman |
| **Whiteboard** | Stift, Textmarker, Formen, Text, Radierer, Rückgängig/Wiederholen, Zoom und Verschieben für den Unterricht |
| **Berichte** | Überblick über Kurse, Anwesenheit, Fortschritt und Finanzen |
| **Sicherungen** | Automatische Sicherung, manuelle Sicherung und Wiederherstellung |
| **Profil und Einstellungen** | Profil und Bild der Lehrkraft |

## Installation

Das Windows-Installationsprogramm wird von GitHub Actions erstellt.

1. Die [Actions-Seite](https://github.com/ebixs/Deutsch-Teachers-app/actions) öffnen.
2. Den neuesten erfolgreichen Lauf **Build Deutsch-Teachers-app for Windows** öffnen.
3. Das Artefakt **Deutsch-Teachers-app-Windows** herunterladen. Es enthält das Installationsprogramm (`Deutsch-Teachers-app_Setup.exe`) und eine portable Version (`Deutsch-Teachers-app_Portable.exe`).
4. Das Installationsprogramm ausführen oder die portable Version direkt starten.

Das Installationsprogramm ist nicht signiert, daher kann Windows SmartScreen eine Warnung anzeigen. Es gibt noch keinen fertigen Release-Download; die Build-Artefakte sind derzeit der einzige Weg, die Anwendung zu erhalten.

### Aus dem Quellcode starten

```bash
npm install
npm start          # startet Electron
npm run dist       # erstellt das Windows-Installationsprogramm in dist/
```

## Daten und Datenschutz

- Alle Daten bleiben auf dem eigenen Computer in einer einzigen JSON-Datei: `%APPDATA%\Deutsch-Teachers-app\deutsch-teachers-data.json`. Für den normalen Gebrauch ist keine Internetverbindung nötig.
- Schreibvorgänge sind atomar; die vorherige Fassung bleibt als `.bak`-Datei erhalten.
- Die Anwendung legt automatische Sicherungen an (die 14 neuesten bleiben erhalten), und zwar im Ordner `backups` neben der Datendatei. Manuelle Sicherungen verwenden das Format `.albackup`. Vor einer Wiederherstellung speichert die Anwendung eine Kopie des aktuellen Stands.
- Sicherungen sollten an einem sicheren Ort getrennt vom Hauptrechner liegen. Bei gemeinsam genutzten Computern ist zu beachten, wer Zugriff hat, denn die Daten enthalten Angaben zu Lernenden.

## Technik

Electron (Hauptprozess und Preload-Skript) mit einer Single-Page-Oberfläche in reinem HTML, CSS und JavaScript. Die Installationsprogramme entstehen mit electron-builder (NSIS und portabel) in einem GitHub-Actions-Workflow. Es läuft immer nur eine Instanz der Anwendung, damit nicht zwei Kopien in dieselbe Datendatei schreiben.

## Projektinformationen

- **Version:** 1.0.0
- **Art:** Desktop-Anwendung (Windows)
- **Entwickler:** Ebrahim Salimi · [github.com/ebixs](https://github.com/ebixs)
- **Fehler und Vorschläge:** [GitHub Issues](https://github.com/ebixs/Deutsch-Teachers-app/issues)
