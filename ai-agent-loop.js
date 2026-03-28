/**
 * AUTONOME AI FEEDBACK LOOP
 *
 * Twee AI's werken samen om n8n workflows te bouwen:
 * - Claude: Bouwt en verbetert workflows
 * - GPT: Reviewt en geeft feedback
 *
 * De loop draait automatisch tot de gewenste output bereikt is.
 */

const fs = require('fs');
const path = require('path');

// ============================================
// CONFIGURATIE
// ============================================

const CONFIG = {
  // API Keys (uit environment of config)
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || fs.readFileSync(path.join(__dirname, '.openai-key'), 'utf8').trim(),
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY || (fs.existsSync(path.join(__dirname, '.anthropic-key')) ? fs.readFileSync(path.join(__dirname, '.anthropic-key'), 'utf8').trim() : ''),
  N8N_API_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwMDQxMTgwZi01N2Y4LTQ2NjYtOGUwOS0xNWExMDVlM2YxZGIiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzcyMjg4NDk4fQ.HfLVdoO8ZdFPILqGNe43wOuxBkOE-k1FS8_-UCFL7xs',

  // URLs
  N8N_URL: 'http://localhost:5678',
  OPENAI_URL: 'https://api.openai.com/v1/chat/completions',
  ANTHROPIC_URL: 'https://api.anthropic.com/v1/messages',

  // Loop settings
  MAX_ITERATIONS: 5,
  MIN_SCORE_TO_PASS: 8,

  // Paths
  DOCS_PATH: __dirname,
  WORKFLOWS_PATH: path.join(__dirname, 'workflows'),
};

// ============================================
// DOCUMENT MANAGEMENT
// ============================================

function readDoc(filename) {
  const filepath = path.join(CONFIG.DOCS_PATH, filename);
  if (fs.existsSync(filepath)) {
    return fs.readFileSync(filepath, 'utf8');
  }
  return '';
}

function writeDoc(filename, content) {
  const filepath = path.join(CONFIG.DOCS_PATH, filename);
  fs.writeFileSync(filepath, content, 'utf8');
  console.log(`📝 Updated: ${filename}`);
}

function appendToFoutRegister(fout) {
  const filepath = path.join(CONFIG.DOCS_PATH, 'FOUT_REGISTER.md');
  const timestamp = new Date().toISOString().split('T')[0];
  const entry = `
## ${timestamp} - ${fout.titel}

**Symptoom:** ${fout.symptoom}

**Root Cause:** ${fout.rootCause}

**Fix:** ${fout.fix}

**Nieuwe Audit Regel:** ${fout.nieuweRegel}

---
`;
  fs.appendFileSync(filepath, entry, 'utf8');
  console.log(`📝 Fout toegevoegd aan register: ${fout.titel}`);
}

// ============================================
// API CALLS
// ============================================

async function callGPT(systemPrompt, userPrompt) {
  const response = await fetch(CONFIG.OPENAI_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${CONFIG.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.3,
      max_tokens: 8000
    })
  });

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

async function callClaude(systemPrompt, userPrompt) {
  // Als geen Anthropic key, gebruik GPT als fallback voor Claude's rol
  if (!CONFIG.ANTHROPIC_API_KEY) {
    console.log('⚠️  Geen Anthropic key, gebruik GPT voor builder rol');
    return callGPT(systemPrompt, userPrompt);
  }

  const response = await fetch(CONFIG.ANTHROPIC_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': CONFIG.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8000,
      system: systemPrompt,
      messages: [
        { role: 'user', content: userPrompt }
      ]
    })
  });

  const data = await response.json();
  return data.content?.[0]?.text || '';
}

async function validateWorkflowN8N(workflow) {
  try {
    // Simpele structuur validatie
    const errors = [];

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
  } catch (e) {
    return { valid: false, errors: [e.message] };
  }
}

// ============================================
// AI AGENTS
// ============================================

