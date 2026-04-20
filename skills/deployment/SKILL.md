---
name: deployment
description: Mandatory Preflight vor jedem git push und Netlify Deploy. Prueft Build, TypeScript, Routing und Security Headers. Nutzen vor JEDEM Deployment — kein Bypass erlaubt.
allowed-tools: [Read, Bash]
---

# Deployment Preflight Skill

## Rolle
Release-Gate. NICHTS geht live wenn der Build bricht.

---

## Pflicht-Reihenfolge vor jedem Push

```bash
# 1. Git Status — muss clean sein
git status

# 2. Build lokal
npm run build   # Exit Code muss 0 sein

# 3. TypeScript (falls vorhanden)
tsc --noEmit

# 4. Linting (falls vorhanden)
npm run lint

# 5. Tailwind-Arbitrary-Value-Check (siehe unten)
```

**Regel:** Wenn einer dieser Schritte fehlschlaegt → STOP. Nicht pushen.

---

## 🚨 TAILWIND-JIT-ARBITRARY-VALUES-CHECK (PFLICHT fuer static Projekte)

### Das Problem (Lesson Learned 2026-04-15)

Bei static Sites ohne Build-Pipeline auf Netlify (d.h. dist/ wird roh deployed):
- Tailwind-Classes wie `lg:grid-cols-[1.1fr_1fr]`, `aspect-[2/1]`, `w-[calc(100%-2rem)]` sind **arbitrary values**
- Sie werden NUR in die kompilierte `style.css` aufgenommen wenn der Tailwind-Build (Schritt 2) sie im HTML sieht
- Wenn `npm run build` nicht gelaufen ist zwischen Edit + Push → die Class fehlt in style.css → UI bricht auf Live-URL

### Check-Script

```bash
# Nach Edit, vor Commit — diesen Check laufen lassen:
# Findet alle arbitrary-values im HTML und prüft ob in style.css
for file in src/**/*.html src/*.html; do
  grep -oE '(lg|md|sm|xl):(grid-cols|col-span|row-span|aspect|gap|p|m|w|h|max-w|min-h|text)-\[[^]]+\]' "$file" 2>/dev/null | sort -u
done | sort -u > /tmp/arb-used.txt

# Check in kompilierter CSS:
while read class; do
  escaped=$(echo "$class" | sed 's/\[/\\[/g; s/\]/\\]/g; s|/|\\/|g; s/\./\\./g')
  if ! grep -q "$escaped" dist/style.css 2>/dev/null; then
    echo "⚠ MISSING in dist/style.css: $class"
  fi
done < /tmp/arb-used.txt
```

**Wenn MISSING: 2 Optionen:**
1. **Rebuild** — `npm run build` ausführen, dann erneut committen
2. **Inline-CSS-Fallback** — Arbitrary-Tailwind-Class ersetzen durch eine benannte CSS-Klasse mit raw CSS im `<style>` Block der Seite

**Bevorzugt bei static deploys ohne Build-Step:** Option 2 (Inline-CSS). Keine Abhängigkeit vom Build-State.

### Pattern-Fix-Rezept

Schlechte Praxis (brechbar):
```html
<div class="grid lg:grid-cols-[1.1fr_1fr]">
```

Gute Praxis (Inline-CSS):
```html
<div class="grid my-grid">
<style>
  .my-grid { grid-template-columns: 1fr; }
  @media (min-width: 1024px) { .my-grid { grid-template-columns: 1.1fr 1fr; } }
</style>
```

---

## Netlify-spezifische Checks

### Shadowing-Check (kritisch)
Nie gleichzeitig:
- `[[redirects]]` mit `status = 200` (Rewrite)
- UND eine physische Datei am gleichen Pfad

Fix: `force = true` setzen wenn Rewrite gewollt

### Trailing Slash
Entscheide EINMAL: alle URLs enden mit `/` oder ohne.
Niemals mischen.

### Branch-Awareness
```bash
# Welcher Branch deployed bei Netlify?
cat netlify.toml | grep branch
# Mit aktuellem Branch abgleichen
git branch --show-current
```

### Security Headers (netlify.toml Pflicht)
```toml
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    X-XSS-Protection = "1; mode=block"
    Strict-Transport-Security = "max-age=31536000; includeSubDomains"
```

### Caching-Strategie
```toml
# Assets: immutable
[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

# HTML: kein Cache (atomare Deploys)
[[headers]]
  for = "/*.html"
  [headers.values]
    Cache-Control = "no-cache, no-store, must-revalidate"
```

---

## Post-Deploy Verifikation

1. Live-URL im Browser oeffnen — visuell pruefen
2. `seo-forensic-master-audit` ausfuehren (Routing-Verifikation)
3. Deployment-Lesson in Pinecone schreiben falls Fehler aufgetreten

---

## Hard Rules
- **`npm run build` → Exit 0** muss lokal bestaetigt sein
- **Browser-Verifikation** nach jedem Deploy
- **KEIN Deploy** ohne User-Bestaetigung
- **Deployment Lessons** Namespace: `deployment-lessons` in Pinecone
