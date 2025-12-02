# aiGen Form Filler - Chrome Extension

Automatisches Ausfüllen von Web-Formularen mit generierten aiGen Berichten.

## 🎯 Features

- **Automatisches Login** mit aiGen Backend
- **Bericht-Auswahl** aus generierten Reports
- **Intelligentes Form-Filling** mit mehreren Strategien:
  - Matching nach Label-Text
  - Matching nach Section-Index
  - Matching nach Feld-Namen/IDs
  - Metadata-Felder (Titel, Kunde, Projekt)
- **Multi-Framework Support**: Funktioniert mit React, Vue, Angular
- **Kunden/Projekt-Verknüpfung**: Zeigt verknüpfte Kunden (Business) oder Projekte (Private)

## 📋 Installation

### 1. Icons erstellen (temporär - Platzhalter)

Erstellen Sie PNG-Icons in `icons/`:
- `icon16.png` (16x16px)
- `icon48.png` (48x48px)
- `icon128.png` (128x128px)

**Einfacher Weg mit ImageMagick:**
```bash
cd icons
# Blaues Icon mit "B"
convert -size 16x16 xc:#667eea -gravity center -pointsize 12 -fill white -annotate +0+0 "B" icon16.png
convert -size 48x48 xc:#667eea -gravity center -pointsize 36 -fill white -annotate +0+0 "B" icon48.png
convert -size 128x128 xc:#667eea -gravity center -pointsize 96 -fill white -annotate +0+0 "B" icon128.png
```

### 2. Extension in Chrome laden

1. Öffnen Sie `chrome://extensions/`
2. Aktivieren Sie den "Entwicklermodus" (oben rechts)
3. Klicken Sie "Entpackte Erweiterung laden"
4. Wählen Sie den `chrome-extension` Ordner

## 🚀 Verwendung

### 1. Backend starten
```bash
cd /home/raphi/aiGen/aiGen_test
node backend/server.js
# Server läuft auf http://localhost:3001
```

### 2. Extension verwenden

1. **Klicken Sie auf das aiGen Icon** in der Chrome-Toolbar
2. **Login**:
   - Username: `userB` (Business) oder `userP` (Private)
   - Password: `test123`
3. **Bericht auswählen** aus der Liste
4. **Öffnen Sie die Zielwebseite** mit dem Formular
5. **Klicken Sie "In Formular einfüllen"**

### 3. Formular-Anforderungen

Die Extension füllt Felder aus, die folgende Attribute haben:

**Nach Section-Titel:**
```html
<label>Ausgangslage</label>
<textarea name="ausgangslage"></textarea>
```

**Nach Section-Index:**
```html
<input name="section-0" />
<textarea id="section-1"></textarea>
<input data-section="2" />
```

**Nach Metadata:**
```html
<input name="title" />
<input id="kunde" />
<input data-field="project" />
```

## 🔧 Konfiguration

### API-Endpunkt ändern

In `popup.js`, Zeile 1:
```javascript
const API_URL = 'http://localhost:3001';  // Ändern für Production
```

### Matching-Strategien anpassen

In `content.js`, Funktionen:
- `findFieldsByLabel()` - Label-Matching
- `findFieldsByIndex()` - Index-Matching
- `findFieldsByKey()` - Metadata-Matching

## 📊 Wie es funktioniert

1. **Popup** lädt Berichte vom aiGen Backend
2. **User wählt Bericht** mit generierten Inhalten
3. **Content Script** wird injiziert in aktive Seite
4. **Form-Filling-Algorithmus**:
   - Findet alle Input-Felder
   - Matched nach Label, Name, ID, data-attributes
   - Füllt mit generiertem Content aus Bericht
   - Triggert Change-Events für Frameworks

## 🗂️ Report-Struktur

Berichte müssen folgende Struktur haben:

```javascript
{
  _id: "...",
  title: "Jahresbericht 2025",
  customerId: "...",  // Optional
  customer: {         // Optional, populated
    displayName: "Acme Corp",
    type: "company"
  },
  sections: [
    {
      id: "section-0",
      title: "Ausgangslage",
      description: "...",
      generatedContent: "Der generierte Text...",  // WICHTIG!
      subsections: [
        {
          id: "subsection-0-0",
          title: "Beschreibung",
          generatedContent: "..."  // WICHTIG!
        }
      ]
    }
  ]
}
```

## 🔐 Sicherheit

- Token wird in `chrome.storage.local` gespeichert
- HTTPS in Production empfohlen
- Host permissions nur für localhost (Development)

## 🐛 Debugging

1. **Extension Popup debuggen**:
   - Rechtsklick auf Extension Icon → "Inspect Popup"

2. **Content Script debuggen**:
   - F12 auf Zielseite → Console
   - Suche nach "aiGen Form Filler loaded"

3. **Background Script debuggen**:
   - `chrome://extensions/` → "Hintergrundseite prüfen"

## 📝 TODO / Verbesserungen

- [ ] Production API-URL Konfiguration
- [ ] OAuth statt Passwort-Login
- [ ] Icon-Design verbessern
- [ ] Options-Seite für Einstellungen
- [ ] Feld-Mapping speichern für Wiederverwendung
- [ ] Partial-Fill (nur ausgewählte Sections)
- [ ] Multi-Language Support

## 🔗 Integration mit aiGen

### Erforderliche Backend-Änderungen

Das aiGen Backend muss `generatedContent` in Reports speichern:

```javascript
// Bei Report-Generierung
const report = {
  ...
  sections: sections.map(section => ({
    ...section,
    generatedContent: aiGeneratedText,  // AI-Output hier speichern
    subsections: section.subsections.map(sub => ({
      ...sub,
      generatedContent: aiGeneratedSubtext
    }))
  }))
};
```

## 📄 Lizenz

Teil des aiGen Projekts
