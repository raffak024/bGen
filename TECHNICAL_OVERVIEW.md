# aiGen - Technische Funktionsübersicht

## 🏗️ Architektur
- **Frontend**: React 18 + TypeScript + Vite + Zustand (State) + Tailwind CSS 4 auf Port 5173
- **Backend**: Node.js + Express 4 + MongoDB/Mongoose + JWT-Auth auf Port 3000
- **AI-Integration**: OpenAI GPT + Anthropic Claude APIs über Backend-Proxy mit User-spezifischen API-Keys

## 🔐 Authentifizierung & Multi-Tenancy
- **JWT-Token**: Backend generiert signierte Tokens bei Login, Frontend sendet via Authorization-Header
- **Business/Private Modi**: User hat activeOrganization (Business) oder null (Private), filtert Areas/Customers/Projects
- **Rollen**: Standard-User (Areas editieren) oder Admin (Organisation + User verwalten)

## 📂 Datenmodelle
- **Area**: Workspace mit content (basisPrompt, contextMain, plannedSolution, sections[], tags[], calculations)
- **Section/Subsection**: Hierarchische Gliederung mit id, title, description, tags, calculation (items[], total)
- **Report**: Generierter Bericht mit wizardSnapshot (kompletter Wizard-State), generatedTexts[] (Text + exakter Prompt + versions[])
- **Setting**: User-spezifisch (provider: 'openai'|'claude', apiKey, model, temperature, maxTokens, textSize)

## 🧙 Wizard-Workflow (5 Steps)
1. **SelectArea**: Bereich wählen/erstellen, auto-select nach lastAccessedAt DESC
2. **DefineContext**: contextMain + plannedSolution + tags + calculations (optional)
3. **ConfigureSections**: Drag-and-Drop Sections/Subsections mit ID-Preservation
4. **SimplifiedSections**: Wizard-im-Wizard für jedes Element (description, tags, calculation, settings per Element)
5. **GenerateResults**: Parallel-Generierung (3 concurrent), FocusedSectionEditor mit Slider-Navigation

## 🎯 Prompt-Generierung
- **optimizedPromptGenerator.ts**: Kombiniert basisPrompt + context + plannedSolution + elementDescription + textSize → kompakter Prompt
- **buildCompactPrompt()**: Template mit Platzhaltern, entfernt leere Zeilen, max tokens beachten
- **Element-spezifisch**: Jedes Section/Subsection bekommt eigenen Prompt mit sectionTitle, subsectionTitle, tags, calculation

## 💾 Prompt-Speicherung (V3)
- **wizardSnapshot**: Speichert gesamten Wizard-State (sections[], tags[], calculations) im Report
- **generatedTexts[]**: Array mit elementId, prompt (exakt), text, calculation, versions[] (timestamp, prompt, text)
- **Regenerierung**: POST /report/:id/regenerate mit elementId + neuem Prompt → alte Version in history, neue wird gespeichert

## 🧮 Calculation-System (V3)
- **Calculation-Objekt**: {enabled, label, items: [{id, description, quantity, unitPrice, hours, total}], total, showHours, currency}
- **Integration**: contextMain, plannedSolution, Section, Subsection haben jeweils optionale calculation
- **Backend**: Calculation-Schema in Area.js (contextMainCalculation, plannedSolutionCalculation) + Section/Subsection
- **Frontend**: CalculationFieldAutumn-Component mit Add/Remove Items, auto-calculate total

## 🏷️ Tag-System
- **TagGroupInput**: Dropdown mit Standard-Tags + Custom-Tags, Click → Tag in Textarea einfügen
- **EnhancedTagInput**: KI-gestützt mit Kategorien (favorit, wichtig, technisch), Inline-Manager
- **Backend**: TagCollection-Model (userId, standardTags[], customTags[])

## 🔄 State Management (Zustand)
- **areaStore**: currentArea, areas[], CRUD-Funktionen (loadAreas, createArea, updateSection, updateSubsection)
- **authStore**: user, token, isAuthenticated, login(), logout(), activeOrganization
- **settingsStore**: settings (provider, apiKey, model), updateSettings()
- **wizardStore**: currentStep, nextStep(), prevStep(), setStep()

## 📡 API-Endpoints
- **Auth**: POST /auth/login (email, password → {token, user}), POST /auth/register
- **Areas**: GET /areas (filter by organizationId), POST /areas, GET /areas/:id, PUT /areas/:areaId/content, PATCH /areas/:id/access (lastAccessedAt)
- **Reports**: POST /areas/:areaId/report (legacy), POST /report/save-wizard (V3: wizardSnapshot), POST /report/:id/regenerate, GET /report/:id
- **Generation**: POST /report/generate-single (prompt → KI-Text via apiClient.js)

