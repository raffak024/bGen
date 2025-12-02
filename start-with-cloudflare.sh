#!/bin/bash

# ========================================
# bGen Start Script mit Cloudflare Tunnel
# ========================================
# Startet Backend + Frontend + Cloudflare Tunnel
# Author: Claude Code
# Date: 2025-11-21
# ========================================

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}"
echo "╔════════════════════════════════════════╗"
echo "║    bGen + Cloudflare Tunnel Start      ║"
echo "╚════════════════════════════════════════╝"
echo -e "${NC}"

# Prüfe ob cloudflared installiert ist
if ! command -v cloudflared >/dev/null 2>&1; then
    echo -e "${RED}✗${NC} cloudflared ist nicht installiert!"
    echo -e "${YELLOW}→${NC} Installiere mit:"
    echo "    wget -q https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb"
    echo "    sudo dpkg -i cloudflared-linux-amd64.deb"
    exit 1
fi

echo -e "${BLUE}[1/3]${NC} Starte bGen lokal..."
/home/raphi/bGen/start-bgen.sh &
BGEN_PID=$!

# Warte bis Services laufen
echo -n "   Warte auf Services"
for i in {1..20}; do
    if lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null 2>&1 && \
       lsof -Pi :5173 -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo -e " ${GREEN}✓${NC}"
        break
    fi
    echo -n "."
    sleep 1
done

echo -e "${BLUE}[2/3]${NC} Starte Cloudflare Tunnel für Backend..."
cloudflared tunnel --url http://localhost:3001 > /home/raphi/bGen/logs/cloudflare-backend.log 2>&1 &
BACKEND_TUNNEL_PID=$!
sleep 3

# Extrahiere Backend Tunnel URL
BACKEND_URL=$(grep -oP 'https://[a-z0-9-]+\.trycloudflare\.com' /home/raphi/bGen/logs/cloudflare-backend.log | head -1)

if [ -z "$BACKEND_URL" ]; then
    echo -e "${RED}✗${NC} Backend Tunnel konnte nicht gestartet werden"
    kill $BGEN_PID $BACKEND_TUNNEL_PID 2>/dev/null
    exit 1
fi

echo -e "${GREEN}✓${NC} Backend Tunnel: $BACKEND_URL"

echo -e "${BLUE}[3/3]${NC} Starte Cloudflare Tunnel für Frontend..."
cloudflared tunnel --url http://localhost:5173 > /home/raphi/bGen/logs/cloudflare-frontend.log 2>&1 &
FRONTEND_TUNNEL_PID=$!
sleep 3

# Extrahiere Frontend Tunnel URL
FRONTEND_URL=$(grep -oP 'https://[a-z0-9-]+\.trycloudflare\.com' /home/raphi/bGen/logs/cloudflare-frontend.log | head -1)

if [ -z "$FRONTEND_URL" ]; then
    echo -e "${RED}✗${NC} Frontend Tunnel konnte nicht gestartet werden"
    kill $BGEN_PID $BACKEND_TUNNEL_PID $FRONTEND_TUNNEL_PID 2>/dev/null
    exit 1
fi

echo -e "${GREEN}✓${NC} Frontend Tunnel: $FRONTEND_URL"

# Update Frontend .env mit Backend Tunnel URL
echo "VITE_API_URL=$BACKEND_URL" > /home/raphi/bGen/bgen-new/.env
echo -e "${GREEN}✓${NC} Frontend .env aktualisiert mit $BACKEND_URL"

# Restart Frontend um .env zu laden
echo -e "${YELLOW}⚠${NC} Starte Frontend neu um neue API URL zu laden..."
lsof -ti:5173 | xargs kill -9 2>/dev/null
sleep 2
cd /home/raphi/bGen/bgen-new && nohup npm run dev > /home/raphi/bGen/logs/frontend.log 2>&1 &
sleep 5

echo
echo -e "${MAGENTA}╔════════════════════════════════════════╗${NC}"
echo -e "${MAGENTA}║     bGen läuft mit Cloudflare!         ║${NC}"
echo -e "${MAGENTA}╚════════════════════════════════════════╝${NC}"
echo
echo -e "${GREEN}Frontend (öffentlich):${NC}  $FRONTEND_URL"
echo -e "${GREEN}Backend API (öffentlich):${NC} $BACKEND_URL"
echo
echo -e "${CYAN}Lokal:${NC}"
echo -e "  Frontend:  http://localhost:5173"
echo -e "  Backend:   http://localhost:3001"
echo
echo -e "${YELLOW}Zum Beenden:${NC} Drücke ${RED}Ctrl+C${NC}"
echo

# Cleanup Funktion
cleanup() {
    echo
    echo -e "${YELLOW}Beende alle Services...${NC}"
    kill $BGEN_PID $BACKEND_TUNNEL_PID $FRONTEND_TUNNEL_PID 2>/dev/null
    lsof -ti:3001 | xargs kill -9 2>/dev/null
    lsof -ti:5173 | xargs kill -9 2>/dev/null
    pkill cloudflared 2>/dev/null

    # Setze .env zurück auf localhost
    echo "VITE_API_URL=http://localhost:3001" > /home/raphi/bGen/bgen-new/.env

    echo -e "${GREEN}✓${NC} Alle Services gestoppt"
    exit 0
}

trap cleanup SIGINT SIGTERM

# Warte auf Ctrl+C
while true; do
    sleep 5
done
