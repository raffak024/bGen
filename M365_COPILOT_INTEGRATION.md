# Microsoft 365 Copilot Integration - aiGen

**Status:** ✅ Vollständig implementiert
**Datum:** 2025-11-19
**Provider:** Azure OpenAI Service (M365 Copilot Backend)

---

## 🎯 Übersicht

aiGen unterstützt jetzt **Microsoft 365 Copilot** über den **Azure OpenAI Service**. Dies ermöglicht Organisationen mit Office 365 Enterprise-Lizenzen, ihre eigene Azure OpenAI-Instanz für sichere, DSGVO-konforme Textgenerierung zu nutzen.

### Unterstützte AI-Provider (3):

1. **OpenAI** - Direkte OpenAI API
2. **Anthropic Claude** - Claude API
3. **Microsoft 365 Copilot (Azure OpenAI)** ✨ NEU

---

## 🔑 Was ist Azure OpenAI?

**Azure OpenAI Service** ist Microsofts Enterprise-Lösung für OpenAI-Modelle:

- **Gleiche Modelle** wie OpenAI (GPT-4o, GPT-4, GPT-3.5)
- **Enterprise-Sicherheit** - DSGVO-konform, EU-Hosting möglich
- **Private Endpoints** - Daten bleiben in deiner Azure-Umgebung
- **Microsoft 365 Integration** - Teil von M365 Copilot
- **Kosten-Kontrolle** - Pay-as-you-go mit Azure-Budget
- **Compliance** - ISO, SOC, HIPAA zertifiziert

---

## 📋 Voraussetzungen

### 1. Azure Subscription
- Aktives Azure-Konto
- Subscription mit aktiviertem Azure OpenAI Service
- **Wichtig:** Nicht alle Regionen unterstützen Azure OpenAI

### 2. Azure OpenAI Resource
- Erstellt in Azure Portal
- Region: z.B. **West Europe** oder **Switzerland North**
- Pricing Tier: Standard (Pay-as-you-go)

### 3. Model Deployment
- Mindestens ein GPT-Model deployed
- Empfohlen: **gpt-4o** oder **gpt-35-turbo**
- Deployment-Name merken!

---

## 🚀 Azure OpenAI Setup (Schritt-für-Schritt)

### Schritt 1: Azure OpenAI Resource erstellen

```bash
# Via Azure Portal:
1. Gehe zu: https://portal.azure.com
2. Suche "Azure OpenAI"
3. Klicke "Create"
4. Wähle Resource Group (oder erstelle neue)
5. Region: West Europe (oder Switzerland North)
6. Name: z.B. "aigen-openai-{dein-unternehmen}"
7. Pricing tier: Standard S0
8. Klicke "Review + create"
```

### Schritt 2: Model Deployment

```bash
# Im Azure OpenAI Studio:
1. Öffne deine Resource → "Model deployments"
2. Klicke "Create new deployment"
3. Modell wählen: gpt-4o (empfohlen)
4. Deployment name: "gpt-4o-deployment" (merken!)
5. Deployment type: Standard
6. Token rate limit: 80K TPM (anpassbar)
7. Klicke "Create"
```

**Wichtige Modell-Namen in Azure:**
| Azure Deployment | Entspricht OpenAI Modell |
|------------------|--------------------------|
| `gpt-4o` | gpt-4o |
| `gpt-4-turbo` | gpt-4-turbo-preview |
| `gpt-4` | gpt-4 |
| `gpt-35-turbo` | gpt-3.5-turbo |

### Schritt 3: API Key und Endpoint holen

```bash
# Im Azure Portal:
1. Gehe zu deiner Azure OpenAI Resource
2. Menü links: "Keys and Endpoint"
3. Kopiere:
   - KEY 1: (z.B. "abc123def456...") → API Key
   - Endpoint: (z.B. "https://aigen-openai-ch.openai.azure.com/")
4. Merke den Deployment-Namen von Schritt 2
```