async function builderAgent(request, context, previousFeedback = null) {
  console.log('\n🔨 BUILDER AGENT (Claude/GPT) aan het werk...\n');

  const systemPrompt = `Je bent een expert n8n workflow builder. Je bouwt VALIDE n8n workflow JSON.

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
}`;

  let userPrompt = `Bouw een n8n workflow voor:

${request}`;

  if (previousFeedback) {
    userPrompt += `

## FEEDBACK VAN REVIEWER - PAS DIT AAN

${previousFeedback}

Bouw de workflow opnieuw met deze feedback verwerkt.`;
  }

  const response = await callClaude(systemPrompt, userPrompt);

  // Parse JSON uit response
  try {
    // Probeer direct JSON te parsen
    return JSON.parse(response);
  } catch (e) {
    // Probeer JSON uit markdown te extracten
    const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1]);
    }
    // Probeer { ... } te vinden
    const objMatch = response.match(/\{[\s\S]*\}/);
    if (objMatch) {
      return JSON.parse(objMatch[0]);
    }
    throw new Error('Kon geen JSON parsen uit builder response');
  }
}

async function reviewerAgent(workflow, request, context) {
  console.log('\n🔍 REVIEWER AGENT (GPT) aan het werk...\n');

  const systemPrompt = `Je bent een strikte n8n workflow reviewer. Je checkt of workflows voldoen aan de gewenste output.

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
}`;

  const userPrompt = `Review deze workflow:

## ORIGINELE REQUEST
${request}

## WORKFLOW JSON
${JSON.stringify(workflow, null, 2)}

Geef je review als JSON.`;

  const response = await callGPT(systemPrompt, userPrompt);

  try {
    // Parse JSON
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return JSON.parse(response);
  } catch (e) {
    // Fallback review
    return {
      score: 5,
      passed: false,
      summary: 'Kon review niet parsen',
      concrete_feedback: response,
      learned_lesson: ''
    };
  }
}

// ============================================
// MAIN LOOP
// ============================================

