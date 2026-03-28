# NVG Clean - Audit & Debug Handleiding

**LEVEND DOCUMENT - Wordt bijgewerkt na elke fout**
**Workflow ID:** wp6KGQcuBad98CIC
**Laatste update:** 2026-03-28

---

# DEEL A: GEWENSTE OUTPUT (EXTREEM GEDETAILLEERD)

## A.1 Wat is de gewenste output?

### Het eindproduct is een MP4 video met de volgende eigenschappen:

| Aspect | Specificatie | Waarom |
|--------|--------------|--------|
| **Formaat** | MP4, H.264 codec | Universeel afspeelbaar |
| **Resolutie** | 1280x720 (720p) | Balans tussen kwaliteit en bestandsgrootte |
| **Framerate** | 16-24 fps | Vloeiende bewegingen |
| **Audio** | AAC, 22050 Hz, mono | Duidelijke spraak |
| **Taal** | Engels (en_US) | Piper TTS model |
| **Lengte** | 60-420 seconden | Afhankelijk van input duur_seconds |

### De video MOET bevatten:

1. **BEWEGENDE beelden** - GEEN stilstaande foto's met zoompan
2. **TWEE mannelijke worstelaars** - consistent dezelfde personen in alle shots
3. **Realistische bewegingen** - vloeiend, geen schokkend beeld
4. **Voiceover** - Engels, vertelt het verhaal
5. **Sync** - video past bij wat de audio zegt

### De video MAG NIET bevatten:

1. Vrouwen of vrouwelijke personages
2. Meer dan 2 personen zichtbaar
3. Fantasy/sci-fi elementen
4. Buitenscènes (alleen indoor gymnasium)
5. Niet-Engelse tekst of spraak
6. Stilstaande beelden
7. Schuddend/trillend beeld

---

## A.2 Hoe ziet de perfecte output eruit?

### Scene-voor-scene breakdown:

```
SCENE 1 (Intro, 15-25 sec):
├── Video: Twee worstelaars staan tegenover elkaar op de mat
│   - Worstelaar A: [specifieke traits uit LLM - bv. "red singlet, short brown hair"]
│   - Worstelaar B: [specifieke traits uit LLM - bv. "blue singlet, black hair"]
│   - Setting: Indoor gymnasium, wrestling mat
│   - Beweging: Subtiele bewegingen, spanning opbouwen
├── Audio: Verteller introduceert de scene
│   - "The tension in the arena is palpable..."
└── Sync: Audio beschrijft wat we zien

SCENE 2-N (Parts, elk 15-25 sec):
├── Video: Actie die past bij de narration
│   - DEZELFDE worstelaars (character consistency via IPAdapter)
│   - Dynamische bewegingen (grappling, takedowns)
│   - Camera: static of slow zoom
├── Audio: Verteller beschrijft de actie
└── Sync: Perfect - wat we horen is wat we zien

FINALE (Outro, 15-25 sec):
├── Video: Climax van het gevecht
├── Audio: Conclusie van het verhaal
└── Fade out: 0.5 sec fade in/out per scene
```

---

## A.3 Feedback Loop - Hoe wordt gewenste output verbeterd?

```
┌─────────────────────────────────────────────────────────────┐
│                    FEEDBACK LOOP                             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. VIDEO BEKIJKEN                                          │
│     ↓                                                        │
│  2. CHECKLIST DOORLOPEN:                                    │
│     □ Zijn er 2 mannelijke worstelaars?                     │
│     □ Zijn het DEZELFDE personen in alle shots?             │
│     □ Bewegen ze realistisch?                               │
│     □ Is de audio Engels?                                   │
│     □ Past de video bij de audio?                           │
│     □ Geen stilstaande beelden?                             │
│     □ Geen extra personen zichtbaar?                        │
│     ↓                                                        │
│  3. PROBLEEM GEÏDENTIFICEERD?                               │
│     ↓                                                        │
│  4. ROOT CAUSE ZOEKEN (zie Deel C)                          │
│     ↓                                                        │
│  5. FIX DOCUMENTEREN IN DIT DOCUMENT                        │
│     ↓                                                        │
│  6. NIEUWE REGEL TOEVOEGEN AAN AUDIT                        │
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

## B.2 FASE 1: TRIGGERS & PREFLIGHT

### NODE: Webhook Trigger
```
ID: b1c2d3e4-0042-4000-8000-000000000042
TYPE: webhook
```

**FUNCTIE:**
Start de workflow via een HTTP POST request. Dit is het startpunt.

**INPUT:**
```
POST http://localhost:5678/webhook/nvg-clean-trigger-001
Content-Type: application/json
Body: {} (leeg of optionele parameters)
```

**INVULLING:**
```json
{
  "path": "nvg-clean-trigger-001",
  "httpMethod": "POST"
}
```

**OUTPUT:**
```json
{
  "headers": { ... },
  "params": {},
  "query": {},
  "body": {}
}
```

**AUDIT:**
1. Check of webhook actief is: `curl -X POST http://localhost:5678/webhook/nvg-clean-trigger-001`
2. Response moet 200 OK zijn
3. Workflow moet starten (check executions)