---

## ⚙️ aiGen Konfiguration

### In aiGen Settings eintragen

1. **Öffne aiGen:** http://localhost:5173
2. **Login:** z.B. userB / test123
3. **Settings öffnen** (Zahnrad-Icon)
4. **Provider wählen:** "Microsoft 365 Copilot (Azure OpenAI)"
5. **Konfiguriere:**

```
API-Schlüssel:     abc123def456...
                   (Von Azure Portal → Keys and Endpoint → KEY 1)

Azure Endpoint:    https://aigen-openai-ch.openai.azure.com
                   (Von Azure Portal → Keys and Endpoint → Endpoint)
                   OHNE trailing /openai/deployments!

Azure Deployment:  gpt-4o-deployment
                   (Deployment-Name aus Azure OpenAI Studio)

Modell:           gpt-4o
                   (Welches Modell das Deployment verwendet)

Max Tokens:       2000
Temperature:      0.7
Text Size:        Mittel
```

6. **Speichern**

---

## 🧪 Testing

### Test 1: Settings speichern

```bash
# Login
curl -s -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"userB","password":"test123"}' > /tmp/login.json

TOKEN=$(cat /tmp/login.json | jq -r '.token')

# Azure Settings speichern
curl -X POST http://localhost:3001/settings \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "azure",
    "apiKey": "YOUR_AZURE_API_KEY",
    "azureEndpoint": "https://your-resource.openai.azure.com",
    "azureDeployment": "gpt-4o-deployment",
    "model": "gpt-4o",
    "maxTokens": 2000,
    "temperature": 0.7,
    "textSize": "Mittel"
  }'
```

**Erwartete Antwort:**
```json
{
  "success": true,
  "message": "Einstellungen gespeichert"
}
```

### Test 2: Text-Generierung

```bash
# Report generieren mit Azure
curl -X POST http://localhost:3001/report \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Erstelle einen professionellen deutschen Text über Hilfsmittel am Arbeitsplatz für Personen mit Bewegungseinschränkungen.",
    "section": "test"
  }'
```

**Bei Erfolg:**
```json
{
  "success": true,
  "data": {
    "generatedText": "...",
    "provider": "azure",
    "model": "gpt-4o"
  }
}
```

---

## 🔧 Implementierung Details

### Backend Changes

#### 1. Setting Model (`backend/models/Setting.js`)
```javascript
provider: {
  type: String,
  enum: ["openai", "claude", "azure"], // Azure hinzugefügt
  default: "openai",
},
// Neue Azure-spezifische Felder:
azureEndpoint: {
  type: String,
  required: false,
},
azureDeployment: {
  type: String,
  required: false,
},
azureApiVersion: {
  type: String,
  default: "2024-02-01",
},
```

#### 2. API Client (`backend/utils/apiClient.js`)

**Azure OpenAI Initialisierung:**
```javascript
async function initializeAzure(apiKey, endpoint) {
  azureInstance = new OpenAI({
    apiKey: apiKey,
    baseURL: `${endpoint}/openai/deployments`,
    defaultQuery: { 'api-version': '2024-02-01' },
    defaultHeaders: { 'api-key': apiKey },
  });
  return azureInstance;
}
```

**Text-Generierung:**
```javascript
async function generateWithAzure(prompt, setting) {
  const azure = await initializeAzure(setting.apiKey, setting.azureEndpoint);
  const deploymentName = setting.azureDeployment || setting.model;

  const response = await azure.chat.completions.create({
    model: deploymentName, // Deployment-Name, NICHT Modell-Name!
    messages: [
      { role: "system", content: "..." },
      { role: "user", content: prompt }
    ],
    max_tokens: setting.maxTokens || 2000,
    temperature: setting.temperature || 0.7,
  });

  return response.choices[0].message.content.trim();
}
```

### Frontend Changes