async function runFeedbackLoop(request) {
  console.log('═'.repeat(60));
  console.log('🤖 AUTONOME AI FEEDBACK LOOP GESTART');
  console.log('═'.repeat(60));
  console.log(`\n📋 Request: ${request}\n`);

  // Laad context
  const context = {
    gewensteOutput: readDoc('GEWENSTE_OUTPUT.md') || readDoc('NVG_CLEAN_SPECIFICATIE.md'),
    auditRegels: readDoc('NVG_CLEAN_AUDIT_HANDLEIDING.md'),
    nodeSpecs: readDoc('NVG_CLEAN_AUDIT_HANDLEIDING.md'), // Deel B
    foutRegister: readDoc('FOUT_REGISTER.md')
  };

  let workflow = null;
  let review = null;
  let iteration = 0;

  while (iteration < CONFIG.MAX_ITERATIONS) {
    iteration++;
    console.log(`\n${'─'.repeat(60)}`);
    console.log(`📍 ITERATIE ${iteration}/${CONFIG.MAX_ITERATIONS}`);
    console.log('─'.repeat(60));

    // STAP 1: Builder bouwt/verbetert workflow
    const feedback = review?.concrete_feedback || null;
    try {
      workflow = await builderAgent(request, context, feedback);
      console.log(`✅ Workflow gebouwd: ${workflow.name || 'Unnamed'}`);
      console.log(`   Nodes: ${workflow.nodes?.length || 0}`);
    } catch (e) {
      console.log(`❌ Builder error: ${e.message}`);
      continue;
    }

    // STAP 2: Valideer structuur
    const validation = await validateWorkflowN8N(workflow);
    if (!validation.valid) {
      console.log(`❌ Validatie errors:`);
      validation.errors.forEach(e => console.log(`   - ${e}`));
      review = {
        score: 3,
        passed: false,
        concrete_feedback: `Fix deze validatie errors:\n${validation.errors.join('\n')}`
      };
      continue;
    }
    console.log(`✅ Structuur validatie passed`);

    // STAP 3: Reviewer checkt
    try {
      review = await reviewerAgent(workflow, request, context);
      console.log(`\n📊 REVIEW RESULTAAT:`);
      console.log(`   Score: ${review.score}/10`);
      console.log(`   Passed: ${review.passed ? '✅' : '❌'}`);
      console.log(`   Summary: ${review.summary}`);

      if (review.audit_violations?.length > 0) {
        console.log(`   Audit violations:`);
        review.audit_violations.forEach(v => console.log(`   - ${v}`));
      }
    } catch (e) {
      console.log(`❌ Reviewer error: ${e.message}`);
      continue;
    }

    // STAP 4: Check of we klaar zijn
    if (review.score >= CONFIG.MIN_SCORE_TO_PASS && review.passed) {
      console.log(`\n${'═'.repeat(60)}`);
      console.log(`🎉 SUCCES NA ${iteration} ITERATIE(S)!`);
      console.log('═'.repeat(60));

      // Sla workflow op
      const filename = `workflow_${Date.now()}.json`;
      const filepath = path.join(CONFIG.WORKFLOWS_PATH, filename);
      if (!fs.existsSync(CONFIG.WORKFLOWS_PATH)) {
        fs.mkdirSync(CONFIG.WORKFLOWS_PATH, { recursive: true });
      }
      fs.writeFileSync(filepath, JSON.stringify(workflow, null, 2));
      console.log(`\n💾 Workflow opgeslagen: ${filename}`);

      // Sla les op als die er is
      if (review.learned_lesson) {
        appendToFoutRegister({
          titel: `Succes: ${request.substring(0, 50)}...`,
          symptoom: 'N/A - Succes',
          rootCause: 'N/A - Succes',
          fix: review.learned_lesson,
          nieuweRegel: review.learned_lesson
        });
      }

      return {
        success: true,
        workflow: workflow,
        iterations: iteration,
        filepath: filepath
      };
    }

    console.log(`\n🔄 Score ${review.score} < ${CONFIG.MIN_SCORE_TO_PASS}, nog een iteratie...`);
    console.log(`   Feedback: ${review.concrete_feedback?.substring(0, 200)}...`);
  }

  // Max iteraties bereikt
  console.log(`\n${'═'.repeat(60)}`);
  console.log(`⚠️  MAX ITERATIES BEREIKT ZONDER SUCCES`);
  console.log('═'.repeat(60));

  // Sla fout op voor volgende keer
  appendToFoutRegister({
    titel: `Gefaald: ${request.substring(0, 50)}...`,
    symptoom: `Kon geen passende workflow bouwen na ${CONFIG.MAX_ITERATIONS} pogingen`,
    rootCause: review?.concrete_feedback || 'Onbekend',
    fix: 'Handmatige interventie nodig',
    nieuweRegel: 'Check of request duidelijk genoeg is'
  });

  return {
    success: false,
    workflow: workflow,
    lastReview: review,
    iterations: iteration
  };
}

// ============================================
// CLI INTERFACE
// ============================================

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log(`
╔════════════════════════════════════════════════════════════╗
║           AUTONOME AI WORKFLOW BUILDER                     ║
╠════════════════════════════════════════════════════════════╣
║                                                            ║
║  Gebruik:                                                  ║
║    node ai-agent-loop.js "beschrijving van workflow"       ║
║                                                            ║
║  Voorbeeld:                                                ║
║    node ai-agent-loop.js "Webhook die data naar Slack"     ║
║                                                            ║
║  Of interactief:                                           ║
║    node ai-agent-loop.js --interactive                     ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
`);
    return;
  }

  if (args[0] === '--interactive') {
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question('\n🤖 Beschrijf de workflow die je wilt bouwen:\n> ', async (request) => {
      rl.close();
      await runFeedbackLoop(request);
    });
  } else {
    const request = args.join(' ');
    await runFeedbackLoop(request);
  }
}

main().catch(console.error);
