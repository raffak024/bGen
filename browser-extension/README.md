# bGen AI Text Editor - Browser Extension

**Intelligenter AI Text-Editor für JEDES Textfeld im Web!**

Die bGen Browser Extension bringt die Macht von AI direkt in deinen Browser. Markiere Text in jedem Eingabefeld auf jeder Website und verbessere ihn sofort mit AI.

## ✨ Features

### 🆓 Free Version
- **Universal AI Text Editor**: Funktioniert auf JEDER Website mit JEDEM Textfeld
- **6 Quick Actions**:
  - **Kürzen**: Text auf das Wesentliche reduzieren
  - **Erweitern**: Mit Details und Erklärungen erweitern
  - **Professionell**: Formeller und professioneller formulieren
  - **Einfach**: Vereinfachen und klarer machen
  - **Umschreiben**: Komplett neu formulieren
  - **Magic ✨**: Automatisch verbessern (Grammatik, Stil, Klarheit)
- **AI Provider Support**:
  - OpenAI (GPT-4o, GPT-4o-mini, GPT-4-turbo, GPT-3.5-turbo)
  - Anthropic Claude (Claude 3.5 Sonnet, Claude 3.5 Haiku, Claude 3 Opus)
- **Inline Diff View**: Vergleiche Original mit Verbesserung vor dem Übernehmen
- **Autumn Theme**: Warmes, angenehmes Design

### 🌟 Pro Version
- **bGen Backend Integration**: Verbinde mit deinem bGen Backend
- **Task-Output Sync**: Füge gespeicherte Task-Outputs direkt in Textfelder ein
- **Team-Sharing**: Teile Verbesserungen mit deinem Team
- **Gespeicherte Kontexte**: Zugriff auf alle gespeicherten Bereiche und Kontexte

## 📦 Installation

### Chrome / Edge (Chromium-basiert)

1. **Extension laden**:
   ```bash
   cd /pfad/zu/browser-extension
   ```

2. **Chrome öffnen** → `chrome://extensions/`

3. **Developer Mode** aktivieren (oben rechts)

4. **"Load unpacked"** klicken

5. **Ordner auswählen**: `/pfad/zu/browser-extension/`

6. **Extension ist installiert!** 🎉

### Firefox

1. **Extension laden**:
   ```bash
   cd /pfad/zu/browser-extension
   ```

2. **Firefox öffnen** → `about:debugging#/runtime/this-firefox`

3. **"Load Temporary Add-on"** klicken

4. **manifest.json auswählen**

5. **Extension ist installiert!** 🎉

## ⚙️ Konfiguration

### Free Version Setup

1. **Extension-Icon** in der Browser-Toolbar klicken

2. **Tab "Basis-Einstellungen"**:
   - **Provider wählen**: OpenAI oder Claude
   - **API Key eingeben**:
     - OpenAI: https://platform.openai.com/api-keys
     - Claude: https://console.anthropic.com/settings/keys
   - **Modell wählen**: GPT-4o, Claude 3.5 Sonnet, etc.

3. **"Einstellungen speichern"** klicken

### Pro Version Setup (Optional)

1. **Tab "Pro Version"** öffnen

2. **"Pro-Modus aktivieren"** ankreuzen

3. **bGen Backend URL** eingeben (z.B. `http://localhost:3001`)

4. **JWT Token** eingeben:
   - Im bGen Frontend einloggen
   - Token aus LocalStorage kopieren (`localStorage.getItem('token')`)
   - Oder über `/auth/login` API-Endpoint holen

5. **"Verbindung testen"** klicken um Verbindung zu prüfen

6. **"Einstellungen speichern"** klicken

## 🚀 Verwendung

### Text verbessern (Free & Pro)

1. **Website öffnen** (z.B. Gmail, LinkedIn, Twitter, Google Docs, etc.)

2. **Text in einem Textfeld markieren**

3. **AI Toolbar erscheint automatisch** über dem markierten Text

4. **Quick Action wählen**:
   - Kürzen
   - Erweitern
   - Professionell
   - Einfach
   - Umschreiben
   - Magic ✨

5. **Diff-Modal erscheint**:
   - Vergleiche Original mit Verbesserung
   - "Übernehmen" oder "Ablehnen"