**ROOT CAUSE bij falen:**
- Webhook niet actief → Workflow is niet active
- 404 error → Webhook path is verkeerd
- Timeout → n8n container draait niet

---

### NODE: Preflight: Check ComfyUI
```
ID: preflight-comfyui-001
TYPE: httpRequest
```

**FUNCTIE:**
Controleer of ComfyUI draait voordat we beginnen met image generatie.

**INPUT:**
Trigger event van Webhook

**INVULLING:**
```json
{
  "method": "GET",
  "url": "http://host.docker.internal:8188/system_stats"
}
```

**OUTPUT (success):**
```json
{
  "system": {
    "os": "nt",
    "python_version": "3.10.x",
    "comfyui_version": "0.3.x",
    ...
  },
  "devices": [...]
}
```

**OUTPUT (fail):**
```
Error: connect ECONNREFUSED
```

**AUDIT:**
```bash
curl http://localhost:8188/system_stats
# Moet JSON response geven met comfyui_version
```

**ROOT CAUSE bij falen:**
- ECONNREFUSED → ComfyUI is niet gestart
- Timeout → ComfyUI is aan het laden
- 500 error → ComfyUI heeft interne fout

---

### NODE: Preflight: Validate Services
```
ID: preflight-validate-001
TYPE: code
```

**FUNCTIE:**
Valideer dat BEIDE services (ComfyUI + Ollama) correct reageren.

**INPUT:**
Merged responses van ComfyUI en Ollama checks

**CODE:**
```javascript
// Validate that both ComfyUI and Ollama are online
const items = $input.all();
const errors = [];

// Find ComfyUI result (has system.comfyui_version)
const comfyResult = items.find(item => item.json.system && item.json.system.comfyui_version);

// Find Ollama result (has models array)
const ollamaResult = items.find(item => item.json.models && Array.isArray(item.json.models));

if (!comfyResult) {
  errors.push('ComfyUI is offline or not responding');
}

if (!ollamaResult) {
  errors.push('Ollama is offline or not responding');
}

// Check if required model is available
if (ollamaResult) {
  const models = ollamaResult.json.models || [];
  const hasModel = models.some(m => m.name.includes('dolphin-llama3'));
  if (!hasModel) {
    errors.push('Required model dolphin-llama3:8b not found in Ollama');
  }
}

if (errors.length > 0) {
  throw new Error('Preflight failed: ' + errors.join(', '));
}

return [{ json: { preflight_passed: true, timestamp: Date.now() } }];
```

**OUTPUT (success):**
```json
{ "preflight_passed": true, "timestamp": 1711612345678 }
```

**OUTPUT (fail):**
```
Error: Preflight failed: ComfyUI is offline or not responding
```

**AUDIT:**
1. Check `preflight_passed: true` in output
2. Check dat geen errors in console
3. Check dat dolphin-llama3:8b model aanwezig is

**ROOT CAUSE bij falen:**
- "ComfyUI is offline" → Start ComfyUI
- "Ollama is offline" → Start Ollama
- "Model not found" → `ollama pull dolphin-llama3:8b`

---

## B.3 FASE 2: DATA INPUT

### NODE: Google Sheets: Input
```
ID: 8883af87-3ec8-4802-b3e9-3be8550e778a
TYPE: googleSheets
```

**FUNCTIE:**
Lees verhalen uit de Google Sheet. Dit is de INPUT voor de hele pipeline.

**INPUT:**
Preflight passed signal

**INVULLING:**
```json
{
  "operation": "read",
  "documentId": {
    "mode": "url",
    "value": "https://docs.google.com/spreadsheets/d/1ZZbyrBKL80E3h2RMhvgYY7tGJCN8UI7vORUSb6vxBFU"
  },
  "sheetName": {
    "mode": "name",
    "value": "Blad1"
  },
  "options": {
    "range": "A:F"  // ⚠️ KRITIEK: MOET AANWEZIG ZIJN
  }
}
```

**OUTPUT:**
```json
[
  {
    "verhaal_beschrijving": "Two wrestlers competing in a championship match",
    "thema": "sport",
    "duur_seconds": "60",
    "status": "new",
    "row_number": 2
  },
  {
    "verhaal_beschrijving": "An intense wrestling training session",
    "thema": "training",
    "duur_seconds": "120",
    "status": "done",
    "row_number": 3
  }
]
```

**AUDIT:**
1. Check dat `options.range` aanwezig is
2. Check dat alle kolommen worden geladen
3. Check dat row_number automatisch wordt toegevoegd

**ROOT CAUSE bij falen:**
- "Missing required parameter: range" → Voeg `options.range: "A:F"` toe
- "Authentication failed" → Google credentials verlopen
- Lege output → Sheet is leeg of verkeerde sheet naam