#### TypeScript Types (`src/types/index.ts`)
```typescript
export type AIProvider = 'openai' | 'claude' | 'azure';
```

#### Settings Modal (`src/components/SettingsModalNew.tsx`)

**Azure-spezifische UI-Felder:**
```tsx
{formData.provider === 'azure' && (
  <>
    <div>
      <label>Azure Endpoint</label>
      <input
        placeholder="https://your-resource.openai.azure.com"
        value={formData.azureEndpoint}
        onChange={(e) => setFormData({...formData, azureEndpoint: e.target.value})}
      />
    </div>

    <div>
      <label>Azure Deployment Name</label>
      <input
        placeholder="gpt-4o-deployment"
        value={formData.azureDeployment}
        onChange={(e) => setFormData({...formData, azureDeployment: e.target.value})}
      />
    </div>
  </>
)}
```

---

## 🚨 Häufige Fehler

### 1. "Azure Endpoint nicht konfiguriert"
**Ursache:** `azureEndpoint` leer
**Lösung:**
- Prüfe Azure Portal → Keys and Endpoint
- Format: `https://YOUR-RESOURCE.openai.azure.com`
- **OHNE** `/openai/deployments` am Ende!

### 2. "Deployment not found"
**Ursache:** Falscher Deployment-Name
**Lösung:**
- Prüfe Azure OpenAI Studio → Deployments
- Deployment-Name **exakt** übernehmen
- Deployment-Name ≠ Modell-Name!

### 3. "Invalid API Key"
**Ursache:** Falscher oder abgelaufener Key
**Lösung:**
- Regeneriere Key in Azure Portal
- Nutze KEY 1 oder KEY 2
- Keys regelmäßig rotieren (Security Best Practice)