## 🎨 UI-Komponenten
- **AutumnComponents**: Inline Design-System (AutumnButton, AutumnInput, AutumnBadge) mit CSS-Variablen (--autumn-rust, --autumn-wheat, --autumn-charcoal)
- **DynamicTextarea**: Auto-resize mit minRows/maxRows, Smart-Zoom-Mode bei Fokus
- **CalculationFieldAutumn**: Collapsible Kalkulations-Tabelle mit Add/Remove Rows
- **FocusedSectionEditor**: Fullscreen-Editor mit horizontalem Slider für Navigation zwischen Sections

## 🗂️ 3-Spalten Layout (V3)
- **Column 1**: Main Sidebar (60px collapsed, 240px expanded) - Navigation (Aktuell, Berichte, Kunden/Projekte, Demo, Einstellungen)
- **Column 2**: AreaSidebar (240px) - Area-Switcher, Create Area, Navigation zu Gliederung/Basis-Prompt, Area-Stats
- **Column 3**: Content Area - Wizard/Berichte/Settings je nach aktiver View
- **Responsive**: Grid passt sich an (mit/ohne currentArea, sidebar expanded/collapsed)

## 🔍 Auto-Select (V3)
- **Trigger**: Nach Login, wenn currentArea === null
- **Logik**: Sortiert areas[] nach lastAccessedAt DESC, lädt area[0], updated lastAccessedAt via PATCH /areas/:id/access
- **Fallback**: Wenn keine Areas → User erstellt erste Area manuell

## 💼 Business vs Private
- **Business**: activeOrganization !== null → zeigt "Kunden"-Tab, filtert Areas/Customers/Reports nach organizationId
- **Private**: activeOrganization === null → zeigt "Projekte"-Tab, filtert nur nach userId
- **Trennung**: Conditional Rendering in AppAutumn.tsx, separate API-Queries mit organizationId-Filter

## 🎭 Demo-Modus
- **InteractiveDemoShowcase**: 5 Tabs (Showcase, Wizard, Tags, Prompts, Generation) mit professionalDemoAreas[] (Anwalt, Architekt, Psychologe)
- **Persistenz (V3)**: localStorage speichert {mode, expandedArea, currentWizardStep, selectedTags, selectedGenMode, showGeneratedTexts}
- **4 Generation-Modi**: Creative (80% Fantasie), Standard (50% Balanced), Fachlich (70% Präzise), Exakt (95% User-Input)

## 🔐 Sicherheit
- **JWT-Verify**: authMiddleware prüft Token bei jedem Request, injiziert req.user.id
- **API-Key-Protection**: User-API-Keys verschlüsselt in Setting-Model, Backend macht Requests an OpenAI/Claude
- **CORS**: Konfiguriert in backend/server.js für Frontend-Origin
- **Mongoose-Schemas**: Validierung (required fields, enums für provider/status)

## 🚀 Deployment-Flow
1. **MongoDB**: Muss laufen (systemctl start mongod), Connection über DB_URI in .env
2. **Backend**: `npm run dev` in aiGen_test (nodemon backend/server.js auf Port 3000)
3. **Frontend**: `npm run dev` in aigen-new (Vite auf Port 5173, Proxy zu VITE_API_URL)
4. **Build**: Frontend `npm run build` → dist/, Backend `npm run build` (optional)

## 📊 Datenfluss Text-Generierung
1. Frontend: Wizard → optimizedPrompts[] generieren → parallel API-Calls (concurrency 3)
2. Backend: POST /report/generate-single → apiClient.js (provider check) → OpenAI/Claude API
3. Backend: Response → content extrahieren → frontend
4. Frontend: generatedSections[] State → FocusedSectionEditor
5. Save: POST /report/save-wizard → Report mit wizardSnapshot + generatedTexts[] (prompt + text)

## 🔧 Wichtige Files
- **Frontend**: src/App.tsx (Router), src/AppAutumn.tsx (3-Spalten), src/store/*.ts (Zustand), src/utils/promptGenerator.ts
- **Backend**: backend/server.js (Express), backend/models/*.js (Mongoose), backend/routes/*.js (REST), backend/utils/apiClient.js (AI)
- **Config**: aigen-new/.env (VITE_API_URL), aiGen_test/.env (DB_URI, SECRET_KEY)

## 🎯 V3_Alpha Features
- **Calculation-Integration**: Alle Steps (Context, Sections, Subsections) haben optionale Calculations
- **Wizard-Snapshot**: Kompletter State wird mit Prompts + Versionen gespeichert für Regenerierung
- **Auto-Select**: lastAccessedAt-basiert, Area wird automatisch nach Login geladen
- **Demo-Persistenz**: localStorage erhält Demo-State für Standard-User
- **Modal-Verhalten**: GenerateResults-Modal bleibt nach Save offen
- **Sticky Navigation**: Wizard-Navigation schmaler, zusätzlicher Weiter-Button oben rechts
- **Business/Private-Trennung**: Kunden (Business) vs Projekte (Private)