**⚠️ BEKENDE FOUT (2026-03-28):**
Range parameter ontbrak. Dit veroorzaakte `ERROR_IN_OUTPUT_NODE`.
FIX: `n8n_update_partial_workflow` met `options.range: "A:F"`

---

### NODE: Filter: status != done
```
ID: filter-status-001
TYPE: filter
```

**FUNCTIE:**
Filter alleen rijen die nog verwerkt moeten worden (status != done/blocked/processing).

**INPUT:**
Alle rijen uit Google Sheet

**INVULLING:**
```json
{
  "conditions": {
    "options": { "caseSensitive": true, "leftValue": "" },
    "combinator": "and",
    "conditions": [
      {
        "id": "filter-status-condition",
        "leftValue": "={{ $json.status }}",
        "rightValue": "done",
        "operator": { "type": "string", "operation": "notEquals" }
      },
      {
        "id": "filter-status-blocked",
        "leftValue": "={{ $json.status }}",
        "rightValue": "blocked",
        "operator": { "type": "string", "operation": "notEquals" }
      },
      {
        "id": "filter-status-processing",
        "leftValue": "={{ $json.status }}",
        "rightValue": "processing",
        "operator": { "type": "string", "operation": "notEquals" }
      }
    ]
  }
}
```

**OUTPUT:**
Alleen rijen waar status = "new" of "error"

**AUDIT:**
1. Check dat gefilterde items status != "done"
2. Check dat geen "blocked" of "processing" items doorgelaten worden

**ROOT CAUSE bij falen:**
- Alle items gefilterd → Alle rijen al verwerkt
- Verkeerde items doorgelaten → Filter condities incorrect

---

### NODE: Limit 1 Row
```
ID: b1c2d3e4-0005-4000-8000-000000000005
TYPE: limit
```

**FUNCTIE:**
Pak precies 1 rij om te verwerken. Voorkomt dat we meerdere video's tegelijk proberen.

**INPUT:**
Gefilterde rijen

**INVULLING:**
```json
{
  "maxItems": 1
}
```

**OUTPUT:**
Precies 1 item:
```json
{
  "verhaal_beschrijving": "Two wrestlers competing...",
  "thema": "sport",
  "duur_seconds": "60",
  "status": "new",
  "row_number": 2
}
```

**AUDIT:**
1. Output moet precies 1 item zijn
2. Check dat dit het eerste beschikbare item is

---

## B.4 FASE 3: CONTENT GENERATIE (LLM)

### NODE: Code: Prepare LLM
```
ID: b1c2d3e4-0006-4000-8000-000000000006
TYPE: code
```

**FUNCTIE:**
Bouw de prompt voor het eerste LLM call dat:
1. Twee unieke worstelaar karakters genereert
2. Het volledige script schrijft

**INPUT:**
```json
{
  "verhaal_beschrijving": "Two wrestlers competing in a championship match",
  "thema": "sport",
  "duur_seconds": "60",
  "status": "new",
  "row_number": 2
}
```

**CODE (VOLLEDIG):**
```javascript
// Code: Prepare LLM - Dynamic Character Generation
// Generates wrestler identities from verhaal_beschrijving
// Then creates the wrestling narrative with those characters

const row = $input.first().json;

// Get input from sheet
const verhaalBeschrijving = row.verhaal_beschrijving || 'two wrestlers competing';
const thema = row.thema || 'sport';
const duurSeconds = parseInt(row.duur_seconds) || 60;

// Calculate word target (2.5 words per second for narration)
const wordTarget = Math.round(duurSeconds * 2.5);

// Build prompt that generates BOTH characters AND script
const prompt = `You are a creative writer. Based on the description below, create TWO unique characters and write an immersive first-person wrestling narrative.

=== INPUT ===
Description: ${verhaalBeschrijving}
Theme: ${thema}
Duration: approximately ${duurSeconds} seconds of narration

=== YOUR TASK ===

1. FIRST, create TWO unique wrestler characters with:
   - A name (realistic, fitting the theme)
   - Physical appearance (build, hair, singlet color, distinctive features)
   - Personality hint (aggressive, calm, cocky, etc.)

2. THEN, write the wrestling narrative from Character A's perspective (first person "I")

=== OUTPUT FORMAT ===

You MUST output valid JSON in this EXACT format:

{
  "wrestler_a": {
    "name": "Jake Thompson",
    "traits": "muscular male wrestler in red singlet, short brown hair, athletic build, determined expression",
    "personality": "focused and determined"
  },
  "wrestler_b": {
    "name": "Marcus Chen",
    "traits": "tall powerful male wrestler in blue singlet, black hair in short cut, broad shoulders, intimidating presence",
    "personality": "aggressive and cocky"
  },
  "location": "indoor gymnasium with wrestling mat",
  "script": "The fluorescent lights cast harsh shadows across the mat as I step forward..."
}

