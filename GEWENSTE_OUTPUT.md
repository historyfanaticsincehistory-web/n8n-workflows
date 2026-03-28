# [WORKFLOW NAAM] - Audit & Debug Handleiding

**LEVEND DOCUMENT - Wordt bijgewerkt na elke fout**
**Workflow ID:** [ID]
**Laatste update:** [DATUM]

---

# DEEL A: GEWENSTE OUTPUT (EXTREEM GEDETAILLEERD)

## A.1 Wat is de gewenste output?

### Het eindproduct heeft de volgende eigenschappen:

| Aspect | Specificatie | Waarom |
|--------|--------------|--------|
| **Type** | [API response / Bestand / Database entry / Email] | [Reden] |
| **Format** | [JSON / MP4 / PDF / etc.] | [Reden] |
| **Locatie** | [Waar komt de output?] | [Reden] |

### De output MOET bevatten:

1. **[Vereiste 1]** - [Specifieke details]
2. **[Vereiste 2]** - [Specifieke details]
3. **[Vereiste 3]** - [Specifieke details]

### De output MAG NIET bevatten:

1. [Verboden element 1]
2. [Verboden element 2]
3. [Verboden element 3]

---

## A.2 Hoe ziet de perfecte output eruit?

### Stap-voor-stap breakdown:

```
STAP 1 ([Naam], [timing/details]):
├── Actie: [Wat gebeurt er]
│   - Detail A: [specifiek]
│   - Detail B: [specifiek]
├── Verwachte data: [wat moet er zijn]
└── Validatie: [hoe weten we dat het goed is]

STAP 2 ([Naam]):
├── Actie: [Wat gebeurt er]
├── Verwachte data: [wat moet er zijn]
└── Validatie: [hoe weten we dat het goed is]

FINALE:
├── Output: [eindresultaat]
├── Format: [exact formaat]
└── Locatie: [waar opgeslagen/verstuurd]
```

### Voorbeeld perfecte output:

```json
{
  "success": true,
  "data": {
    "field1": "exacte waarde",
    "field2": 123,
    "nested": {
      "subfield": "waarde"
    }
  },
  "metadata": {
    "timestamp": "2026-03-28T12:00:00Z",
    "version": "1.0"
  }
}
```

---

## A.3 Feedback Loop - Hoe wordt gewenste output verbeterd?