6. **Text wird automatisch ersetzt!**

### Task-Output einfügen (Nur Pro)

1. **Textfeld fokussieren** (Cursor setzen)

2. **Extension-Icon** klicken

3. **Task auswählen** aus der Liste

4. **Output wird eingefügt** ✓

## 🏗️ Architektur

```
browser-extension/
├── manifest.json           # Extension Manifest (Manifest V3)
├── scripts/
│   ├── content.js         # Content Script (läuft auf jeder Seite)
│   └── background.js      # Service Worker (AI API Calls)
├── styles/
│   └── content.css        # Toolbar & Modal Styles (Autumn Theme)
├── popup/
│   ├── popup.html         # Settings UI
│   ├── popup.css          # Settings Styles
│   └── popup.js           # Settings Logic
├── icons/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md
```

### Komponenten

#### Content Script (`content.js`)
- Erkennt Textauswahl in Input-Feldern und Textareas
- Zeigt AI Toolbar bei Textmarkierung
- Kommuniziert mit Background Script für AI-Requests
- Fügt verbesserten Text ein (inkl. Framework-Reaktivität für React, Vue, etc.)

#### Background Service Worker (`background.js`)
- Verarbeitet AI-Requests
- Unterstützt OpenAI und Claude APIs
- Pro Mode: Verbindung mit bGen Backend
- Verwaltet Extension-Settings

#### Popup UI (`popup.html/css/js`)
- Tab 1: Basis-Einstellungen (Provider, API Key, Modell)
- Tab 2: Pro Version (bGen Integration, Token, URL)
- Settings werden in `chrome.storage.sync` gespeichert

## 🔒 Datenschutz & Sicherheit

- **API Keys**: Werden NUR lokal in `chrome.storage.sync` gespeichert
- **Keine Server-Kommunikation**: Außer zu konfigurierten AI-Providern oder bGen Backend
- **Keine Daten-Collection**: Null Tracking, null Analytics
- **Open Source**: Gesamter Code ist einsehbar

## 🛠️ Development

### Debugging

**Chrome DevTools öffnen für**:
- **Content Script**: `Rechtsklick → Inspect` auf Seite, dann Console → "Content Script"
- **Background Worker**: `chrome://extensions/` → "Service Worker" → Inspect
- **Popup**: `Rechtsklick auf Extension-Icon` → Inspect Popup

**Logs**:
- Content Script: `[bGen Extension] Content script loaded`
- Background: `[bGen Extension] Background service worker started`

### Häufige Probleme

**Toolbar erscheint nicht**:
- Extension aktiviert? (`chrome://extensions/`)
- Text markiert in `<input>` oder `<textarea>`?
- Console öffnen und nach Errors suchen

**AI-Request schlägt fehl**:
- API Key korrekt eingegeben?
- Modell verfügbar für deinen Account?
- Rate Limits erreicht?
- Background Worker Console öffnen für Details

**Pro Mode verbindet nicht**:
- bGen Backend läuft? (`http://localhost:3001`)
- JWT Token noch gültig?
- CORS konfiguriert im Backend?

## 📝 API Endpoints (bGen Backend für Pro)

Die Extension nutzt folgende Endpoints:

- `POST /ai/quick-improve` - Text-Verbesserung
- `GET /auth/profile` - Token validieren
- `GET /tasks/:id` - Task-Output holen

## 🔄 Updates

### Version 1.0.0 (Initial Release)
- ✅ Universal AI Text Editor
- ✅ 6 Quick Actions
- ✅ OpenAI & Claude Support
- ✅ Inline Diff View
- ✅ Pro Mode: bGen Integration
- ✅ Autumn Theme Design

## 🤝 Contributing

Pull Requests sind willkommen! Für größere Änderungen bitte zuerst ein Issue öffnen.

## 📄 License

MIT License - siehe LICENSE file

## 🐛 Bugs & Feature Requests

GitHub Issues: https://github.com/your-repo/bgen-extension/issues

## 💬 Support

- Email: support@bgen.app
- Discord: https://discord.gg/bgen

---

**Made with ❤️ by the bGen Team**