=== REQUIREMENTS ===

1. ALL OUTPUT MUST BE IN ENGLISH
2. Characters must be MALE wrestlers
3. Give them DISTINCT appearances (different hair, singlet colors, builds)
4. The script must be at least ${wordTarget} words
5. Script is FIRST PERSON from wrestler_a's perspective

=== FORBIDDEN ===
- No women or female characters
- No fantasy/sci-fi elements
- No outdoor scenes
- No non-English text

Output the JSON now:`;

return [{
  json: {
    topic_id: `topic_${Date.now()}`,
    row_data: row,
    verhaal_beschrijving: verhaalBeschrijving,
    thema: thema,
    duur_seconds: duurSeconds,
    word_target: wordTarget,
    ollama_body: {
      model: 'dolphin-llama3:8b',
      prompt: prompt,
      stream: false,
      options: {
        temperature: 0.7,
        num_predict: 8000
      }
    },
    _debug_prompt_llm1: prompt
  }
}];
```

**OUTPUT:**
```json
{
  "topic_id": "topic_1711612345678",
  "row_data": { ... },
  "verhaal_beschrijving": "Two wrestlers competing...",
  "thema": "sport",
  "duur_seconds": 60,
  "word_target": 150,
  "ollama_body": {
    "model": "dolphin-llama3:8b",
    "prompt": "You are a creative writer...",
    "stream": false,
    "options": { "temperature": 0.7, "num_predict": 8000 }
  },
  "_debug_prompt_llm1": "You are a creative writer..."
}
```

**AUDIT:**
1. Check dat `ollama_body.model` = "dolphin-llama3:8b"
2. Check dat prompt ENGLISH bevat
3. Check dat `word_target` correct is berekend
4. Check dat `_debug_prompt_llm1` de volledige prompt bevat

**ROOT CAUSE bij falen:**
- LLM geeft Indonesisch → Prompt bevat geen "ENGLISH ONLY" instructie
- Karakters niet consistent → traits niet expliciet genoeg
- Script te kort → word_target te laag

---

### NODE: Ollama: Generate Script
```
ID: b1c2d3e4-0008-4000-8000-000000000008
TYPE: httpRequest
```

**FUNCTIE:**
Stuur prompt naar Ollama en krijg JSON response met karakters + script.

**INPUT:**
```json
{
  "ollama_body": {
    "model": "dolphin-llama3:8b",
    "prompt": "You are a creative writer...",
    "stream": false,
    "options": { "temperature": 0.7, "num_predict": 8000 }
  }
}
```

**INVULLING:**
```json
{
  "method": "POST",
  "url": "http://host.docker.internal:11434/api/generate",
  "sendBody": true,
  "bodyType": "json",
  "specifyBody": "json",
  "jsonBody": "={{ $json.ollama_body }}"
}
```

**OUTPUT (success):**
```json
{
  "response": "{\n  \"wrestler_a\": {\n    \"name\": \"Jake Thompson\",\n    \"traits\": \"muscular male wrestler in red singlet...\",\n    ...\n  },\n  \"wrestler_b\": {...},\n  \"location\": \"indoor gymnasium\",\n  \"script\": \"The fluorescent lights...\"\n}",
  "done": true,
  "total_duration": 45000000000
}
```

**AUDIT:**
1. Check dat `response` valid JSON bevat
2. Check dat `done: true`
3. Check dat response Engels is
4. Check dat beide wrestlers traits hebben

**ROOT CAUSE bij falen:**
- Timeout → Ollama overbelast of model te groot
- Invalid JSON → LLM genereerde geen valid JSON
- Indonesisch → Prompt instructies niet sterk genoeg

---

### NODE: Code: Parse Parts
```
ID: b1c2d3e4-0013-4000-8000-000000000013
TYPE: code
```

**FUNCTIE:**
Parse de LLM response naar structured parts met:
- voice_text (voor TTS)
- image_prompt (voor ComfyUI txt2img)
- video_prompt (voor ComfyUI i2v)
- Character traits passthrough

**INPUT:**
Raw LLM response met JSON array van parts

**CODE (KRITIEKE DELEN):**
```javascript
// Parse parts from LLM response with robust error handling
const item = $input.first();
let response = item.json.response || '';

// Get workflow static data to store prompts
const staticData = $getWorkflowStaticData('global');
staticData.image_prompts = [];

// GET CHARACTER TRAITS FROM UPSTREAM
let wrestlerATraits = '';
let wrestlerBTraits = '';
try {
  const prevData = $('Code: Prep LLM3').first().json;
  wrestlerA = prevData.wrestler_a || 'Wrestler A';
  wrestlerB = prevData.wrestler_b || 'Wrestler B';
  wrestlerATraits = prevData.wrestler_a_traits || 'muscular male wrestler in red singlet';
  wrestlerBTraits = prevData.wrestler_b_traits || 'muscular male wrestler in blue singlet';
  location = prevData.location || 'indoor gymnasium';
} catch (e) {
  console.log('Could not load traits from upstream, using defaults');
}

// Parse JSON with multiple fallbacks
// ... (robust parsing logic)

// GENERATE VIDEO PROMPT with character traits
const videoPrompt = `ONLY two people visible, ${wrestlerATraits} wrestling with ${wrestlerBTraits}, ${location}, athletic wrestling movements, smooth natural motion, professional sports footage`;

// Store in static data for downstream nodes
staticData.image_prompts.push({
  part_id: 'part' + partIndex,
  prompt: imagePrompt,
  video_prompt: videoPrompt,
  output_prefix: 'part' + partIndex + '_img1'
});

// CRITICAL: Store total_parts for Final Concat
staticData.total_parts = partsData.length;
```