```
┌─────────────────────────────────────────────────────────────┐
│                    FEEDBACK LOOP                             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. OUTPUT BEKIJKEN                                          │
│     ↓                                                        │
│  2. CHECKLIST DOORLOPEN:                                     │
│     □ Voldoet aan vereiste 1?                                │
│     □ Voldoet aan vereiste 2?                                │
│     □ Voldoet aan vereiste 3?                                │
│     □ Geen verboden elementen?                               │
│     □ Format correct?                                        │
│     ↓                                                        │
│  3. PROBLEEM GEÏDENTIFICEERD?                                │
│     ↓                                                        │
│  4. ROOT CAUSE ZOEKEN (zie Deel C)                           │
│     ↓                                                        │
│  5. FIX DOCUMENTEREN IN DIT DOCUMENT                         │
│     ↓                                                        │
│  6. NIEUWE REGEL TOEVOEGEN AAN AUDIT                         │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

# DEEL B: NODE SPECIFICATIES (COMPLEET MET CODE)

## B.1 Hoe dit deel te lezen

Per node wordt beschreven:
- **FUNCTIE**: Wat doet deze node om bij te dragen aan de gewenste output
- **INPUT**: Exact wat erin komt (met voorbeelden)
- **CODE/INVULLING**: De exacte code of configuratie
- **OUTPUT**: Exact wat eruit komt (met voorbeelden)
- **AUDIT**: Hoe te controleren of deze node correct werkt
- **ROOT CAUSE**: Waar te zoeken als deze node faalt

---

## B.2 FASE 1: TRIGGER

### NODE: [Trigger Node Naam]
```
ID: [uuid]
TYPE: [webhook / schedule / manual]
```

**FUNCTIE:**
[Beschrijf exact wat deze node doet en waarom]

**INPUT:**
```
[Beschrijf de trigger - HTTP request, schedule, etc.]
```

**INVULLING:**
```json
{
  "parameter1": "waarde1",
  "parameter2": "waarde2"
}
```

**OUTPUT:**
```json
{
  "headers": { },
  "body": { }
}
```

**AUDIT:**
1. [Check 1]
2. [Check 2]

**ROOT CAUSE bij falen:**
- [Symptoom 1] → [Oorzaak en fix]
- [Symptoom 2] → [Oorzaak en fix]

---

## B.3 FASE 2: DATA INPUT

### NODE: [Data Input Node Naam]
```
ID: [uuid]
TYPE: [googleSheets / httpRequest / database]
```

**FUNCTIE:**
[Beschrijf exact wat deze node doet]

**INPUT:**
[Wat triggert deze node]

**INVULLING:**
```json
{
  "operation": "read",
  "source": "...",
  "options": {
    "criticalOption": "waarde"  // ⚠️ KRITIEK: MOET AANWEZIG ZIJN
  }
}
```

**OUTPUT:**
```json
[
  {
    "field1": "waarde1",
    "field2": "waarde2"
  }
]
```

**AUDIT:**
1. Check dat [kritieke optie] aanwezig is
2. Check dat output niet leeg is
3. Check dat alle vereiste velden aanwezig zijn

**ROOT CAUSE bij falen:**
- "Missing required parameter" → [Specifieke fix]
- "Authentication failed" → [Specifieke fix]
- Lege output → [Specifieke fix]

**⚠️ BEKENDE FOUT ([DATUM]):**
[Beschrijf fout en fix]

---

## B.4 FASE 3: PROCESSING

### NODE: [Processing Node Naam]
```
ID: [uuid]
TYPE: code
```

**FUNCTIE:**
[Beschrijf exact wat deze node doet]

**INPUT:**
```json
{
  "inputField1": "waarde",
  "inputField2": 123
}
```

**CODE (VOLLEDIG):**
```javascript
// [Beschrijving van wat de code doet]
const item = $input.first().json;

// Stap 1: [Beschrijving]
const result1 = item.inputField1;

// Stap 2: [Beschrijving]
const result2 = processData(result1);

// KRITIEK: [Belangrijke logica]
if (!result2) {
  throw new Error('Specifieke error message');
}

return [{
  json: {
    outputField1: result1,
    outputField2: result2,
    _debug_info: 'Voor troubleshooting'
  }
}];
```

**OUTPUT:**
```json
{
  "outputField1": "verwerkte waarde",
  "outputField2": "resultaat",
  "_debug_info": "Voor troubleshooting"
}
```

**AUDIT:**
1. Check dat `_debug_info` aanwezig is
2. Check dat outputField1 niet leeg is
3. Check dat er geen errors in console zijn

**ROOT CAUSE bij falen:**
- "Specifieke error" → [Oorzaak en fix]
- Output leeg → [Oorzaak en fix]

---

## B.5 FASE 4: OUTPUT

### NODE: [Output Node Naam]
```
ID: [uuid]
TYPE: [httpRequest / email / googleSheets]
```

**FUNCTIE:**
[Beschrijf exact wat deze node doet - dit is de finale output]

**INPUT:**
```json
{
  "dataToSend": "..."
}
```

**INVULLING:**
```json
{
  "method": "POST",
  "url": "https://api.example.com/endpoint",
  "body": "={{ $json.dataToSend }}"
}
```

**OUTPUT:**
```json
{
  "success": true,
  "id": "created-id-123"
}
```

**AUDIT:**
1. Check dat response success = true
2. Check dat data correct is aangekomen
3. Verifieer in doelsysteem

**ROOT CAUSE bij falen:**
- 401 error → Authentication probleem
- 400 error → Data format incorrect
- Timeout → Service niet bereikbaar

---

# DEEL C: AUDIT & DEBUG SYSTEEM

## C.1 De Audit Checklist

```
┌─────────────────────────────────────────────────────────────┐
│                    AUDIT CHECKLIST                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  □ 1. PREFLIGHT                                              │
│    □ Alle externe services online?                           │
│    □ API keys geldig?                                        │
│    □ Credentials niet verlopen?                              │
│                                                              │
│  □ 2. INPUT                                                  │
│    □ Trigger werkt correct?                                  │
│    □ Data source bereikbaar?                                 │
│    □ Input data format correct?                              │
│    □ Alle verplichte velden aanwezig?                        │
│                                                              │
│  □ 3. PROCESSING                                             │
│    □ Alle nodes hebben id, name, type, typeVersion?          │
│    □ Connections verwijzen naar node NAMES (niet IDs)?       │
│    □ Code nodes hebben error handling?                       │
│    □ Geen hardcoded secrets?                                 │
│                                                              │
│  □ 4. OUTPUT                                                 │
│    □ Output format correct?                                  │
│    □ Alle vereiste velden aanwezig?                          │
│    □ Geen verboden elementen?                                │
│    □ Doelsysteem heeft data ontvangen?                       │
│                                                              │
│  □ 5. WORKFLOW STRUCTUUR                                     │
│    □ Workflow importeerbaar in n8n?                          │
│    □ n8n_validate_workflow passed?                           │
│    □ Geen ERROR_IN_OUTPUT_NODE?                              │
│    □ Alle credentials correct gekoppeld?                     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## C.2 Root Cause Zoeken - Stap voor Stap

