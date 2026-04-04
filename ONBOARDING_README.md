# aiGen Onboarding System & Browser Extension

## Übersicht

Dieses Dokument beschreibt die neu entwickelten Features:

1. **Vollständiger Onboarding Wizard** für neue Benutzer
2. **Browser Extension** mit Login-Integration
3. **AI-assistierte Bereichserstellung**

---

## 1. Onboarding Wizard

### Funktionen

Der Onboarding Wizard führt neue Benutzer durch den Einstieg in aiGen:

#### **Welcome Screen**
- Auswahl zwischen 3 vorkonfigurierten Demo-Bereichen
- Custom-Option für individuellen Bereich (prominent platziert)
- Visuelle Karten mit Vorschau der Bereiche
- Icons und Beschreibungen für jeden Demo-Bereich

#### **Demo-Bereiche**
1. **PC/Arbeitsplatz - Hilfsmittel Ziff 13.01 HVI**
   - Fachbericht für Assistive Technologien am Arbeitsplatz
   - IV-Hilfsmittel Dokumentation

2. **HVI 15.05 - Umfeldkontrollgeräte**
   - Assistive Technologien für Umweltkontrolle
   - Selbstständige Fortbewegung

3. **KOMT - Hilfsmittel Ziff 15.02 HVI**
   - Kommunikationsgeräte für Personen mit Spracheinschränkungen

#### **Custom Setup Flow** (Step-by-Step)

**Schritt 1: Grundlagen definieren**
- Bereichsname eingeben
- Basis Prompt definieren (mit AI-Unterstützung)
- Ausgangslage beschreiben (mit AI-Vorschlag)
- Geplante Lösung formulieren (mit AI-Hilfe)
- AI-Unterstützung über "AI Vorschlag" Button

**Schritt 2: Struktur konfigurieren**
- Hauptabschnitte hinzufügen
- Unterabschnitte für jeden Hauptabschnitt
- Drag-and-Drop Sortierung
- Beschreibungen für jeden Abschnitt

**Schritt 3: Übersicht & Erstellen**
- Zusammenfassung aller Einstellungen
- Preview der kompletten Struktur
- Bereich mit einem Klick erstellen
- Automatische Weiterleitung zum Wizard

**Schritt 4: Erfolg**
- Konfetti-Animation (canvas-confetti)
- Erfolgsmeldung
- Feature-Preview
- Auto-Redirect zum generierten Bereich

### Technische Umsetzung

**Store: `/src/store/onboardingStore.ts`**
```typescript
- currentStep: OnboardingStep
- selectedDemo: DemoArea | null
- isCustomSetup: boolean
- tempAreaName, tempBasisPrompt, tempContextMain, tempPlannedSolution
- tempSections: Array<Section>
- isAIThinking: boolean
- aiSuggestion: string | null
```

**Components:**
- `/src/components/onboarding/OnboardingWizard.tsx` - Haupt-Container
- `/src/components/onboarding/steps/WelcomeStep.tsx` - Willkommensseite
- `/src/components/onboarding/steps/DefineBasicsStep.tsx` - Grundlagen
- `/src/components/onboarding/steps/ConfigureStructureStep.tsx` - Struktur
- `/src/components/onboarding/steps/FinalizeStep.tsx` - Übersicht
- `/src/components/onboarding/steps/CompletedStep.tsx` - Erfolgsseite

**Animationen: `/src/index.css`**
```css
- .animate-fade-in
- .animate-slide-up
- .animate-bounce-slow
- .animation-delay-100, -200, -300
```

**Integration: `/src/App.tsx`**
- Route: `#/onboarding` oder `/onboarding`
- Erreichbar nur für authentifizierte Benutzer
- Vollbild-Wizard ohne Header/Navigation

### Verwendung

**Zugriff:**
```
http://localhost:5173/#/onboarding
```

**Flow:**
1. Benutzer wählt Demo-Bereich → Sofort zu Schritt 3 (Finalize)
2. Benutzer wählt Custom → Durchlaufen aller Schritte mit AI-Unterstützung
3. Nach Erstellung → Auto-Redirect zu Wizard mit neuem Bereich

---

## 2. Browser Extension mit Login

### Funktionen

Die Browser Extension wurde mit dem aiGen Login-System integriert:

#### **Login-Seite** (`popup/login.html`)
- Username/E-Mail + Passwort Eingabe
- "Anmelden" Button
- "Ohne Login verwenden (API Key)" Option
- Link zur Registrierung
- Autumn Theme Design

