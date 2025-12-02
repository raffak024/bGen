# Was du vom Arbeitgeber (O365) benötigst - Microsoft 365 Copilot für aiGen

**Zielgruppe:** Mitarbeiter, die aiGen mit ihrer Firmen-Azure-Umgebung nutzen möchten
**Stand:** 2025-11-19

---

## 🎯 Übersicht: Was brauchst du?

Um aiGen mit Microsoft 365 Copilot (Azure OpenAI) zu nutzen, benötigst du:

1. **Zugang zu Azure OpenAI Service** (von IT/Admin)
2. **API Key + Endpoint** (von IT/Admin)
3. **Deployment Name** eines GPT-Modells (von IT/Admin)

**Wichtig:** Du brauchst **NICHT** eine eigene Azure Subscription! Der IT-Admin deines Arbeitgebers muss dir nur Zugriff geben.

---

## 📋 Anforderungsliste für IT-Abteilung

### Was der IT-Admin tun muss:

#### 1. Azure OpenAI Service erstellen (einmalig)

**Falls noch nicht vorhanden**, muss die IT-Abteilung:

```
Service: Azure OpenAI Service
Region: West Europe ODER Switzerland North (wegen DSGVO)
Pricing: Standard (Pay-as-you-go)
Kosten: Ca. $5-20/Monat für normale Nutzung
```

**Wichtig für IT:**
- ✅ Region mit DSGVO-Compliance wählen (EU/Schweiz)
- ✅ **KEINE** persönlichen Daten für Training (Azure Policy)
- ✅ Private Endpoints möglich (für höchste Sicherheit)

#### 2. GPT-Modell deployen (einmalig)

**Der IT-Admin muss ein Modell deployen**, z.B.:

```
Modell: gpt-4o (empfohlen) ODER gpt-35-turbo (günstiger)
Deployment Name: z.B. "aigen-gpt4o" (merken!)
Token Limit: 80.000 TPM (anpassbar)
```

**Warum Deployment?**
- Azure OpenAI funktioniert anders als normale OpenAI API
- Modelle müssen zuerst in Azure "deployed" werden
- Jedes Deployment hat einen eigenen Namen

#### 3. API Key und Zugriff einrichten

**Der IT-Admin muss dir geben:**

```yaml
API Key:
  - Aus Azure Portal → Azure OpenAI Resource → "Keys and Endpoint"
  - Format: abc123def456...ghi789
  - Key 1 ODER Key 2 (beide funktionieren)

Endpoint URL:
  - Aus Azure Portal → Azure OpenAI Resource → "Keys and Endpoint"
  - Format: https://FIRMENNAME-openai.openai.azure.com/
  - OHNE /openai/deployments am Ende!

Deployment Name:
  - Aus Azure OpenAI Studio → "Deployments"
  - z.B. "aigen-gpt4o" oder "gpt-4o-deployment"
  - Exakt wie im Azure Portal angezeigt
```

---

## 🔑 Was du konkret vom IT-Admin anforderst

### E-Mail-Vorlage an IT-Abteilung:

```
Betreff: Zugriff auf Azure OpenAI für aiGen Tool

Hallo IT-Team,

ich möchte gerne das aiGen Tool mit unserem Azure OpenAI Service verbinden,
um DSGVO-konform Texte für IV-Berichte zu generieren.

Dafür benötige ich folgende Informationen:

1. API Key
   - Aus Azure Portal → Azure OpenAI Resource → "Keys and Endpoint" → KEY 1

2. Endpoint URL
   - Aus Azure Portal → Azure OpenAI Resource → "Keys and Endpoint" → Endpoint
   - Format: https://FIRMENNAME-openai.openai.azure.com/

3. Deployment Name
   - Name des deployed GPT-Modells (z.B. "gpt-4o-deployment")
   - Aus Azure OpenAI Studio → "Deployments"

Falls noch kein Azure OpenAI Service eingerichtet ist, wäre eine
Einrichtung mit folgenden Specs ideal:

- Service: Azure OpenAI
- Region: Switzerland North oder West Europe (DSGVO)
- Modell: gpt-4o (empfohlen) oder gpt-35-turbo (günstiger)
- Kosten: Ca. $5-20/Monat bei normaler Nutzung

Vielen Dank!
[Dein Name]
```