**OUTPUT:**
Array van parts:
```json
[
  {
    "part_index": 1,
    "voice_text": "The tension in the arena is palpable...",
    "image_prompt": "muscular male wrestler in red singlet facing opponent...",
    "video_prompt": "ONLY two people visible, muscular male wrestler in red singlet wrestling with...",
    "wrestler_a_traits": "muscular male wrestler in red singlet...",
    "wrestler_b_traits": "tall powerful male wrestler in blue singlet...",
    "location": "indoor gymnasium",
    "total_parts": 5
  },
  // ... more parts
]
```

**AUDIT:**
1. Check dat `staticData.total_parts` correct is gezet
2. Check dat elke part `video_prompt` heeft met character traits
3. Check dat `wrestler_a_traits` en `wrestler_b_traits` aanwezig zijn
4. Check dat `staticData.image_prompts` gevuld is

**ROOT CAUSE bij falen:**
- "No parts parsed" → LLM gaf geen valid JSON array
- Video_prompt leeg → Character traits niet doorgestuurd van upstream
- Parts missen → JSON truncated of malformed

---

## B.5 FASE 4: AUDIO GENERATIE

### NODE: HTTP: Piper TTS
```
ID: piper-http-001
TYPE: httpRequest
```

**FUNCTIE:**
Genereer spraak audio via Piper TTS server (lokaal op Windows).

**INPUT:**
```json
{
  "text": "The tension in the arena is palpable...",
  "audio_path": "/home/node/.n8n-files/output/part1.wav"
}
```

**INVULLING:**
```json
{
  "method": "POST",
  "url": "http://host.docker.internal:5680/tts",
  "sendBody": true,
  "bodyType": "json",
  "jsonBody": {
    "text": "={{ $json.text }}",
    "voice": "en_US-lessac-high"
  },
  "responseFormat": "file"
}
```

**OUTPUT:**
Binary WAV audio data

**AUDIT:**
1. Check dat audio file bestaat: `ls /home/node/.n8n-files/output/part*.wav`
2. Check audio duration: `ffprobe -v error -show_entries format=duration partX.wav`
3. Check dat stem Engels is (niet Indonesisch!)

**ROOT CAUSE bij falen:**
- Timeout → Piper server niet gestart
- ECONNREFUSED → Server draait niet op poort 5680
- Indonesische stem → Verkeerd voice model

**⚠️ BEKENDE FOUT:**
Piper Docker binary werkt niet op Alpine (glibc vs musl).
OPLOSSING: Windows HTTP server op host.docker.internal:5680

---

## B.6 FASE 5: IMAGE GENERATIE (ComfyUI)

### NODE: Code: ComfyUI Payload
```
ID: b1c2d3e4-0020-4000-8000-000000000020
TYPE: code
```

**FUNCTIE:**
Bouw ComfyUI workflow JSON voor text-to-image generatie.
- Part 1: txt2img reference image (saves as reference_hero)
- Part 2+: IPAdapter met reference image voor character consistency

**INPUT:**
```json
{
  "part_index": 1,
  "image_prompt": "muscular male wrestler in red singlet...",
  "wrestler_a_traits": "muscular male wrestler in red singlet...",
  "wrestler_b_traits": "tall powerful male wrestler in blue singlet..."
}
```

**CODE (KRITIEKE DELEN):**
```javascript
// PART 1: Generate reference image
if (isFirstPart) {
  outputPrefix = 'reference_hero';

  const referencePrompt = `${wrestlerATraits} and ${wrestlerBTraits}, ${location}, wrestling mat, both standing facing camera, neutral pose, full body visible, clear features, ${qualityTags}`;

  workflow = {
    '1': { class_type: 'CheckpointLoaderSimple', inputs: { ckpt_name: 'ponyDiffusionV6XL.safetensors' }},
    '4': { class_type: 'CLIPTextEncode', inputs: { text: referencePrompt, clip: ['1', 1] }},
    '5': { class_type: 'CLIPTextEncode', inputs: { text: negPrompt, clip: ['1', 1] }},
    '6': { class_type: 'EmptyLatentImage', inputs: { width: 1024, height: 1024, batch_size: 1 }},
    '7': { class_type: 'KSampler', inputs: {
      model: ['1', 0], positive: ['4', 0], negative: ['5', 0], latent_image: ['6', 0],
      seed: seedImage, steps: 30, cfg: 7.5, sampler_name: 'dpmpp_2m', scheduler: 'karras', denoise: 1.0
    }},
    '8': { class_type: 'VAEDecode', inputs: { samples: ['7', 0], vae: ['1', 2] }},
    '9': { class_type: 'SaveImage', inputs: { filename_prefix: outputPrefix, images: ['8', 0] }}
  };
}
// PART 2+: IPAdapter with reference
else {
  workflow = {
    // ... IPAdapter workflow met reference_hero_00001_.png
  };
}
```

