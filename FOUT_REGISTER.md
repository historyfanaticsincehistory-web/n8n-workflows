# FOUT REGISTER

Dit document bevat ALLE fouten die zijn gemaakt en opgelost. Beide AI's lezen dit om dezelfde fouten te voorkomen.

---

## HOE DIT DOCUMENT TE GEBRUIKEN

1. **Builder AI** leest dit VOOR het bouwen van een workflow
2. **Reviewer AI** checkt of de workflow GEEN van deze fouten bevat
3. **Na elke fix** wordt een nieuwe entry toegevoegd
4. Dit document GROEIT met elke sessie

---

## FOUT CATEGORIEEN

### A. Structuur Fouten
Fouten in de basis workflow structuur (nodes, connections, settings)

### B. Node Configuratie Fouten
Fouten in specifieke node parameters en instellingen

### C. Data Flow Fouten
Fouten in hoe data tussen nodes stroomt

### D. Expression Fouten
Fouten in n8n expressions ({{ }})

### E. Logic Fouten
Fouten in de workflow logica (verkeerde volgorde, missende stappen)

---

## FOUTEN LOG

<!-- Nieuwe fouten worden hier toegevoegd -->

## [TEMPLATE] - Kopieer dit voor nieuwe fouten

**Symptoom:** [Wat zag je fout gaan?]

**Root Cause:** [Waarom ging het fout?]

**Fix:** [Hoe is het opgelost?]

**Nieuwe Audit Regel:** [Wat moet je voortaan checken?]

---

<!--
Voorbeeld entry:

## 2024-01-15 - Connections verwezen naar node IDs ipv names

**Symptoom:** Workflow importeerde maar connections werkten niet

**Root Cause:** Builder gebruikte node.id in connections ipv node.name

**Fix:** Connections moeten node names gebruiken, niet IDs:
```json
// FOUT
"connections": { "abc-123-uuid": {...} }

// GOED
"connections": { "HTTP Request": {...} }
```

**Nieuwe Audit Regel:** Check dat ALLE connection keys exact matchen met node.name velden

---
-->
