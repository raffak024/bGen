# binomOne.aiGen
## KI-gestützter Textgenerator
**Entwickelt von:** Knörr Raphael | binomOne
**Projekt:** aiGen - AI-powered Text Generation Platform

---

## 🚀 Quick Start

```bash
# Alles starten (Backend + Frontend)
./start-aigen.sh

# Oder einzeln:
./start-backend.sh   # Backend auf Port 3000
./start-frontend.sh  # Frontend auf Port 5173
```

**Frontend:** http://localhost:5173  
**Backend:** http://localhost:3000

## 📂 Projektstruktur

```
aiGen/
├── aigen-new/          # React Frontend (TypeScript + Vite)
├── aiGen_test/         # Express Backend (Node.js + MongoDB)
├── start-aigen.sh      # Start-Skript: Alles
├── start-backend.sh   # Start-Skript: Backend
├── start-frontend.sh  # Start-Skript: Frontend
├── TECHNICAL_OVERVIEW.md  # Komplette technische Dokumentation (max 1 Satz pro Feature)
└── README.md          # Diese Datei
```

## 🎯 Features

- ✅ **Wizard-basierte Text-Generierung** (5 Schritte)
- ✅ **OpenAI + Claude API** Integration
- ✅ **Calculation-System** für Kontext, Lösungen, Sections
- ✅ **Tag-System** mit Standard & Custom Tags
- ✅ **Prompt-Speicherung** mit Versionshistorie
- ✅ **Auto-Select** von Bereichen nach letztem Zugriff
- ✅ **Business/Private Modi** mit Multi-Tenancy
- ✅ **3-Spalten Layout** mit AreaSidebar
- ✅ **Demo-Persistenz** via localStorage

## 📖 Technische Details

Siehe **TECHNICAL_OVERVIEW.md** für:
- Komplette Architektur-Übersicht
- Datenmodelle & API-Endpoints
- Workflow-Beschreibungen
- Jede Funktionalität in max 1 Satz erklärt

## 🔧 Voraussetzungen

- Node.js 18+
- MongoDB (muss laufen)
- npm

## 📝 Environment-Variablen

**Frontend** (`aigen-new/.env`):
```
VITE_API_URL=http://localhost:3000
```

**Backend** (`aiGen_test/.env`):
```
DB_URI=mongodb://localhost:27017/aigen
SECRET_KEY=your-secret-key
```

## 🏷️ Version

**V3_Alpha**
- Calculation-Integration komplett
- Prompt-Speicherung mit Wizard-Snapshot
- Demo-Persistenz
- Auto-Select & Business/Private-Trennung

## 🛠️ Entwicklung

```bash
# Backend entwickeln
cd aiGen_test
npm run dev

# Frontend entwickeln
cd aigen-new
npm run dev

# Build
npm run build
```

## 📊 Git-Repositories

- Frontend: `main` Branch
- Backend: `master` Branch

Beide Commits:
- Backend: `1c96af3` - V3_Alpha Backend Extensions
- Frontend: `a51bee4` - V3_Alpha Frontend Calculations & Prompt Storage
