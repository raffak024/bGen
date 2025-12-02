# Bugfix: Customer Store Authentication Error

## Problem
Beim Öffnen der Kunden-Seite und beim Erstellen von Kunden trat folgender Fehler auf:
```
Error: Not authenticated
    at loadCustomers (customerStore.ts:66:19)
    at Customers.tsx:43:5
```

## Ursache
Der `customerStore` versuchte den Authentifizierungs-Token direkt aus `localStorage` zu lesen:
```typescript
const token = localStorage.getItem('token');
```

**Problem:** Das `authStore` verwendet Zustand's `persist` Middleware, die den Token unter einem anderen Key speichert (wahrscheinlich `auth-storage`). Direkter Zugriff auf `localStorage.getItem('token')` gibt daher `null` zurück.

## Lösung
Verwendung von `useAuthStore.getState().token` statt direktem localStorage-Zugriff, wie es auch im `settingsStore` korrekt gemacht wurde.

### Geänderte Datei: `customerStore.ts`

**Vorher:**
```typescript
const token = localStorage.getItem('token');
if (!token) {
  throw new Error('Not authenticated');
}
```

**Nachher:**
```typescript
import { useAuthStore } from './authStore';

const token = useAuthStore.getState().token;
if (!token) {
  throw new Error('Not authenticated');
}
```

### Alle betroffenen Methoden aktualisiert:
1. ✅ `loadCustomers()` - Zeile 65
2. ✅ `createCustomer()` - Zeile 91
3. ✅ `updateCustomer()` - Zeile 122
4. ✅ `deleteCustomer()` - Zeile 154

## Warum funktionierte settingsStore?
Der `settingsStore` verwendete bereits die korrekte Methode:
```typescript
const token = useAuthStore.getState().token;
```

Der `customerStore` wurde nach dem gleichen Pattern erstellt, hatte aber versehentlich noch den localStorage-Zugriff.

## Testing

### Szenario 1: Kunden-Seite öffnen
**Vorher:**
- ❌ Error: "Not authenticated"
- ❌ Kunden werden nicht geladen

**Nachher:**
- ✅ Kunden werden korrekt geladen
- ✅ Keine Errors

### Szenario 2: Kunde erstellen
**Vorher:**
- ❌ Error: "Not authenticated"
- ❌ Kunde wird nicht erstellt

**Nachher:**
- ✅ Kunde wird erfolgreich erstellt
- ✅ API-Call mit korrektem Token

### Szenario 3: Kunde bearbeiten/löschen
**Vorher:**
- ❌ Error: "Not authenticated"

**Nachher:**
- ✅ Funktioniert korrekt

## Weitere Verbesserung
Falls in Zukunft weitere Stores erstellt werden, sollte immer folgendes Pattern verwendet werden:

```typescript
// ✅ RICHTIG - Token vom authStore holen
import { useAuthStore } from './authStore';

const token = useAuthStore.getState().token;

// ❌ FALSCH - Direkter localStorage Zugriff
const token = localStorage.getItem('token');
```

## Build Status
✅ Build erfolgreich: 495.37 kB
✅ Keine Fehler
✅ TypeScript kompiliert

## Status
**BEHOBEN** ✅

Kunden-Management funktioniert jetzt vollständig:
- Laden von Kunden
- Erstellen von Kunden
- Bearbeiten von Kunden
- Löschen von Kunden