### Wanneer workflow faalt:

```
1. KIJK WAAR HET FAALT
   ↓
   n8n_executions(action="get", id="EXECUTION_ID", mode="error")
   ↓
   Dit geeft: faalde node + error message + input data

2. CHECK DE INPUT VAN DIE NODE
   ↓
   Kijk naar "error.inputData" in de response
   ↓
   Is de input correct? Zo nee → upstream node is de root cause

3. TRACE BACKWARDS
   ↓
   Welke node produceerde de foute input?
   ↓
   Check DIE node's output
   ↓
   Herhaal tot je de root cause vindt

4. DOCUMENTEER DE ROOT CAUSE
   ↓
   Voeg toe aan "FOUT REGISTER" (Deel D)
   ↓
   Voeg fix toe aan AUDIT CHECKLIST
```

### Voorbeeld root cause analyse:

```
SYMPTOOM: [Wat je ziet fout gaan]

ANALYSE:
1. [Node X] verwacht [Y]
2. Maar [Node X] krijgt [Z]
3. Waarom? → [Upstream node] geeft verkeerde output
4. Waarom? → [Configuratie/code probleem]
5. ROOT CAUSE: [De echte oorzaak]

FIX:
1. [Specifieke wijziging]
2. [Validatie toegevoegd]
3. [Nieuwe audit regel]
```

---

## C.3 Debug Commands

### Check workflow:
```bash
# Valideer hele workflow
n8n_validate_workflow({ id: 'WORKFLOW_ID' })

# Haal execution details op
n8n_executions(action="get", id="EXEC_ID", mode="error")

# Bekijk workflow structuur
n8n_get_workflow({ id: 'WORKFLOW_ID', mode: 'structure' })
```

### Check services:
```bash
# HTTP endpoint check
curl -s "http://service:port/health"

# n8n API check
curl -s "http://localhost:5678/api/v1/workflows" \
  -H "X-N8N-API-KEY: YOUR_KEY"
```

---

# DEEL D: FOUT REGISTER (LESSEN UIT FOUTEN)

## D.1 Fout Register

| Datum | Symptoom | Root Cause | Fix | Nieuwe Audit Regel |
|-------|----------|------------|-----|-------------------|
| [DATUM] | [Wat zag je] | [Echte oorzaak] | [Hoe opgelost] | [Nieuwe check] |

---

## D.2 Structurele Verbeteringen na Fouten

### Na "[Fout beschrijving]" fout:

