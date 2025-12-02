#!/bin/bash

# bGen Backend - Express Server mit MongoDB
# Startet Node.js Backend auf Port 3000

echo "🔧 Starte bGen Backend..."

cd /home/raphi/bGen/bGen_test

# Prüfe ob MongoDB läuft
if ! pgrep -x "mongod" > /dev/null; then
    echo "⚠️  MongoDB ist nicht gestartet"
    echo "Starte MongoDB..."
    sudo systemctl start mongod 2>/dev/null || sudo service mongod start 2>/dev/null
    sleep 2
fi

# Starte Backend
npm run dev

