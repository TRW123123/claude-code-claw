# Google Stitch MCP Setup Guide
## Claude Code ↔ Google Stitch Integration

**Stitch:** AI-Design-Platform von Google Labs — Text → UI-Screens (HTML + Screenshots)
**Endpoint:** https://stitch.withgoogle.com
**MCP Endpoint:** https://stitch.withgoogle.com/mcp
**SDK:** `@google/stitch-sdk` (npm)

---

## Schritt 1: API Key holen

1. Gehe zu https://stitch.withgoogle.com
2. Account erstellen / einloggen
3. Settings → API → Key generieren
4. Key speichern als `STITCH_API_KEY`

---

## Schritt 2: SDK installieren

```bash
npm install @google/stitch-sdk
```

---

## Schritt 3: MCP in Claude Code einbinden

In `.claude/settings.json` (oder globale Claude-Settings):

```json
{
 "mcpServers": {
 "stitch": {
 "command": "npx",
 "args": ["@google/stitch-sdk", "mcp"],
 "env": {
 "STITCH_API_KEY": "dein-api-key-hier"
 }
 }
 }
}
```

**Alternative — Remote MCP Endpoint direkt:**
```json
{
 "mcpServers": {
 "stitch": {
 "url": "https://stitch.withgoogle.com/mcp",
 "headers": {
 "Authorization": "Bearer dein-api-key-hier"
 }
 }
 }
}
```

---

## Schritt 4: Verfügbare MCP Tools

Nach dem Setup stehen in Claude Code zur Verfügung:

| Tool | Beschreibung |
|------|-------------|
| `create_project` | Neues Stitch-Projekt anlegen |
| `generate_screen_from_text` | Text/Prompt → UI-Screen generieren |
| `get_screen` | Screen abrufen (HTML + Screenshot URL) |
| `list_projects` | Alle Projekte auflisten |
| `list_screens` | Alle Screens eines Projekts |

---

## Schritt 5: Programmatische Nutzung (TypeScript)

```typescript
import { stitch } from "@google/stitch-sdk";

// Projekt anlegen
const project = stitch.project("mein-projekt-id");

// Screen aus Master Prompt generieren
const screen = await project.generate(`
 Act as an Elite UI/UX Frontend Engineer...
 [Master Prompt hier einfügen]
`);

// HTML + Screenshot holen
const html = await screen.getHtml();
const imageUrl = await screen.getImage();

// Varianten generieren
const variants = await screen.variants(3);

// Screen editieren
const updated = await screen.edit("Make the background darker and add more contrast");
```

---

## Vollständiger Workflow mit dem elite-ui-ux Skill

```
1. User beschreibt Projekt
 ↓
2. elite-ui-ux Skill generiert:
 - Master Prompt (für Cursor/v0)
 - DESIGN.md (für Stitch-Konsistenz)
 ↓
3. Claude Code ruft Stitch MCP auf:
 create_project → "Mein Projekt"
 generate_screen_from_text → Master Prompt
 ↓
4. Stitch liefert:
 - HTML der generierten UI
 - Screenshot URL
 ↓
5. HTML wird in Next.js/React-Projekt eingebunden
6. Iterationen via screen.edit() oder neue Screens
```

---

## Device Types

```typescript
// Mobile, Desktop, Tablet oder Agnostic
const screen = await project.generate(prompt, { device: "DESKTOP" });
const mobileScreen = await project.generate(prompt, { device: "MOBILE" });
```

---

## Vercel AI SDK Integration (alternative)

```typescript
import { stitchTools } from "@google/stitch-sdk/ai";
import { generateText } from "ai";
import { google } from "@ai-sdk/google";

const { text } = await generateText({
 model: google("gemini-2.5-flash"),
 tools: stitchTools(),
 maxSteps: 10,
 prompt: "Erstelle ein Projekt und generiere ein modernes SaaS Dashboard mit dem Aesthetic 'Quantum Flux Gradients'"
});
```

---

## DESIGN.md im Projekt

Die `DESIGN.md` (generiert vom elite-ui-ux Skill) im Projekt-Root ablegen.
Stitch liest sie automatisch für konsistente Design-Entscheidungen:

```
mein-projekt/
├── DESIGN.md ← Von elite-ui-ux Skill generiert
├── CLAUDE.md ← Claude Code Regeln
├── src/
└── ...
```
