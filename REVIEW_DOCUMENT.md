# AI Feedback Loop Systeem - Review Document

**Doel:** Twee AI's (Claude + GPT) werken samen om n8n workflows te bouwen zonder menselijke tussenkomst.

**Review gevraagd:** Wat kan beter? Mis ik iets? Zijn de prompts effectief?

---

# 1. ARCHITECTUUR

```
┌─────────────────────────────────────────────────────────────┐
│                  AUTONOME FEEDBACK LOOP                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   📚 SHARED BRAIN (MD bestanden):                           │
│   ├── GEWENSTE_OUTPUT.md (wat moet de workflow doen)        │
│   ├── FOUT_REGISTER.md (geleerde lessen)                    │
│   └── AUDIT_HANDLEIDING.md (node specs + checks)            │
│                                                              │
│   ┌─────────────────────────────────────────────────────┐   │
│   │                    LOOP                              │   │
│   │                                                      │   │
│   │   1. 🔨 BUILDER (Claude)                            │   │
│   │      - Leest alle MD bestanden                      │   │
│   │      - Bouwt n8n workflow JSON                      │   │
│   │      - Verwerkt feedback van vorige iteratie        │   │
│   │              ↓                                       │   │
│   │   2. ✅ STRUCTUUR VALIDATIE                         │   │
│   │      - Check: nodes, connections, parameters        │   │
│   │      - Fail → terug naar Builder met errors         │   │
│   │              ↓                                       │   │
│   │   3. 🔍 REVIEWER (GPT)                              │   │
│   │      - Checkt tegen gewenste output                 │   │
│   │      - Geeft score 1-10                             │   │
│   │      - Geeft concrete feedback                      │   │
│   │              ↓                                       │   │
│   │   4. Score >= 8?                                    │   │
│   │      ├── JA → Opslaan + klaar                       │   │
│   │      └── NEE → Feedback naar Builder, herhaal       │   │
│   │                                                      │   │
│   │   Max 5 iteraties, daarna fout gelogd               │   │
│   └─────────────────────────────────────────────────────┘   │
│                                                              │
│   📝 NA SUCCES:                                             │
│   ├── Workflow opgeslagen als JSON                          │
│   └── Geleerde les toegevoegd aan FOUT_REGISTER.md          │
│                                                              │
│   ❌ NA FALEN:                                               │
│   └── Fout + feedback toegevoegd aan FOUT_REGISTER.md       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

# 2. BUILDER PROMPT (Claude)

Dit is de system prompt voor de AI die workflows bouwt:

```
Je bent een expert n8n workflow builder. Je bouwt VALIDE n8n workflow JSON.

## CONTEXT - LEES DIT EERST

### Gewenste Output Specificatie:
${context.gewensteOutput}

### Audit Regels (MOET je volgen):
${context.auditRegels}

### Bekende Fouten (NIET herhalen):
${context.foutRegister}

## REGELS

1. Output ALLEEN valide JSON - geen markdown, geen uitleg
2. Elke node MOET hebben: id, name, type, typeVersion, position, parameters
3. Gebruik UUIDs voor node IDs
4. Connections moeten verwijzen naar node NAMES (niet IDs)
5. Volg ALLE audit regels
6. Vermijd ALLE fouten uit het fout register

## OUTPUT FORMAT

{
  "name": "Workflow Name",
  "nodes": [...],
  "connections": {...},
  "settings": {}
}
```

**User prompt:**
```
Bouw een n8n workflow voor:

${request}

[Als er feedback is van vorige iteratie:]
## FEEDBACK VAN REVIEWER - PAS DIT AAN

${previousFeedback}

Bouw de workflow opnieuw met deze feedback verwerkt.
```

---

# 3. REVIEWER PROMPT (GPT)

Dit is de system prompt voor de AI die workflows reviewt:

```
Je bent een strikte n8n workflow reviewer. Je checkt of workflows voldoen aan de gewenste output.

## CONTEXT

### Gewenste Output (HIER MOET HET AAN VOLDOEN):
${context.gewensteOutput}

### Audit Regels (MOET VOLDOEN):
${context.auditRegels}

### Node Specificaties:
${context.nodeSpecs}

## JE TAAK

1. Check of de workflow de GEWENSTE OUTPUT kan produceren
2. Check ELKE node:
   - Heeft het de juiste functie voor de gewenste output?
   - Is de input correct?
   - Is de output wat we verwachten?
3. Check alle audit regels
4. Geef een score 1-10
5. Geef CONCRETE feedback als score < 8

## OUTPUT FORMAT (JSON)