#### **Authentifizierung** (`popup/login.js`)
- POST Request zu `http://localhost:3001/auth/login`
- Speichert JWT Token in `chrome.storage.sync`
- Speichert User-Daten
- Setzt Pro-Mode automatisch bei erfolgreicher Anmeldung

#### **Auth-Check** (`popup/popup.js`)
- Prüft beim Start ob Token vorhanden
- Redirect zu `login.html` wenn nicht authentifiziert
- URLParam `?skipLogin` ermöglicht API-Key Mode

### Dateien

**Neue Dateien:**
```
/home/raphi/bGen/browser-extension/
├── popup/
│   ├── login.html    # Login UI
│   └── login.js      # Login Logik
```

**Modifizierte Dateien:**
```
popup/popup.js        # Auth-Check hinzugefügt (Zeilen 5-14)
```

### API Integration

**Login Endpoint:**
```javascript
POST /auth/login
Body: { username, password }
Response: {
  token: string,
  user: { email, username, ... },
  ...
}
```

**Gespeicherte Daten:**
```javascript
chrome.storage.sync.set({
  auth: {
    token: string,
    user: object,
    loginTime: number
  },
  settings: {
    proMode: true,
    bgenUrl: 'http://localhost:3001',
    bgenToken: token,
    provider: 'bgen',
    model: ''
  }
})
```

### Verwendung

**Installation:**
1. Chrome öffnen → `chrome://extensions/`
2. Developer Mode aktivieren
3. "Load unpacked" → `/home/raphi/bGen/browser-extension/` auswählen

**Login:**
1. Extension-Icon klicken
2. Login mit aiGen Zugangsdaten
3. Oder "Ohne Login verwenden" für API-Key Mode

**Features nach Login:**
- Zugriff auf bGen Backend
- Pro-Mode Features aktiviert
- Sync mit aiGen Account

---

## 3. AI-Assistierte Bereichserstellung

### AI-Vorschlag Feature

Im Custom Setup Flow kann der Benutzer für jedes Feld AI-Vorschläge erhalten:

#### **Unterstützte Felder:**
1. **Basis Prompt**
   - Basierend auf Bereichsname
   - Generiert professionellen AI-Prompt

2. **Ausgangslage**
   - Basierend auf Name + Basis Prompt
   - Strukturierte Kontext-Beschreibung

3. **Geplante Lösung**
   - Basierend auf Name + Prompt + Kontext
   - Ziele und Lösungsansätze

#### **Technische Umsetzung**

**API Call:**
```javascript
POST /ai/quick-improve
Body: {
  text: '',
  action: 'custom',
  customPrompt: string,
  provider: settings.provider,
  model: settings.model,
  apiKey: settings.apiKey
}
```

**UI/UX:**
- "AI Vorschlag" Button neben jedem Feld
- Loading State: "AI denkt..."
- Vorschlag wird in Box angezeigt
- Auto-Fill nach 1 Sekunde
- Error Handling mit User Feedback

---

## 4. Demo-Daten

### Vorkonfigurierte Bereiche

**Quelle:** `/src/data/demoAreas.ts`

**Struktur:**
```typescript
export interface DemoArea {
  name: string;
  description: string;
  content: {
    basisPrompt: string;
    contextMain: string;
    plannedSolution: string;
    contextMainTags: string[];
    plannedSolutionTags: string[];
    sections: Array<{
      title: string;
      description: string;
      tags: string[];
      subsections: Array<{...}>
    }>
  }
}
```

**Nutzung:**
- Import in WelcomeStep
- Anzeige als Karten mit Preview
- Ein-Klick Template-Verwendung
- Vollständige Bereiche mit Struktur

---

## 5. Autumn Theme & Design

### Farbpalette

Konsistentes Autumn Theme in allen neuen Komponenten:

```css
--autumn-rust: #A85B3A        /* Hauptfarbe, Buttons */
--autumn-terracotta: #C27B5E  /* Hover States */
--autumn-wheat: #E8C391       /* Backgrounds */
--autumn-sand: #D4915E        /* Accents */
--autumn-cream: #F5E6D3       /* Light Backgrounds */
--autumn-smoke: #E5E5E5       /* Borders */
--autumn-ash: #8A8A8A         /* Text Secondary */
--autumn-charcoal: #2D2D2D    /* Text Primary */
```

### Design Elemente