---

## 🏢 Verschiedene Szenarien

### Szenario 1: Firma hat bereits Azure OpenAI

**Wahrscheinlichkeit:** 30% (größere Firmen mit M365 Copilot)

**Was passiert:**
1. IT prüft, ob du Zugriff bekommen kannst
2. IT erstellt eventuell separates Deployment für dich
3. IT gibt dir: API Key + Endpoint + Deployment Name
4. **Dauer:** 1-2 Stunden

**Kosten für Firma:** $0 (nutzt bestehendes Service)

---

### Szenario 2: Firma hat Azure, aber kein OpenAI Service

**Wahrscheinlichkeit:** 50% (Firmen mit Azure Subscription)

**Was passiert:**
1. IT beantragt Azure OpenAI Zugang (bei Microsoft)
2. Microsoft prüft Antrag (kann 1-5 Tage dauern)
3. IT erstellt Azure OpenAI Resource
4. IT deployed Modell
5. IT gibt dir: API Key + Endpoint + Deployment Name
6. **Dauer:** 3-7 Tage (wegen Microsoft Approval)

**Kosten für Firma:**
- Einrichtung: $0
- Nutzung: ~$5-20/Monat (pay-as-you-go)

---

### Szenario 3: Firma hat kein Azure

**Wahrscheinlichkeit:** 20% (kleinere Firmen, nur O365)

**Was passiert:**
1. Firma muss Azure Subscription erstellen
2. IT beantragt Azure OpenAI Zugang
3. Microsoft prüft Antrag (1-5 Tage)
4. IT richtet alles ein
5. **Dauer:** 1-2 Wochen

**Kosten für Firma:**
- Azure Subscription: $0 (nur pay-per-use)
- Azure OpenAI Nutzung: ~$5-20/Monat

**Alternative:** In diesem Fall ist normale **OpenAI API** einfacher!

---

## ❓ Häufige Fragen deiner IT-Abteilung

### "Warum nicht normale OpenAI API?"

**Deine Antwort:**
```
Normale OpenAI API:
❌ Server in den USA
❌ OpenAI kann Daten zum Training nutzen
❌ Nicht DSGVO-konform für sensible Daten

Azure OpenAI:
✅ Server in der Schweiz/EU (Region wählbar)
✅ Daten bleiben in Firmen-Azure
✅ Microsoft nutzt KEINE Daten für Training
✅ DSGVO-konform + ISO-zertifiziert
✅ Perfekt für IV-Berichte mit Patientendaten
```

### "Wie hoch sind die Kosten?"

**Deine Antwort:**
```
Beispiel-Kalkulation (GPT-4o):
- 100 Berichte/Monat × 2000 Tokens = 200.000 Tokens
- Input: 200K × $0.0025 = $0.50
- Output: 200K × $0.010 = $2.00
- Total: ~$2.50/Monat

Mit gpt-35-turbo sogar nur ~$0.30/Monat!

Zum Vergleich:
- Ein M365 Copilot Seat: $30/Monat
- aiGen mit Azure OpenAI: $2-20/Monat (je nach Nutzung)
```

### "Ist das sicher?"

**Deine Antwort:**
```
✅ Gleiche Sicherheit wie Microsoft 365
✅ Daten bleiben in Firmen-Azure (Private Network möglich)
✅ Keine Daten-Weitergabe an OpenAI
✅ Microsoft nutzt Daten NICHT für Training
✅ ISO 27001, SOC 2, HIPAA zertifiziert
✅ DSGVO-konform bei EU-Region

Für IV-Berichte mit Patientendaten: IDEAL!
```

### "Kann ich das Limit kontrollieren?"

