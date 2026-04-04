#!/bin/bash

# ========================================
# aiGen Onboarding System Updater
# ========================================

set -e

echo "========================================="
echo "  aiGen Onboarding System Update"
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

echo -e "${BLUE}Schritt 1/4: Stoppe laufende Prozesse...${NC}"
# Frontend stoppen
if lsof -ti:5173 > /dev/null 2>&1; then
  echo "Stoppe Frontend (Port 5173)..."
  lsof -ti:5173 | xargs kill -9 2>/dev/null || true
  sleep 1
fi

# Backend stoppen
if lsof -ti:3001 > /dev/null 2>&1; then
  echo "Stoppe Backend (Port 3001)..."
  lsof -ti:3001 | xargs kill -9 2>/dev/null || true
  sleep 1
fi

echo -e "${GREEN}✓ Prozesse gestoppt${NC}"
echo ""

echo -e "${BLUE}Schritt 2/4: Update Frontend Dependencies...${NC}"
cd "$FRONTEND_DIR"
npm install --silent
echo -e "${GREEN}✓ Frontend Dependencies aktualisiert${NC}"
echo ""

echo -e "${BLUE}Schritt 3/4: Update Backend Dependencies...${NC}"
cd "$BACKEND_DIR"
npm install --silent
echo -e "${GREEN}✓ Backend Dependencies aktualisiert${NC}"
echo ""

echo -e "${BLUE}Schritt 4/4: Starte Services neu...${NC}"

# Backend starten
cd "$BACKEND_DIR"
npm run dev > /tmp/backend_updated.log 2>&1 &
sleep 3

if lsof -ti:3001 > /dev/null 2>&1; then
  echo -e "${GREEN}✓ Backend gestartet (Port 3001)${NC}"
else
  echo -e "${YELLOW}⚠ Backend konnte nicht gestartet werden${NC}"
  echo "Prüfe /tmp/backend_updated.log für Details"
fi

# Frontend starten
cd "$FRONTEND_DIR"
npm run dev > /tmp/frontend_updated.log 2>&1 &
sleep 5

if lsof -ti:5173 > /dev/null 2>&1; then
  echo -e "${GREEN}✓ Frontend gestartet (Port 5173)${NC}"
else
  echo -e "${YELLOW}⚠ Frontend konnte nicht gestartet werden${NC}"
  echo "Prüfe /tmp/frontend_updated.log für Details"
fi

echo ""
echo "========================================="
echo -e "${GREEN}Update abgeschlossen!${NC}"
echo "========================================="
echo ""
echo "Services:"
echo "  Frontend: http://localhost:5173"
echo "  Backend:  http://localhost:3001"
echo "  Onboarding: http://localhost:5173/#/onboarding"
echo ""
echo "Logs:"
echo "  Frontend: /tmp/frontend_updated.log"
echo "  Backend:  /tmp/backend_updated.log"
echo ""
echo -e "${GREEN}Services laufen! 🚀${NC}"