- Gradient Backgrounds
- Rounded Cards (rounded-xl, rounded-2xl)
- Shadow Levels (shadow-lg, shadow-xl, shadow-2xl)
- Hover Animations (scale-105, translate-x)
- Smooth Transitions (duration-300, duration-500)

---

## 6. Installation & Setup

### Dependencies

**Neue Packages:**
```bash
npm install canvas-confetti uuid
npm install --save-dev @types/canvas-confetti @types/uuid
```

### Dateien Übersicht

**Neue Dateien:**
```
/src/store/onboardingStore.ts
/src/components/onboarding/OnboardingWizard.tsx
/src/components/onboarding/steps/WelcomeStep.tsx
/src/components/onboarding/steps/DefineBasicsStep.tsx
/src/components/onboarding/steps/ConfigureStructureStep.tsx
/src/components/onboarding/steps/FinalizeStep.tsx
/src/components/onboarding/steps/CompletedStep.tsx
/browser-extension/popup/login.html
/browser-extension/popup/login.js
```

**Modifizierte Dateien:**
```
/src/App.tsx                    # Onboarding Route hinzugefügt
/src/index.css                  # Animationen hinzugefügt
/browser-extension/popup/popup.js  # Auth-Check hinzugefügt
```

---

## 7. Testing

### Onboarding Wizard

**Test Demo-Auswahl:**
```
1. Navigiere zu http://localhost:5173/#/onboarding
2. Wähle einen der 3 Demo-Bereiche
3. Prüfe Preview-Daten
4. Klicke "Template verwenden"
5. Verifiziere Finalize-Screen
6. Klicke "Bereich erstellen"
7. Erwarte Konfetti + Auto-Redirect
```

**Test Custom Setup:**
```
1. Navigiere zu http://localhost:5173/#/onboarding
2. Klicke "Eigenen Bereich erstellen"
3. Gebe Bereichsname ein
4. Teste "AI Vorschlag" für alle Felder
5. Navigiere zu Schritt 2
6. Füge Sections/Subsections hinzu
7. Teste Drag-and-Drop
8. Navigiere zu Schritt 3
9. Prüfe Preview
10. Erstelle Bereich
11. Verifiziere Success-Animation
```

### Browser Extension

**Test Login:**
```
1. Öffne Extension
2. Login mit gültigen Credentials
3. Prüfe chrome.storage.sync für Token
4. Verifiziere Redirect zu popup.html
5. Prüfe Pro-Mode Aktivierung
```

**Test Auth-Check:**
```
1. Lösche chrome.storage.sync
2. Öffne Extension
3. Erwarte Redirect zu login.html
4. Teste "Ohne Login verwenden"
5. Erwarte Redirect zu popup.html?skipLogin
```

---

## 8. Nächste Schritte (Optional)

### Verbesserungen

1. **First-Time User Detection**
   - Auto-Redirect zu Onboarding bei erstem Login
   - "Noch keine Bereiche" → Onboarding Link

2. **Onboarding Progress Persistence**
   - Zwischenspeichern im LocalStorage
   - "Später fortfahren" Option

3. **Template Gallery**
   - Mehr Demo-Bereiche
   - Community Templates
   - Template-Kategorien

4. **Extension Features**
   - Task-Output Sync (Pro-Feature)
   - Browser-Integration verbessern
   - Offline-Mode

---

## 9. Zusammenfassung

### Was wurde entwickelt:

✅ **Onboarding Wizard**
- 5 Steps (Welcome → Basics → Structure → Finalize → Success)
- 3 Demo-Bereiche vorkonfiguriert
- AI-assistierte Custom-Erstellung
- Konfetti-Animation bei Erfolg

✅ **Browser Extension Login**
- Login-Seite mit Autumn Theme
- JWT-Integration mit aiGen Backend
- Auth-Check in popup.js
- Pro-Mode Auto-Aktivierung

✅ **AI-Unterstützung**
- AI-Vorschläge für alle Felder
- Real-time AI-Thinking State
- Auto-Fill nach Generierung
- Error Handling

✅ **Design & UX**
- Konsistentes Autumn Theme
- Smooth Animations
- Responsive Design
- Accessibility

### Zugriff:

**Onboarding:**
```
http://localhost:5173/#/onboarding
```

**Extension:**
```
chrome://extensions/ → Load unpacked → /home/raphi/bGen/browser-extension/
```

---

## Support

Bei Fragen oder Problemen:
- GitHub Issues: (Repository URL)
- Email: support@bgen.app
- Discord: https://discord.gg/bgen

---

**Made with ❤️ by the aiGen Team**
