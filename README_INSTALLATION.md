# aiGen Installation & Setup

## Schnellstart

```bash
# 1. Onboarding installieren
cd /home/raphi/bGen
./install-onboarding.sh

# 2. Frontend starten
cd bgen-new
npm run dev

# 3. Öffne Browser
# http://localhost:5173
```

## Installation Details

### Automatische Installation (Empfohlen)

```bash
./install-onboarding.sh
```

✅ Installiert alle Dependencies
✅ Prüft Komponenten  
✅ Startet Backend automatisch
✅ Zeigt Installations-Report

### Manuelle Installation

```bash
# Frontend Dependencies
cd /home/raphi/bGen/bgen-new
npm install canvas-confetti uuid
npm install --save-dev @types/canvas-confetti @types/uuid

# Backend starten
cd /home/raphi/bGen/bGen_test
npm run dev
```

## Updates

```bash
./update-onboarding.sh
```

✅ Stoppt Services
✅ Updated Dependencies
✅ Startet Services neu

## Zugriff

- **Main App:** http://localhost:5173
- **Onboarding:** http://localhost:5173/#/onboarding  
- **Demo:** http://localhost:5173/#/demo
- **Backend API:** http://localhost:3001

## Browser Extension

```bash
# Chrome/Edge
1. chrome://extensions/
2. Developer Mode AN
3. "Load unpacked"
4. Wähle: /home/raphi/bGen/browser-extension/
```

## Dokumentation

- **Quick Start:** QUICK_START.md
- **Vollständig:** ONBOARDING_README.md
- **Extension:** browser-extension/README.md

## Support

- GitHub Issues
- support@bgen.app
