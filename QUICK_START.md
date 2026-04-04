# aiGen Onboarding - Quick Start Guide

## 🚀 Schnellstart in 3 Schritten

### Schritt 1: Installation

```bash
cd /home/raphi/bGen
./install-onboarding.sh
```

Das Script:
- ✓ Prüft alle Verzeichnisse
- ✓ Installiert Dependencies (canvas-confetti, uuid)
- ✓ Verifiziert Komponenten
- ✓ Startet Backend automatisch

**Dauer:** ~30 Sekunden

---

### Schritt 2: Frontend starten

```bash
cd /home/raphi/bGen/bgen-new
npm run dev
```

**URL:** http://localhost:5173

---

### Schritt 3: Onboarding nutzen

#### Option A: Über Login-Seite

1. Öffne http://localhost:5173
2. Klicke auf **"Erste Schritte"** Button (oranges Banner)
3. Wähle Demo oder Custom

#### Option B: Direkter Zugriff

```
http://localhost:5173/#/onboarding
```

⚠️ **Wichtig:** Authentifizierung erforderlich!

---

## 📋 Verwendungsmöglichkeiten

### 1. Demo-Bereiche nutzen (Empfohlen für Einsteiger)

**Vorteile:**
- Sofort einsatzbereit
- Professionelle Vorlagen
- Keine Konfiguration nötig

**Verfügbare Demos:**
1. **PC/Arbeitsplatz - Hilfsmittel** (IV-Dokumentation)
2. **Umfeldkontrollgeräte** (Assistive Technologien)
3. **Kommunikationsgeräte** (Spracheinschränkungen)

**Flow:**
```
Welcome Screen → Demo auswählen → Finalize → Erstellen → Fertig!
```

**Dauer:** ~10 Sekunden

---

### 2. Custom Bereich erstellen (Für individuelle Anforderungen)

**Vorteile:**
- AI-Unterstützung bei jedem Schritt
- Vollständige Kontrolle
- Perfekt für spezifische Use Cases

**Flow:**
```
Welcome Screen
  → "Eigenen Bereich erstellen"
  → Grundlagen (Name, Prompt, Kontext)
  → Struktur (Sections, Subsections)
  → Übersicht & Erstellen
  → Success!
```

**Dauer:** ~2-5 Minuten (mit AI-Hilfe)

---

## 🎨 AI-Unterstützung nutzen

In **Schritt 1: Grundlagen** gibt es AI-Vorschläge:

### Basis Prompt
```
1. Bereichsname eingeben (z.B. "Marketing Texte")
2. Klick auf "AI Vorschlag" neben Basis Prompt
3. AI generiert professionellen Prompt
4. Automatisches Einfüllen nach 1 Sekunde
```

### Ausgangslage
```
1. Basis Prompt muss ausgefüllt sein
2. Klick auf "AI Vorschlag"
3. AI erstellt strukturierte Beschreibung
```

### Geplante Lösung
```
1. Kontext muss ausgefüllt sein
2. Klick auf "AI Vorschlag"
3. AI formuliert Ziele und Lösungsansätze
```

---

## 🔄 Updates durchführen

```bash
cd /home/raphi/bGen
./update-onboarding.sh
```

Das Script:
- Stoppt laufende Prozesse
- Updated alle Dependencies
- Startet Services neu

**Dauer:** ~1 Minute

---

## 🌐 Browser Extension installieren

### Chrome/Edge

```bash
1. Chrome öffnen: chrome://extensions/
2. Developer Mode aktivieren (Toggle oben rechts)
3. "Load unpacked" klicken
4. Verzeichnis auswählen: /home/raphi/bGen/browser-extension/
5. Extension erscheint in Toolbar
```

### Verwendung

```
1. Extension-Icon klicken
2. Login mit aiGen Credentials
   ODER
   "Ohne Login verwenden" → API-Key Mode
3. Settings konfigurieren
4. Auf beliebiger Website: Text markieren → AI-Toolbar erscheint
```

---

## 🎯 Best Practices

### Für Demo-Bereiche
✅ Ideal für schnellen Start
✅ Beste Qualität out-of-the-box
✅ Lernmaterial für eigene Bereiche

### Für Custom Bereiche
✅ Nutze AI-Vorschläge für bessere Qualität
✅ Starte mit einfacher Struktur (2-3 Sections)
✅ Erweitere später nach Bedarf
✅ Nutze Tags für bessere Organisation

### Für AI-Vorschläge
✅ Gebe aussagekräftige Bereichsnamen
✅ Nutze AI sequenziell (erst Prompt, dann Kontext, dann Lösung)
✅ Editiere AI-Vorschläge nach Bedarf
✅ Speichere zwischen jedem Schritt

---

## ❓ Troubleshooting

### Problem: Install-Script schlägt fehl