**OUTPUT:**
```json
{
  "output_prefix": "part1_img1",
  "comfyui_payload": {
    "prompt": { /* ComfyUI workflow nodes */ }
  },
  "reference_image_path": "C:/AI/ComfyUI_windows_portable/ComfyUI/output/reference_hero_00001_.png",
  "_DEBUG_SEED": 777777,
  "_DEBUG_METHOD": "txt2img-reference",
  "_DEBUG_WRESTLER_A": "muscular male wrestler in red singlet...",
  "_DEBUG_WRESTLER_B": "tall powerful male wrestler in blue singlet..."
}
```

**AUDIT:**
1. Check `_DEBUG_METHOD`: Part 1 = "txt2img-reference", Part 2+ = "ipadapter-reference"
2. Check `_DEBUG_WRESTLER_A` en `_DEBUG_WRESTLER_B` zijn gevuld
3. Check dat `reference_image_path` correct is
4. Check dat workflow alle nodes bevat

**ROOT CAUSE bij falen:**
- Character inconsistency → IPAdapter niet gebruikt of reference image ontbreekt
- Lege prompt → wrestler_a_traits niet doorgestuurd
- ComfyUI error → Workflow nodes incorrect verbonden

---

## B.7 FASE 6: IMAGE-TO-VIDEO (ComfyUI)

### NODE: Code: ComfyUI i2v Payload
```
ID: c1c2d3e4-a001-4000-8000-000000000001
TYPE: code
```

**FUNCTIE:**
Bouw ComfyUI workflow voor image-to-video met Wan model.
KRITIEK: Alle parts gebruiken DEZELFDE seed voor character consistency.

**INPUT:**
```json
{
  "part_index": 2,
  "comfyui_image_path": "/path/to/part2_img1_00001_.png",
  "video_prompt": "ONLY two people visible, muscular male wrestler...",
  "wrestler_a_traits": "muscular male wrestler in red singlet...",
  "wrestler_b_traits": "tall powerful male wrestler in blue singlet..."
}
```

**CODE (KRITIEKE DELEN):**
```javascript
// SAME seed for ALL i2v parts - critical for character consistency
const BASE_VIDEO_SEED = 888888;
const seedVideo = BASE_VIDEO_SEED;  // ⚠️ NIET partIndex erbij optellen!

// USE DYNAMIC VIDEO PROMPT from Parse Parts
const videoPrompt = item.video_prompt ||
  `ONLY two people visible, ${wrestlerATraits} wrestling with ${wrestlerBTraits}...`;

// Negative prompt - strict people count
const negativePrompt = 'three people, third person, crowd, audience, spectators, referee, multiple people, group, solo, single person...';

const i2vPayload = {
  prompt: {
    '1': { class_type: 'UNETLoader', inputs: { unet_name: 'wan2.1_fun_inp_1.3B_bf16.safetensors' }},
    // ... rest of Wan workflow
    '11': { class_type: 'KSampler', inputs: {
      seed: seedVideo,  // ⚠️ ZELFDE seed voor alle parts!
      steps: 30, cfg: 8.0, sampler_name: 'euler', scheduler: 'normal', denoise: 1.0
    }},
    '13': { class_type: 'VHS_VideoCombine', inputs: {
      frame_rate: 16, filename_prefix: i2vPrefix, format: 'video/h264-mp4'
    }}
  }
};
```

**OUTPUT:**
```json
{
  "i2v_prefix": "i2v_part2",
  "i2v_payload": { "prompt": { /* Wan workflow */ }},
  "_DEBUG_APPROACH": "NATIVE Wan v4 + DYNAMIC CHARACTER PROMPTS",
  "_DEBUG_VIDEO_PROMPT": "ONLY two people visible, muscular male wrestler...",
  "_DEBUG_SEED": 888888
}
```

**AUDIT:**
1. Check `_DEBUG_SEED` = 888888 voor ALLE parts (niet variërend!)
2. Check `_DEBUG_VIDEO_PROMPT` bevat character traits
3. Check dat negative prompt "three people" bevat
4. Check `frame_rate` = 16