**NIEUWE REGEL:**
```
[Beschrijf de nieuwe regel die voorkomt dat deze fout weer gebeurt]
```

---

## D.3 Preventieve Checks

Voer deze checks uit VOORDAT je wijzigingen maakt:

```javascript
// Check 1: Workflow ID correct?
const expectedId = '[WORKFLOW_ID]';
// Controleer dit VOORDAT je begint

// Check 2: Valideer hele workflow
n8n_validate_workflow({ id: expectedId })
// Fix ALLE errors voordat je verder gaat

// Check 3: Tel nodes voor en na wijziging
const before = workflow.nodes.length;
// Na wijziging:
const after = workflow.nodes.length;
if (after < before) throw new Error('NODES VERDWENEN!');
```

---

# DEEL E: AI TRAINING INSTRUCTIES

## E.1 Hoe AI dit document moet gebruiken

```
1. LEES DIT DOCUMENT VOLLEDIG voordat je aan deze workflow werkt

2. BIJ ELKE DEBUG:
   a. Voer n8n_validate_workflow uit
   b. Gebruik AUDIT CHECKLIST (Deel C.1)
   c. Zoek ROOT CAUSE (Deel C.2)
   d. Documenteer nieuwe fouten (Deel D)

3. BIJ ELKE WIJZIGING:
   a. Check INPUT van de node (Deel B)
   b. Check OUTPUT van de node (Deel B)
   c. Check CODE als relevant (Deel B)
   d. Valideer na wijziging

4. BIJ NIEUWE FOUTEN:
   a. Voeg toe aan Fout Register (D.1)
   b. Voeg nieuwe regel toe aan Audit Checklist (C.1)
   c. Update preventieve checks (D.3)
   d. Update dit document
```

## E.2 Kritieke Waarschuwingen

```
⚠️ VERWIJDER NOOIT NODES ZONDER EXPLICIETE VRAAG
⚠️ WIJZIG NOOIT WORKFLOW ID
⚠️ CONTROLEER ALTIJD VERPLICHTE PARAMETERS
⚠️ LUISTER NAAR DE GEBRUIKER - als zij zeggen wat kapot is, CHECK DAT EERST
⚠️ VALIDEER ALTIJD NA WIJZIGINGEN
```

## E.3 Builder AI Instructies

```
JE BENT DE BUILDER. JE TAAK:

1. LEES dit document VOLLEDIG
2. BOUW workflow die voldoet aan DEEL A (Gewenste Output)
3. ELKE node moet voldoen aan DEEL B (Node Specs)
4. OUTPUT moet passen door DEEL C (Audit Checklist)
5. VERMIJD alle fouten uit DEEL D (Fout Register)

OUTPUT ALLEEN:
- Valide n8n workflow JSON
- Geen markdown, geen uitleg
- Alle nodes hebben: id, name, type, typeVersion, position, parameters
- Connections verwijzen naar node NAMES
```

## E.4 Reviewer AI Instructies

```
JE BENT DE REVIEWER. JE TAAK:

1. CHECK of workflow voldoet aan DEEL A (Gewenste Output)
2. CHECK elke node tegen DEEL B (Node Specs)
3. DOORLOOP de AUDIT CHECKLIST (Deel C.1)
4. CHECK dat geen fouten uit DEEL D herhaald worden

SCORE CRITERIA:
- 10: Perfect, voldoet aan alles
- 8-9: Kleine verbeterpunten
- 6-7: Werkend maar mist belangrijke aspecten
- 4-5: Structureel correct maar functionaliteit incompleet
- 1-3: Fundamentele problemen

BIJ SCORE < 8:
- Geef CONCRETE feedback
- Verwijs naar specifieke sectie in dit document
- Geef EXACTE instructies wat te veranderen
```

---

**Dit document wordt bijgewerkt na elke fout. De laatste fout bepaalt de eerste check.**

---

## VERSIE HISTORIE

| Datum | Wijziging | Door |
|-------|-----------|------|
| [DATUM] | Initieel document | AI Builder |