**Lösung:**
```bash
# Prüfe Node.js Installation
node --version  # Sollte v18+ sein

# Prüfe npm
npm --version

# Manuelle Installation
cd /home/raphi/bGen/bgen-new
npm install canvas-confetti uuid
npm install --save-dev @types/canvas-confetti @types/uuid
```

### Problem: Onboarding-Seite nicht erreichbar

**Checkliste:**
- [ ] Frontend läuft? (`lsof -ti:5173`)
- [ ] Authentifiziert? (Login durchgeführt?)
- [ ] Korrekte URL? (`#/onboarding` mit Hash)
- [ ] Browser Cache geleert?

**Lösung:**
```bash
# Services neustarten
cd /home/raphi/bGen
./update-onboarding.sh
```

### Problem: AI-Vorschläge funktionieren nicht

**Mögliche Ursachen:**
- API-Key nicht konfiguriert
- Backend nicht erreichbar
- Provider/Model nicht verfügbar

**Lösung:**
```bash
# Prüfe Backend
curl http://localhost:3001/health

# Prüfe Settings
# In App → Settings → Provider/API Key prüfen
```

### Problem: Extension Login fehlschlägt

**Checkliste:**
- [ ] Backend läuft auf Port 3001?
- [ ] Credentials korrekt?
- [ ] CORS aktiviert im Backend?

**Lösung:**
```bash
# Backend neustarten
cd /home/raphi/bGen/bGen_test
npm run dev
```

---

## 📊 Verzeichnis-Struktur

```
/home/raphi/bGen/
├── install-onboarding.sh          # Installation Script
├── update-onboarding.sh            # Update Script
├── ONBOARDING_README.md            # Vollständige Dokumentation
├── QUICK_START.md                  # Diese Datei
│
├── bgen-new/                       # Frontend
│   ├── src/
│   │   ├── store/
│   │   │   └── onboardingStore.ts  # Onboarding State
│   │   ├── components/
│   │   │   └── onboarding/         # Onboarding Komponenten
│   │   │       ├── OnboardingWizard.tsx
│   │   │       └── steps/
│   │   │           ├── WelcomeStep.tsx
│   │   │           ├── DefineBasicsStep.tsx
│   │   │           ├── ConfigureStructureStep.tsx
│   │   │           ├── FinalizeStep.tsx
│   │   │           └── CompletedStep.tsx
│   │   ├── data/
│   │   │   └── demoAreas.ts        # 3 Demo-Bereiche
│   │   └── index.css               # Animations
│   └── package.json
│
├── bGen_test/                      # Backend
│   └── backend/
│       ├── routes/                 # API Routes
│       └── models/                 # MongoDB Models
│
└── browser-extension/              # Browser Extension
    ├── manifest.json
    ├── popup/
    │   ├── login.html              # Login UI
    │   ├── login.js                # Login Logic
    │   └── popup.js                # Settings (mit Auth-Check)
    └── scripts/
        ├── content.js              # AI Toolbar
        └── background.js           # API Calls
```

---

## 🎓 Weiterführende Ressourcen

### Dokumentation
- **Vollständig:** `/home/raphi/bGen/ONBOARDING_README.md`
- **Quick Start:** Diese Datei
- **Extension:** `/home/raphi/bGen/browser-extension/README.md`

### Demo & Test
- **Live Demo:** http://localhost:5173/#/demo
- **Onboarding:** http://localhost:5173/#/onboarding
- **Main App:** http://localhost:5173

### API
- **Backend:** http://localhost:3001
- **Health Check:** http://localhost:3001/health
- **API Docs:** Swagger UI (wenn konfiguriert)

---

## ✨ Nächste Schritte

Nach dem ersten Bereich:

1. **Erkunden:**
   - Generiere erste Texte im Wizard
   - Teste verschiedene AI-Modelle
   - Exportiere Ergebnisse

2. **Erweitern:**
   - Erstelle weitere Bereiche
   - Passe Strukturen an
   - Teile mit Team (Business Mode)

3. **Integrieren:**
   - Nutze Browser Extension
   - Automatisiere Workflows
   - Verknüpfe mit anderen Tools

---

## 💡 Tipps & Tricks

### Performance
- Nutze GPU-Acceleration im Browser
- Schließe unnötige Tabs
- Raspberry Pi: Nutze Lite-Modelle (GPT-4o-mini, Claude Haiku)

### Qualität
- Detaillierte Basis Prompts = bessere Ergebnisse
- Nutze Tags für Kontext-Verknüpfung
- Iteriere und verbessere Prompts

### Workflow
- Speichere häufig verwendete Strukturen als Bereiche
- Nutze Demo-Bereiche als Templates
- Exportiere und teile Best Practices

---

**Viel Erfolg mit aiGen! 🚀**

Bei Fragen: support@bgen.app
