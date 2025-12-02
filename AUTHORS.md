# CLAUDE.md

This file provides guidance to binomOne.aiGen (claude.ai/code) when working with code in this repository.

## Project Overview

aiGen is a KI-gestützter Textgenerator (AI-powered text generator) that creates customized text sections based on user-defined structure and context. Originally designed for Swiss disability insurance reports, it's now a general-purpose text generation tool.

**Two versions exist:**
- `aiGen_test/` - Original vanilla JS frontend with Express backend
- `aigen-new/` - Modern React + TypeScript frontend with wizard-based workflow (NEW)

## Quick Start

### New React Frontend (aigen-new)
```bash
cd aigen-new
npm install
npm run dev          # http://localhost:5173
```

### Backend (aiGen_test)
```bash
cd aiGen_test
npm install
npm run dev          # http://localhost:3000
```

### Environment Variables

**Frontend** (`aigen-new/.env`):
```
VITE_API_URL=http://localhost:3000
```

**Backend** (`aiGen_test/.env`):
```
DB_URI=mongodb://localhost:27017/aigen
SECRET_KEY=your-secret-key
```

## Architecture

### New Frontend (aigen-new) - React + TypeScript
- **Tech Stack**: React 18, TypeScript, Vite, Tailwind CSS 4, Zustand
- **Entry**: `src/App.tsx`
- **Build**: `npm run build` (outputs to `dist/`)

**Key directories:**
- `src/components/wizard/` - Wizard steps (SelectArea, DefineContext, ConfigureSections, ReviewPrompts, GenerateResults)
- `src/store/` - Zustand stores (authStore, areaStore, settingsStore, wizardStore)
- `src/utils/promptGenerator.ts` - Core prompt generation logic
- `src/types/index.ts` - TypeScript type definitions

**Wizard Flow:**
1. Select/create area
2. Define basis prompt, context, planned solution
3. Configure sections with subsections (drag-and-drop)
4. Review and customize generated prompts
5. Generate text and export

### Backend (aiGen_test) - Node.js/Express
- **Tech Stack**: Express 4, MongoDB/Mongoose, JWT auth, OpenAI + Claude APIs
- **Entry**: `backend/server.js`
- **Build**: `npm run build` (outputs to `dist/`)

**Key directories:**
- `backend/models/` - Mongoose schemas (User, Area, Setting, Report)
- `backend/routes/` - REST endpoints (auth, areas, report, settings)
- `backend/utils/apiClient.js` - OpenAI + Claude API integration

### API Endpoints

```
POST /auth/login              # Returns JWT token
POST /auth/register           # Creates user with default settings
GET  /auth/profile            # Current user info

GET  /areas                   # List user's areas
POST /areas                   # Create area
GET  /areas/:id               # Get area with content
PUT  /areas/:areaId/content   # Update sections, prompts, tags
DELETE /areas/:areaId         # Delete area

POST /report                  # Generate text sections via AI

GET  /settings                # User settings
POST /settings                # Update settings
```

### Data Models

**Area:**
```typescript
{
  _id: string;
  name: string;
  userId: string;
  content: {
    basisPrompt: string;      // Base instructions for AI
    contextMain: string;       // Background context
    plannedSolution: string;   // Goal/solution description
    sections: [{
      id: string;
      title: string;
      description: string;
      subsections: [{ id, title, description }]
    }]
  }
}
```

**Setting:**
```typescript
{
  userId: string;
  provider: 'openai' | 'claude';  // NEW: AI provider selection
  apiKey: string;
  model: string;
  maxTokens: number;
  temperature: number;
  textSize: 'Kurz' | 'Mittel' | 'Lang';
}
```

## Core Logic: Prompt Generation

The key innovation is in `src/utils/promptGenerator.ts` (React) / `frontend/js/promptHandling.js` (vanilla):

Each text element gets a unique prompt combining:
1. **Basis Prompt** - Overall style/instructions
2. **Context** - Background information
3. **Planned Solution** - Goal description
4. **Element-specific description** - What this section should contain
5. **Text size instruction** - Kurz (5 sentences), Mittel (10), Lang (15)

```typescript
// Simplified prompt structure
`${basisPrompt}

Hier der Kontext: "${context}"
Hier die geplante Lösung: "${plannedSolution}"

Der Inhalt soll sich auf "${sectionTitle}" als (${sectionType}) beziehen.

Erstelle einen Text anhand:
${elementDescription}

WICHTIG: ${textSizeInstruction}`
```

## AI Provider Support

Backend supports both OpenAI and Claude APIs:

```javascript
// backend/utils/apiClient.js
if (provider === 'claude') {
  // Uses @anthropic-ai/sdk
  return await anthropic.messages.create({...});
} else {
  // Uses openai
  return await openai.chat.completions.create({...});
}
```

## Build Commands

### aigen-new (React)
```bash
npm run dev        # Development server (Vite)
npm run build      # Production build
npm run preview    # Preview production build
npm run lint       # ESLint
```

### aiGen_test (Backend)
```bash
npm run dev        # Nodemon backend
npm run build      # Full production build
npm start          # Run production
```

## Code Conventions

- **Frontend (React)**: TypeScript with `import type` for type-only imports
- **Backend**: CommonJS modules
- **Language**: German UI, English code
- **State**: Zustand stores (not Redux)
- **Styling**: Tailwind CSS 4 utility classes
- **Components**: Functional components with hooks

## Testing

No test framework configured yet. Opportunity for adding:
- Jest + React Testing Library for frontend
- Jest for backend unit tests
- Cypress for E2E tests