{
  "score": 8,
  "passed": true,
  "summary": "Korte samenvatting",
  "node_reviews": [
    {
      "node": "Node Name",
      "functie_correct": true,
      "input_correct": true,
      "output_correct": true,
      "issues": []
    }
  ],
  "audit_violations": [],
  "concrete_feedback": "Als score < 8: EXACTE instructies wat te veranderen",
  "learned_lesson": "Wat we hiervan leren voor volgende keer"
}
```

---

# 4. GEWENSTE_OUTPUT.md TEMPLATE STRUCTUUR

Het document dat beide AI's lezen heeft deze structuur:

```
# DEEL A: GEWENSTE OUTPUT (EXTREEM GEDETAILLEERD)
├── A.1 Wat is de gewenste output?
│   ├── Specificaties tabel (type, format, locatie)
│   ├── MOET bevatten lijst
│   └── MAG NIET bevatten lijst
├── A.2 Hoe ziet de perfecte output eruit?
│   ├── Stap-voor-stap breakdown
│   └── Voorbeeld perfecte output (JSON)
└── A.3 Feedback Loop diagram

# DEEL B: NODE SPECIFICATIES (COMPLEET MET CODE)
├── B.1 Hoe dit deel te lezen
└── B.2-N Per fase:
    └── Per node:
        ├── FUNCTIE: wat doet het
        ├── INPUT: exact wat erin komt
        ├── CODE/INVULLING: volledige configuratie
        ├── OUTPUT: exact wat eruit komt
        ├── AUDIT: hoe te controleren
        └── ROOT CAUSE: waar te zoeken bij falen

# DEEL C: AUDIT & DEBUG SYSTEEM
├── C.1 Audit Checklist (alle checks)
├── C.2 Root Cause Zoeken (stap-voor-stap)
└── C.3 Debug Commands

# DEEL D: FOUT REGISTER (LESSEN UIT FOUTEN)
├── D.1 Fout Register tabel
├── D.2 Structurele verbeteringen
└── D.3 Preventieve checks

# DEEL E: AI TRAINING INSTRUCTIES
├── E.1 Hoe AI dit document moet gebruiken
├── E.2 Kritieke waarschuwingen
├── E.3 Builder AI instructies
└── E.4 Reviewer AI instructies (scoring criteria)
```

---

# 5. FOUT_REGISTER.md STRUCTUUR

Elke fout wordt gelogd met:

```markdown
## [DATUM] - [Titel van de fout]

**Symptoom:** [Wat zag je fout gaan?]

**Root Cause:** [Waarom ging het fout?]

**Fix:** [Hoe is het opgelost?]

**Nieuwe Audit Regel:** [Wat moet je voortaan checken?]
```

De AI's lezen dit register en mogen dezelfde fouten NIET herhalen.

---

# 6. VALIDATIE FLOW

```javascript
// Structuur validatie voordat Reviewer checkt:

function validateWorkflowN8N(workflow) {
  const errors = [];

  // Check basis structuur
  if (!workflow.nodes || !Array.isArray(workflow.nodes)) {
    errors.push('Workflow mist nodes array');
  }
  if (!workflow.connections || typeof workflow.connections !== 'object') {
    errors.push('Workflow mist connections object');
  }

  // Check elke node
  for (const node of (workflow.nodes || [])) {
    if (!node.id) errors.push(`Node "${node.name}" mist id`);
    if (!node.name) errors.push(`Node mist name`);
    if (!node.type) errors.push(`Node "${node.name}" mist type`);
    if (!node.position) errors.push(`Node "${node.name}" mist position`);
    if (node.parameters === undefined) errors.push(`Node "${node.name}" mist parameters`);
  }

  return {
    valid: errors.length === 0,
    errors: errors
  };
}
```

---

# 7. LOOP CONFIGURATIE

```javascript
const CONFIG = {
  MAX_ITERATIONS: 5,      // Max pogingen voordat we opgeven
  MIN_SCORE_TO_PASS: 8,   // Minimale score om te slagen
};
```

---

# 8. VRAGEN VOOR REVIEWER

1. **Architectuur:** Is de feedback loop goed opgezet? Mis ik stappen?

2. **Builder Prompt:** Is de prompt duidelijk genoeg? Moet ik meer/minder context meegeven?

3. **Reviewer Prompt:** Zijn de scoring criteria helder? Moet de reviewer meer/andere dingen checken?

4. **Document Structuur:** Is de GEWENSTE_OUTPUT.md template compleet? Welke secties ontbreken?

5. **Fout Register:** Is dit een effectieve manier om te leren van fouten?

6. **Validatie:** Welke checks ontbreken in de structuur validatie?

7. **Iteraties:** Is 5 iteraties genoeg? Te veel? Te weinig?

8. **Score Threshold:** Is 8/10 een goede grens? Waarom wel/niet?

9. **Wat kan beter?** Algemene verbeterpunten die je ziet?

10. **Risico's:** Welke edge cases of problemen zie je die ik mis?

---

# 9. VOORBEELD WORKFLOW REQUEST

Input die een gebruiker zou geven:

```
"Maak een workflow die:
1. Webhook ontvangt met klantdata
2. Data valideert
3. Naar Slack stuurt als urgent
4. In Google Sheet logt"
```

De AI's moeten dan:
- Builder: Bouwt complete n8n workflow JSON
- Reviewer: Checkt of alle 4 stappen correct zijn geïmplementeerd
- Loop: Herhaalt tot score >= 8

---

**Einde Review Document**

Graag feedback op alle bovenstaande punten. Wees kritisch - het doel is om dit systeem te verbeteren voordat we het in productie gebruiken.
