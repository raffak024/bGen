#!/bin/bash

# bGen Frontend - React + Vite
# Startet Vite Dev Server auf Port 5173

echo "🎨 Starte bGen Frontend..."

cd /home/raphi/bGen/bgen-new

# Prüfe ob Backend läuft
if ! curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "⚠️  Backend läuft nicht auf Port 3000"
    echo "Starte zuerst das Backend mit: ./start-backend.sh"
    echo ""
    echo "Fortfahren? (y/n)"
    read -r response
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Starte Frontend
npm run dev