**Deine Antwort:**
```
✅ Ja! Azure bietet mehrere Controls:
1. Token Rate Limit (z.B. max 80K Tokens/Minute)
2. Budget Alerts (E-Mail bei X CHF/Monat)
3. Spending Limits (Hard-Stop bei Überschreitung)
4. Usage Analytics (detaillierte Kosten-Reports)

IT kann z.B. Limit auf 100 CHF/Monat setzen.
```

---

## 🔒 DSGVO & Compliance (für IT-Argumentation)

### Warum Azure OpenAI DSGVO-konformer ist:

| Aspekt | OpenAI Public | Azure OpenAI |
|--------|---------------|--------------|
| **Daten-Speicherort** | USA (nicht EU) | EU/Schweiz (wählbar) |
| **Daten-Nutzung** | Training möglich | KEIN Training |
| **Daten-Verarbeitung** | OpenAI Server | Firmen-Azure |
| **Data Residency** | ❌ | ✅ |
| **DSGVO Art. 44** | ⚠️ Problematisch | ✅ Konform |
| **Schweizer DSG** | ⚠️ Problematisch | ✅ Konform |
| **Audit Trail** | Limitiert | ✅ Vollständig |

**Für IV-Berichte:** Azure OpenAI ist die **richtige Wahl**!

---

## 📞 Was tun, wenn IT "Nein" sagt?

### Option 1: OpenAI API nutzen (einfacher)
```
- Keine Azure Subscription nötig
- Schneller Einstieg
- Kosten: ~$5-30/Monat
- Nachteil: Nicht DSGVO-optimal
- aiGen unterstützt das bereits!
```

### Option 2: Claude API nutzen (beste Texte)
```
- Anthropic Claude API
- Beste deutsche Texte für IV-Berichte
- Kosten: ~$10-40/Monat
- DSGVO: Besser als OpenAI, aber nicht so gut wie Azure
- aiGen unterstützt das bereits!
```

### Option 3: Privat bezahlen
```
- Du richtest private Azure Subscription ein
- Kosten: $5-20/Monat selbst zahlen
- Volle Kontrolle
- Steuerlich ggf. absetzbar (Arbeitsmittel)
```

---

## ✅ Checkliste: Habe ich alles?

