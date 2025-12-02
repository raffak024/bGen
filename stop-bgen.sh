#!/bin/bash

# ========================================
# bGen Stop Script
# ========================================
# Beendet Backend + Frontend für bGen
# Author: Claude Code
# Date: 2025-11-21
# ========================================

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}Beende bGen...${NC}"

# Backend (Port 3001)
if lsof -ti:3001 >/dev/null 2>&1; then
    echo -e "${YELLOW}→${NC} Beende Backend (Port 3001)..."
    lsof -ti:3001 | xargs kill -9 2>/dev/null
    echo -e "${GREEN}✓${NC} Backend gestoppt"
else
    echo -e "${YELLOW}⚠${NC} Backend läuft nicht"
fi

# Frontend (Port 5173)
if lsof -ti:5173 >/dev/null 2>&1; then
    echo -e "${YELLOW}→${NC} Beende Frontend (Port 5173)..."
    lsof -ti:5173 | xargs kill -9 2>/dev/null
    echo -e "${GREEN}✓${NC} Frontend gestoppt"
else
    echo -e "${YELLOW}⚠${NC} Frontend läuft nicht"
fi

# Nodemon Prozesse
pkill -f "nodemon.*server.js" 2>/dev/null && echo -e "${GREEN}✓${NC} Nodemon gestoppt"

# Vite Prozesse
pkill -f "vite.*bgen-new" 2>/dev/null && echo -e "${GREEN}✓${NC} Vite gestoppt"

echo -e "${GREEN}✓${NC} bGen vollständig gestoppt"