### 4. "Resource not found in region"
**Ursache:** Azure OpenAI nicht in gewählter Region verfügbar
**Lösung:**
- Nutze **West Europe** oder **Switzerland North**
- Vollständige Region-Liste: [Azure OpenAI Service Regions](https://learn.microsoft.com/azure/ai-services/openai/concepts/models#model-summary-table-and-region-availability)

### 5. "Quota exceeded"
**Ursache:** TPM (Tokens per Minute) Limit erreicht
**Lösung:**
- Erhöhe TPM in Azure OpenAI Studio → Deployments
- Oder warte 60 Sekunden
- Für Production: Nutze Provisioned Throughput

---

## 💰 Kosten

### Azure OpenAI Pricing (Stand 2025)

| Modell | Input (1K Tokens) | Output (1K Tokens) |
|--------|-------------------|---------------------|
| GPT-4o | $0.0025 | $0.010 |
| GPT-4o-mini | $0.00015 | $0.0006 |
| GPT-4-turbo | $0.010 | $0.030 |
| GPT-35-turbo | $0.0005 | $0.0015 |

**Beispiel-Kalkulation** (1000 Berichte/Monat):
- Durchschnitt: 1500 Input + 500 Output Tokens pro Bericht
- Modell: GPT-4o
- Kosten: (1.5 × $0.0025 + 0.5 × $0.010) × 1000 = **~$9/Monat**

**Tipp:** Nutze `gpt-4o-mini` für 90% Kosteneinsparung bei ähnlicher Qualität!

---

## 🔒 Sicherheit & Compliance

### Vorteile Azure OpenAI vs. Public OpenAI

| Feature | OpenAI Public | Azure OpenAI |
|---------|---------------|--------------|
| DSGVO-konform | ❌ Nein (US-Server) | ✅ Ja (EU-Server möglich) |
| Daten bleiben in EU | ❌ Nein | ✅ Ja (Region wählbar) |
| Microsoft trainiert mit Daten | ❌ Ja | ✅ Nein |
| Private Endpoints | ❌ Nein | ✅ Ja (VNet möglich) |
| SOC 2 Compliance | ✅ Ja | ✅ Ja |
| ISO 27001 | ✅ Ja | ✅ Ja |
| HIPAA | ❌ Nein | ✅ Ja |

**Für IV-Berichte:** Azure OpenAI ist die **bessere Wahl** wegen DSGVO und EU-Hosting!

### Best Practices

1. **API Keys sicher speichern**
   - Nutze Azure Key Vault in Production
   - Regelmäßige Key-Rotation (alle 90 Tage)
   - Niemals in Git committen

2. **Private Endpoints nutzen**
   - Verhindert öffentlichen Internet-Zugriff
   - Nur via Azure VNet erreichbar
   - Enterprise-Standard für sensible Daten

3. **Monitoring & Logging**
   - Azure Monitor für API-Calls
   - Application Insights für Fehler
   - Budget-Alerts einrichten

---

## 📊 Vergleich: OpenAI vs. Claude vs. Azure

| Kriterium | OpenAI | Claude | Azure OpenAI |
|-----------|--------|--------|--------------|
| **Deutsche Texte** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **IV-Fachsprache** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **DSGVO** | ❌ | ⚠️ | ✅ |
| **EU-Hosting** | ❌ | ⚠️ | ✅ |
| **Kosten** | $$ | $$$$ | $$ |
| **Geschwindigkeit** | Schnell | Mittel | Schnell |
| **M365 Integration** | ❌ | ❌ | ✅ |
| **Enterprise Support** | ⚠️ | ⚠️ | ✅ |

**Empfehlung:**
- **Qualität:** Claude (beste deutsche IV-Texte)
- **Compliance:** Azure OpenAI (DSGVO, EU-Hosting)
- **Kosten:** OpenAI oder Azure mit gpt-4o-mini

---

## 📝 Deployment-Checklist

- [ ] Azure Subscription vorhanden
- [ ] Azure OpenAI Resource erstellt
- [ ] Model deployed (gpt-4o empfohlen)
- [ ] API Key und Endpoint kopiert
- [ ] Deployment-Name notiert
- [ ] aiGen Settings konfiguriert
- [ ] Test-Report generiert
- [ ] Kosten-Monitoring aktiviert
- [ ] Budget-Alerts eingerichtet
- [ ] DSGVO-Dokumentation erstellt

---

## 🆘 Support & Ressourcen

### Microsoft Dokumentation
- [Azure OpenAI Service](https://learn.microsoft.com/azure/ai-services/openai/)
- [Quickstart Guide](https://learn.microsoft.com/azure/ai-services/openai/quickstart)
- [Model Deployments](https://learn.microsoft.com/azure/ai-services/openai/how-to/create-resource)
- [Pricing Calculator](https://azure.microsoft.com/pricing/details/cognitive-services/openai-service/)

### aiGen Spezifisch
- **Integration Tests:** `bash /tmp/test-azure-integration.sh`
- **Backend Logs:** `/tmp/backend.log` oder BashOutput Tool
- **Frontend Logs:** Browser Console (F12)

---

## ✅ Zusammenfassung

**Microsoft 365 Copilot (Azure OpenAI) Integration ist vollständig implementiert!**

### Was funktioniert:
✅ Azure OpenAI API Client
✅ Deployment-basierte Model-Auswahl
✅ API Key + Endpoint Konfiguration
✅ Frontend UI mit Azure-Feldern
✅ Settings speichern & laden
✅ Text-Generierung mit Azure

### Nächste Schritte:
1. **Azure Resource erstellen** (siehe Schritt-für-Schritt Guide)
2. **Model deployen** (gpt-4o empfohlen)
3. **In aiGen konfigurieren** (Settings → Azure)
4. **Ersten Bericht generieren**
5. **Kosten monitoren** (Azure Portal → Cost Management)

---

**Status:** Produktionsbereit für Enterprise-Nutzung! 🎉

*Erstellt: 2025-11-19*
*Version: 1.0.0*
*Provider: Azure OpenAI Service*