**Von IT-Abteilung erhalten:**
- [ ] ✅ API Key (sieht aus wie: abc123def456...xyz)
- [ ] ✅ Endpoint URL (https://FIRMENNAME-openai.openai.azure.com/)
- [ ] ✅ Deployment Name (z.B. "gpt-4o-deployment")
- [ ] ✅ Modell-Info (welches GPT-Modell wurde deployed?)
- [ ] ✅ Bestätigung für DSGVO-konforme Nutzung

**Optional, aber hilfreich:**
- [ ] Kosten-Limit (z.B. max. 100 CHF/Monat)
- [ ] Kontakt bei Problemen
- [ ] Dokumentation der Firma

---

## 🚀 Was du dann in aiGen einträgst

### Beispiel mit echten Werten:

```yaml
# Szenario: Firma "MusterAG" hat Azure OpenAI in Switzerland North

Provider: Microsoft 365 Copilot (Azure OpenAI)

API-Schlüssel:
  abc123def456ghi789jkl012mno345pqr678

Azure Endpoint:
  https://musterag-openai.openai.azure.com

Azure Deployment Name:
  gpt-4o-deployment

Modell:
  gpt-4o

Max Tokens: 2000
Temperature: 0.7
Text Size: Mittel
```

**Fertig!** aiGen nutzt jetzt die Firmen-Azure-OpenAI-Instanz.

---

## 💡 Tipps für erfolgreiche IT-Anfrage

### 1. Zeige den Business Case
```
"Mit Azure OpenAI kann ich DSGVO-konform IV-Berichte
erstellen, ohne sensible Daten an US-Server zu senden.
Kosten: ~$10/Monat statt $30/Monat für M365 Copilot Seat."
```

### 2. Biete Test-Phase an
```
"Können wir das 1 Monat testen? Bei 100 CHF Kosten-Limit?
Falls es nicht funktioniert, stoppen wir es einfach."
```

### 3. Zeige Compliance-Vorteile
```
"Mit Azure OpenAI sind wir DSGVO-konform und haben
Full Audit Trail. Perfekt für Datenschutz-Audits."
```

### 4. Biete Alternative
```
"Falls Azure OpenAI nicht möglich ist: Normale OpenAI API
funktioniert auch (aber weniger sicher). aiGen unterstützt beides."
```

---

## 📊 Kosten-Transparenz für IT

### Realistische Szenarien:

**Szenario A: Wenig-Nutzer (50 Berichte/Monat)**
```
Modell: gpt-35-turbo
Kosten: ~$1-3/Monat
Empfehlung: Kein Limit nötig
```

**Szenario B: Normal-Nutzer (200 Berichte/Monat)**
```
Modell: gpt-4o
Kosten: ~$5-15/Monat
Empfehlung: Limit auf 50 CHF/Monat
```

**Szenario C: Viel-Nutzer (500 Berichte/Monat)**
```
Modell: gpt-4o
Kosten: ~$15-30/Monat
Empfehlung: Limit auf 100 CHF/Monat
```

**Worst Case (Missbrauch):**
```
Ohne Limit: Theoretisch unbegrenzt
Mit Limit: Maximum 100 CHF/Monat (hard-stop)
Budget Alert: E-Mail bei 50% (50 CHF)
```

---

## 🎯 Zusammenfassung: Was du brauchst

### Minimale Anforderung an IT:
1. **API Key** (1 String)
2. **Endpoint URL** (1 URL)
3. **Deployment Name** (1 String)

**Das war's!** Dauert für IT: **5 Minuten** (wenn Service bereits existiert).

### Falls Service noch nicht existiert:
- **Ersteinrichtung:** 1-7 Tage (wegen Microsoft Approval)
- **Aufwand für IT:** 2-4 Stunden
- **Kosten:** $5-20/Monat (pay-as-you-go)

---

## 📧 Fertige Anfrage-E-Mail (Copy & Paste)

```
Betreff: Zugriff auf Azure OpenAI für DSGVO-konforme Textgenerierung

Hallo [IT-Team],

ich nutze das Tool "aiGen" zur Erstellung von IV-Berichten und möchte
dies gerne DSGVO-konform über unsere Azure-Umgebung betreiben.

Falls bereits ein Azure OpenAI Service vorhanden ist, benötige ich:
✅ API Key (aus Azure Portal → OpenAI → Keys and Endpoint)
✅ Endpoint URL (z.B. https://firma-openai.openai.azure.com/)
✅ Deployment Name (Name des deployed GPT-Modells)

Falls noch kein Service vorhanden ist:
- Benötigt wird: Azure OpenAI Service
- Region: Switzerland North oder West Europe (DSGVO)
- Modell: gpt-4o oder gpt-35-turbo
- Geschätzte Kosten: ~$5-20/Monat

Vorteile Azure OpenAI:
✅ Daten bleiben in Firmen-Azure (DSGVO-konform)
✅ Keine Daten-Nutzung für Training
✅ ISO/SOC zertifiziert
✅ Kosten-transparent & limitierbar

Gerne erkläre ich Details persönlich oder per Call.

Vielen Dank!
[Dein Name]
[Deine Abteilung]
```

---

## ✨ Bonus: Falls IT Dokumentation braucht

**Verweise auf:**
- `/home/raphi/aiGen/M365_COPILOT_INTEGRATION.md` (Technische Doku)
- Microsoft Docs: https://learn.microsoft.com/azure/ai-services/openai/
- Azure Pricing: https://azure.microsoft.com/pricing/details/cognitive-services/openai-service/

---

**Status:** Mit diesen Informationen kann deine IT-Abteilung fundiert entscheiden! 🎯

*Erstellt: 2025-11-19*
*Für: aiGen Nutzer in O365-Umgebungen*
