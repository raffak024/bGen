#!/bin/bash

# bGen - Vollständiger Start (Backend + Frontend)
# Startet beide Services parallel in separaten Terminal-Tabs

echo "🚀 Starte bGen (Backend + Frontend)..."

# Terminal-Fenster für Backend
gnome-terminal --tab --title="bGen Backend" -- bash -c "cd /home/raphi/bGen/bGen_test && npm run dev; exec bash"

# Kurze Pause, damit Backend zuerst startet
sleep 2

# Terminal-Fenster für Frontend
gnome-terminal --tab --title="bGen Frontend" -- bash -c "cd /home/raphi/bGen/bgen-new && npm run dev; exec bash"

echo "✅ Backend: http://localhost:3000"
echo "✅ Frontend: http://localhost:5173"
echo ""
echo "Beide Services laufen in separaten Terminal-Tabs"
