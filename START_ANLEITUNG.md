# 🚀 aiGen - Start Anleitung

## Schnellstart

### Option 1: Desktop Icon (Einfachste Methode)
1. **Doppelklick** auf `aiGen` Icon auf dem Desktop
2. Terminal öffnet sich automatisch
3. Warte bis "aiGen läuft!" erscheint
4. Browser öffnen: http://localhost:5173

### Option 2: Terminal
```bash
cd ~/Desktop
./start-aigen.sh
```

### Option 3: Vom Projekt-Verzeichnis
```bash
cd ~/aiGen
./start-aigen.sh
```

**Hinweis:** Das Script funktioniert von überall - es verwendet immer absolute Pfade zu `/home/raphi/aiGen`!

---

## ⚡ Was macht das Start-Script?

Das Script führt automatisch folgende Schritte aus:

1. **MongoDB prüfen**
   - Prüft ob MongoDB läuft
   - Startet MongoDB automatisch falls nötig
   - Verschiedene Start-Methoden (systemctl, service, docker, manuell)

2. **Alte Prozesse beenden**
   - Port 3001 (Backend) freigeben
   - Port 5173 (Frontend) freigeben
   - Alte nodemon/vite Prozesse beenden

3. **Backend starten**
   - Startet Express Server auf Port 3001
   - Verbindet mit MongoDB
   - CORS aktiviert für Cloudflare Tunnel
   - Logs: `~/aiGen/logs/backend.log`

4. **Frontend starten**
   - Startet Vite Dev Server auf Port 5173
   - React + TypeScript
   - Logs: `~/aiGen/logs/frontend.log`

5. **Status anzeigen**
   - URLs für Frontend/Backend
   - Log-Pfade
   - Stop-Anleitung

---

## 🛑 aiGen beenden

### Option 1: Im Terminal
Drücke **Ctrl+C** im laufenden Terminal

### Option 2: Stop-Script
```bash
cd ~/Desktop
./stop-aigen.sh
```

### Option 3: Vom Projekt-Verzeichnis
```bash
cd ~/aiGen
./stop-aigen.sh
```

---

## 📊 URLs

Nach dem Start sind folgende Services erreichbar:

| Service | URL | Beschreibung |
|---------|-----|--------------|
| **Frontend** | http://localhost:5173 | React UI (Vite Dev Server) |
| **Backend** | http://localhost:3001 | Express API Server |
| **MongoDB** | mongodb://localhost:27017 | Datenbank |

---

## 📝 Logs anzeigen

### Alle Logs (Live)
```bash
# Backend
tail -f ~/aiGen/logs/backend.log

# Frontend
tail -f ~/aiGen/logs/frontend.log

# MongoDB
tail -f ~/aiGen/logs/mongodb.log
```

### Letzte 50 Zeilen
```bash
tail -50 ~/aiGen/logs/backend.log
```

---

## 🔧 Troubleshooting

### Problem: MongoDB startet nicht
```bash
# Prüfe MongoDB Status
sudo systemctl status mongodb
# oder
sudo service mongodb status

# Manuell starten
sudo systemctl start mongodb
# oder
sudo service mongodb start
```

### Problem: Port 3001 belegt
```bash
# Finde Prozess
lsof -i:3001

# Beende Prozess
lsof -ti:3001 | xargs kill -9
```

### Problem: Port 5173 belegt
```bash
# Finde Prozess
lsof -i:5173

# Beende Prozess
lsof -ti:5173 | xargs kill -9
```

### Problem: "node_modules not found"
```bash
# Backend
cd ~/aiGen/aiGen_test
npm install

# Frontend
cd ~/aiGen/aigen-new
npm install
```

---

## 🎯 Nützliche Befehle

### Status prüfen
```bash
# Prüfe alle Ports
lsof -i:3001,5173,27017

# Prüfe Prozesse
ps aux | grep -E "node|mongo"
```

### Logs löschen
```bash
rm -rf ~/aiGen/logs/*.log
```

### Scripts neu herunterladen
```bash
# Kopiere vom Projekt-Verzeichnis
cp ~/aiGen/start-aigen.sh ~/Desktop/
cp ~/aiGen/stop-aigen.sh ~/Desktop/
chmod +x ~/Desktop/*.sh
```

---

## 📦 Script-Dateien

| Datei | Location | Beschreibung |
|-------|----------|--------------|
| `start-aigen.sh` | `~/aiGen/` | Haupt-Start-Script |
| `start-aigen.sh` | `~/Desktop/` | Kopie für schnellen Zugriff |
| `stop-aigen.sh` | `~/aiGen/` | Stop-Script |
| `stop-aigen.sh` | `~/Desktop/` | Kopie für schnellen Zugriff |
| `aiGen.desktop` | `~/Desktop/` | Desktop-Icon |
| `logs/` | `~/aiGen/logs/` | Log-Verzeichnis |

---

## 🌟 Features des Start-Scripts

- ✅ **Automatische MongoDB-Erkennung** - Erkennt verschiedene MongoDB-Installationen
- ✅ **Port-Prüfung** - Beendet alte Prozesse automatisch
- ✅ **Farbiges Output** - Übersichtliche Terminal-Ausgabe
- ✅ **Fehlerbehandlung** - Zeigt detaillierte Fehler bei Problemen
- ✅ **Live-Monitoring** - Prüft ob Prozesse laufen bleiben
- ✅ **Signal-Handling** - Sauberes Beenden mit Ctrl+C
- ✅ **Logs** - Alle Logs in separaten Dateien
- ✅ **Status-Anzeige** - Zeigt URLs und Befehle

---

## 🚀 Cloudflare Tunnel

Falls du Cloudflare Tunnel verwendest:

```bash
# Frontend Tunnel (Port 5173)
cloudflared tunnel --url http://localhost:5173

# Backend Tunnel (Port 3001)
cloudflared tunnel --url http://localhost:3001
```

Die neue CORS-Konfiguration erlaubt automatisch alle `*.trycloudflare.com` Origins!

---

## 💡 Tipps

1. **Immer das Start-Script verwenden** - Nicht manuell starten
2. **Logs regelmäßig prüfen** - Bei Problemen in Logs schauen
3. **Stop-Script verwenden** - Nicht einfach Terminal schließen
4. **MongoDB Status prüfen** - Vor dem Start sicherstellen dass MongoDB läuft

---

**Erstellt von:** binomOne.aiGen
**Datum:** 2025-11-21
**Version:** 1.0
