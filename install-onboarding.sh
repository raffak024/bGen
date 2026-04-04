#!/bin/bash

# ========================================
# aiGen Onboarding System Installer
# ========================================

set -e

echo "========================================="
echo "  aiGen Onboarding System Installation"
echo "========================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Paths
BGEN_ROOT="/home/raphi/bGen"
FRONTEND_DIR="$BGEN_ROOT/bgen-new"
BACKEND_DIR="$BGEN_ROOT/bGen_test"
EXTENSION_DIR="$BGEN_ROOT/browser-extension"

echo -e "${BLUE}Schritt 1/5: Prüfe Verzeichnisse...${NC}"
if [ ! -d "$FRONTEND_DIR" ]; then
  echo -e "${YELLOW}Fehler: Frontend Verzeichnis nicht gefunden: $FRONTEND_DIR${NC}"
  exit 1
fi

if [ ! -d "$BACKEND_DIR" ]; then
  echo -e "${YELLOW}Fehler: Backend Verzeichnis nicht gefunden: $BACKEND_DIR${NC}"
  exit 1
fi

echo -e "${GREEN}✓ Verzeichnisse gefunden${NC}"
echo ""

echo -e "${BLUE}Schritt 2/5: Installiere Frontend Dependencies...${NC}"
cd "$FRONTEND_DIR"
npm install canvas-confetti uuid --silent
npm install --save-dev @types/canvas-confetti @types/uuid --silent
echo -e "${GREEN}✓ Frontend Dependencies installiert${NC}"
echo ""

echo -e "${BLUE}Schritt 3/5: Prüfe Onboarding Komponenten...${NC}"
COMPONENTS=(
  "src/store/onboardingStore.ts"
  "src/components/onboarding/OnboardingWizard.tsx"
  "src/components/onboarding/steps/WelcomeStep.tsx"
  "src/components/onboarding/steps/DefineBasicsStep.tsx"
  "src/components/onboarding/steps/ConfigureStructureStep.tsx"
  "src/components/onboarding/steps/FinalizeStep.tsx"
  "src/components/onboarding/steps/CompletedStep.tsx"
)

MISSING=0
for component in "${COMPONENTS[@]}"; do
  if [ ! -f "$FRONTEND_DIR/$component" ]; then
    echo -e "${YELLOW}⚠ Fehlt: $component${NC}"
    MISSING=$((MISSING + 1))
  fi
done

if [ $MISSING -eq 0 ]; then
  echo -e "${GREEN}✓ Alle Onboarding Komponenten vorhanden (${#COMPONENTS[@]} Dateien)${NC}"
else
  echo -e "${YELLOW}⚠ $MISSING von ${#COMPONENTS[@]} Komponenten fehlen${NC}"
  echo "Bitte stelle sicher, dass alle Komponenten korrekt erstellt wurden."
fi
echo ""

echo -e "${BLUE}Schritt 4/5: Prüfe Browser Extension...${NC}"
if [ -d "$EXTENSION_DIR" ]; then
  if [ -f "$EXTENSION_DIR/popup/login.html" ] && [ -f "$EXTENSION_DIR/popup/login.js" ]; then
    echo -e "${GREEN}✓ Browser Extension Login-Integration vorhanden${NC}"
  else
    echo -e "${YELLOW}⚠ Browser Extension Login-Dateien fehlen${NC}"
  fi
else
  echo -e "${YELLOW}⚠ Browser Extension Verzeichnis nicht gefunden${NC}"
fi
echo ""

echo -e "${BLUE}Schritt 5/5: Prüfe Backend...${NC}"
cd "$BACKEND_DIR"
if lsof -ti:3001 > /dev/null 2>&1; then
  echo -e "${GREEN}✓ Backend läuft bereits auf Port 3001${NC}"
else
  echo -e "${YELLOW}⚠ Backend läuft nicht. Starte Backend...${NC}"
  npm run dev > /tmp/backend_onboarding.log 2>&1 &
  sleep 3
  if lsof -ti:3001 > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Backend gestartet auf Port 3001${NC}"
  else
    echo -e "${YELLOW}⚠ Backend konnte nicht gestartet werden${NC}"
    echo "Prüfe /tmp/backend_onboarding.log für Details"
  fi
fi
echo ""

echo "========================================="
echo -e "${GREEN}Installation abgeschlossen!${NC}"
echo "========================================="
echo ""
echo "Nächste Schritte:"
echo ""
echo "1. Frontend starten:"
echo "   cd $FRONTEND_DIR"
echo "   npm run dev"
echo ""
echo "2. Onboarding aufrufen:"
echo "   http://localhost:5173/#/onboarding"
echo ""
echo "3. Browser Extension installieren:"
echo "   - Chrome: chrome://extensions/"
echo "   - Developer Mode aktivieren"
echo "   - 'Load unpacked' → $EXTENSION_DIR"
echo ""
echo "Dokumentation:"
echo "   $BGEN_ROOT/ONBOARDING_README.md"
echo ""
echo -e "${GREEN}Viel Erfolg! 🎉${NC}"
