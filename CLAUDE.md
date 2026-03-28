# Regels voor AI Agents

## Bij het bouwen van workflows

1. Valideer ELKE node met n8n_validate_workflow
2. Alle workflows moeten importeerbaar zijn in n8n
3. Gebruik typeVersion die n8n ondersteunt
4. Geen hardcoded secrets - gebruik environment variables

## Bij review

1. Check of ALLE verplichte velden aanwezig zijn
2. Check of connections logisch zijn
3. Check of er geen nodes missen
4. Test met minimaal 1 testcase

## Nooit doen

1. Nodes verwijderen zonder expliciete vraag
2. Credentials in workflow JSON zetten
3. Workflow activeren zonder test
4. Aannemen dat iets werkt zonder validatie