**ROOT CAUSE bij falen:**
- Characters zien er anders uit per video → Seed varieerde per part
- 3+ personen zichtbaar → Negative prompt niet sterk genoeg
- Schokkende video → frame_rate te laag of steps te weinig

---

## B.8 FASE 7: VIDEO ASSEMBLY (FFmpeg)

### NODE: Code: Final Concat
```
ID: b1c2d3e4-0032-4000-8000-000000000032
TYPE: code
```

**FUNCTIE:**
Concateneer alle part videos tot één finale video.

**INPUT:**
Array van verwerkte parts

**CODE:**
```javascript
const staticData = $getWorkflowStaticData('global');
const totalParts = staticData.total_parts || 10;

// Create file entries for concat
const fileEntries = [];
for (let i = 1; i <= totalParts; i++) {
  fileEntries.push("file '/home/node/.n8n-files/output/nv_part" + i + "_final.mp4'");
}

const filelistPath = '/home/node/.n8n-files/output/nv_filelist.txt';
const finalOutput = `/home/node/.n8n-files/output/nv_final_video_${Date.now()}.mp4`;

// printf met proper escaping
const cmd = `printf '%s\\n' ${fileEntries.map(e => "'" + e + "'").join(' ')} > ${filelistPath} && ffmpeg -y -f concat -safe 0 -i ${filelistPath} -c copy ${finalOutput}`;

return [{ json: { final_command: cmd, output_file: finalOutput, total_parts: totalParts }}];
```

**OUTPUT:**
```json
{
  "final_command": "printf '%s\\n' 'file ...' > filelist.txt && ffmpeg -y -f concat...",
  "output_file": "/home/node/.n8n-files/output/nv_final_video_1711612345678.mp4",
  "total_parts": 5
}
```

**AUDIT:**
1. Check dat `total_parts` correct is (komt uit staticData)
2. Check dat alle part files bestaan VOORDAT concat
3. Check dat output file aangemaakt wordt

**ROOT CAUSE bij falen:**
- "No such file" → Part video's niet allemaal gegenereerd
- total_parts = 10 (default) → staticData.total_parts niet gezet in Parse Parts
- FFmpeg error → Codec mismatch tussen parts

---

# DEEL C: AUDIT & DEBUG SYSTEEM

## C.1 De Audit Checklist

```
┌─────────────────────────────────────────────────────────────┐
│                    AUDIT CHECKLIST                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  □ 1. PREFLIGHT                                             │
│    □ ComfyUI online? (8188/system_stats)                    │
│    □ Ollama online? (11434/api/tags)                        │
│    □ dolphin-llama3:8b model aanwezig?                      │
│    □ Piper TTS online? (5680/tts)                           │
│    □ FFmpeg server online? (5681/exec)                      │
│                                                              │
│  □ 2. INPUT                                                 │
│    □ Google Sheet range parameter aanwezig?                 │
│    □ Minimaal 1 rij met status != "done"?                   │
│    □ verhaal_beschrijving niet leeg?                        │
│                                                              │
│  □ 3. LLM OUTPUT                                            │
│    □ Response is valid JSON?                                │
│    □ wrestler_a en wrestler_b hebben traits?                │
│    □ Script is Engels?                                      │
│    □ Geen Indonesische tekst?                               │
│                                                              │
│  □ 4. PARTS                                                 │
│    □ total_parts correct gezet in staticData?               │
│    □ Elke part heeft video_prompt met character traits?     │
│    □ Elke part heeft voice_text?                            │
│                                                              │
│  □ 5. AUDIO                                                 │
│    □ Alle part*.wav files bestaan?                          │
│    □ Audio is Engels (niet Indonesisch)?                    │
│    □ Audio duration > 0?                                    │
│                                                              │
│  □ 6. IMAGES                                                │
│    □ reference_hero_00001_.png bestaat?                     │
│    □ Alle partX_img1_*.png files bestaan?                   │
│    □ Images tonen 2 mannelijke worstelaars?                 │
│                                                              │
│  □ 7. VIDEOS (i2v)                                          │
│    □ Alle i2v_partX_*.mp4 files bestaan?                    │
│    □ Video's tonen beweging (niet statisch)?                │
│    □ Dezelfde karakters in alle videos?                     │
│    □ Seed = 888888 voor alle i2v calls?                     │
│                                                              │
│  □ 8. ASSEMBLY                                              │
│    □ Alle nv_partX_final.mp4 bestaan?                       │
│    □ nv_final_video_*.mp4 bestaat?                          │
│    □ Finale video speelt af zonder errors?                  │
│    □ Audio en video in sync?                                │
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
   Voeg toe aan "LESSEN UIT FOUTEN" hieronder
   ↓
   Voeg fix toe aan AUDIT CHECKLIST
```

### Voorbeeld root cause analyse:

