# GEWENSTE OUTPUT SPECIFICATIE

Dit document beschrijft EXACT wat de gewenste output is. Beide AI's (Builder + Reviewer) gebruiken dit als bron van waarheid.

---

## 1. WORKFLOW DOEL

**Wat moet de workflow doen?**
[Beschrijf hier het doel van de workflow]

**Eindresultaat:**
[Wat is het concrete eindresultaat? Bestand? API call? Email?]

---

## 2. INPUT SPECIFICATIE

### Trigger
- **Type:** [Webhook / Schedule / Manual / Andere workflow]
- **Data format:** [JSON structuur van input]

### Vereiste velden
| Veld | Type | Verplicht | Beschrijving |
|------|------|-----------|--------------|
| | | | |

### Voorbeeld input
```json
{
  "voorbeeld": "data"
}
```

---

## 3. OUTPUT SPECIFICATIE

### Eindresultaat
- **Type:** [Bestand / API response / Database entry / Email]
- **Format:** [JSON / MP4 / PDF / etc.]
- **Locatie:** [Waar komt de output?]

### Vereiste output velden
| Veld | Type | Beschrijving |
|------|------|--------------|
| | | |

### Voorbeeld output
```json
{
  "success": true,
  "result": "..."
}
```

---

## 4. PROCESSING STAPPEN

### Stap 1: [Naam]
- **Input:** wat komt erin
- **Verwerking:** wat gebeurt er
- **Output:** wat komt eruit
- **Validatie:** hoe weten we dat het goed is

### Stap 2: [Naam]
- **Input:**
- **Verwerking:**
- **Output:**
- **Validatie:**

[Voeg meer stappen toe indien nodig]

---

## 5. ACCEPTATIECRITERIA

### Functioneel
- [ ] Criterium 1
- [ ] Criterium 2
- [ ] Criterium 3

### Technisch
- [ ] Alle nodes hebben id, name, type, typeVersion, position, parameters
- [ ] Connections verwijzen naar node NAMES (niet IDs)
- [ ] Geen hardcoded secrets
- [ ] Error handling aanwezig

### Kwaliteit
- [ ] Workflow is importeerbaar in n8n
- [ ] Validatie passed zonder errors
- [ ] Test execution succesvol

---

## 6. VERBODEN

**NOOIT doen:**
- [ ] Hardcoded API keys
- [ ] Nodes zonder error handling
- [ ] ...

---

## 7. VOORBEELDEN

### Goed voorbeeld
```json
{
  "name": "Voorbeeld Workflow",
  "nodes": [...]
}
```

### Fout voorbeeld (NIET doen)
```json
{
  "name": "Foute Workflow",
  "nodes": [...] // Mist X, Y, Z
}
```

---

## VERSIE HISTORIE

| Datum | Wijziging | Door |
|-------|-----------|------|
| [datum] | Initieel | AI Builder |
