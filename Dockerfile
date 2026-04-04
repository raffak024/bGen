# bGen - Benutzerdefiniertes Projekt
# HINWEIS: Projekttyp wurde nicht automatisch erkannt.
# Bitte dieses Dockerfile an dein Projekt anpassen!

# Option 1: Node.js
# FROM node:20-alpine
# WORKDIR /app
# COPY package*.json ./
# RUN npm ci --only=production
# COPY . .
# CMD ["node", "server.js"]

# Option 2: Python
# FROM python:3.12-slim
# WORKDIR /app
# COPY requirements.txt .
# RUN pip install --no-cache-dir -r requirements.txt
# COPY . .
# CMD ["python", "main.py"]

# Option 3: Statische Dateien (aktuell aktiv)
FROM nginx:alpine

WORKDIR /usr/share/nginx/html

# Nur relevante Dateien kopieren (anpassen!)
COPY . .

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