```
SYMPTOOM: Final Concat faalt met "No such file: nv_part6_final.mp4"

ANALYSE:
1. Final Concat verwacht 10 parts (total_parts = 10)
2. Maar er zijn maar 5 parts gegenereerd
3. Waarom 10? → staticData.total_parts was niet gezet
4. Waarom niet gezet? → Code: Parse Parts had error en sloeg staticData over
5. ROOT CAUSE: Parse Parts kon LLM response niet parsen

FIX:
1. Robuustere JSON parsing in Parse Parts
2. Default total_parts naar werkelijk aantal items
3. Check toegevoegd aan audit: "total_parts correct gezet?"
```

---

## C.3 Debug Commands

### Check services:
```bash
# ComfyUI
curl http://localhost:8188/system_stats

# Ollama
curl http://localhost:11434/api/tags

# Piper TTS
curl -X POST http://localhost:5680/tts -H "Content-Type: application/json" -d '{"text":"test","voice":"en_US-lessac-high"}' --output test.wav

# FFmpeg server
curl -X POST http://localhost:5681/exec -H "Content-Type: application/json" -d '{"command":"ffmpeg -version"}'
```

### Check generated files:
```bash
# In n8n Docker container
docker exec n8n ls -la /home/node/.n8n-files/output/
docker exec n8n ls -la /home/node/.n8n-files/comfyui_output/
```

### Check execution:
```bash
# Get execution details
curl -s "http://localhost:5678/api/v1/executions/EXEC_ID?includeData=true" \
  -H "X-N8N-API-KEY: YOUR_KEY" | jq '.data.resultData.runData | keys'
```

---

# DEEL D: LESSEN UIT FOUTEN

## D.1 Fout Register

| Datum | Symptoom | Root Cause | Fix | Nieuwe Audit Regel |
|-------|----------|------------|-----|-------------------|
| 2026-02-14 | Piper TTS timeout | Docker binary incompatibel met Alpine | Windows HTTP server | Check Piper op host.docker.internal:5680 |
| 2026-02-14 | executeCommand disabled | n8n 2.0+ security | ffmpeg-server.js | Check FFmpeg server op :5681 |
| 2026-02-15 | Loop verwerkte 1 item | SplitInBatches connections corrupt | Fix connections structure | Valideer loop connections |
| 2026-02-15 | output_prefix was "undefined" | item.prompt_index bestond niet | Gebruik item.output_prefix direct | Check output_prefix in Code: ComfyUI Payload |
| 2026-03-28 | Google Sheets error | range parameter ontbrak | Voeg options.range: "A:F" toe | Check range parameter aanwezig |
| 2026-03-28 | Uren verkeerde node bekeken | Luisterde niet naar gebruiker | LUISTER EERST naar wat gebruiker zegt | Als gebruiker zegt "X is kapot" → check X eerst |

---

## D.2 Structurele Verbeteringen na Fouten

### Na "Google Sheets range" fout:

**NIEUWE REGEL:**
```
BIJ ELKE DEBUG SESSIE - EERSTE ACTIE:
n8n_validate_workflow op de HELE workflow

Dit toont ALLE errors in één keer, inclusief missende parameters.
```

### Na "Uren verkeerde node" fout:

**NIEUWE REGEL:**
```
ALS GEBRUIKER ZEGT WAT KAPOT IS:
1. CHECK DIE NODE EERST
2. NIET negeren en zelf gaan zoeken
3. NIET aannemen dat jij het beter weet
```

---

## D.3 Preventieve Checks

Voer deze checks uit VOORDAT je wijzigingen maakt:

```javascript
// Check 1: Workflow ID correct?
const expectedId = 'wp6KGQcuBad98CIC';
// Check dit in CLAUDE.md VOORDAT je begint

// Check 2: Valideer hele workflow
n8n_validate_workflow({ id: 'wp6KGQcuBad98CIC' })
// Fix ALLE errors voordat je verder gaat

// Check 3: Tel nodes
const before = workflow.nodes.length;
// Na wijziging:
const after = workflow.nodes.length;
if (after < before) throw new Error('NODES VERDWENEN!');
```

---

# DEEL E: AI TRAINING INSTRUCTIES

## E.1 Hoe AI dit document moet gebruiken

```
1. LEES DIT DOCUMENT VOLLEDIG voordat je aan NVG Clean werkt

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

4. NIEUWE FOUTEN:
   a. Voeg toe aan Fout Register (D.1)
   b. Voeg nieuwe regel toe aan Audit Checklist (C.1)
   c. Update preventieve checks (D.3)
```

## E.2 Kritieke Waarschuwingen

```
⚠️ VERWIJDER NOOIT NODES
⚠️ WIJZIG NOOIT WORKFLOW ID
⚠️ CONTROLEER ALTIJD range PARAMETER BIJ GOOGLE SHEETS
⚠️ SEED VOOR i2v MOET 888888 ZIJN (NIET VARIEREN)
⚠️ LUISTER NAAR DE GEBRUIKER
```

---

**Dit document wordt bijgewerkt na elke fout. De laatste fout bepaalt de eerste check.**
