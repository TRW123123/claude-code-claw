---
name: reload-skills
description: Scannt das Skills-Verzeichnis, validiert alle SKILL.md Dateien und zeigt Diff zur aktuellen Session. Nutzen wenn neue Skills hinzugefügt oder bestehende geändert wurden. Trigger-Wörter "reload skills", "skills neu laden", "/reload-skills".
---

# SKILL: Reload Skills (Skill Hot-Reload / Diff-Check)

> **Technische Realität (2026-04-19):** Claude Code lädt die Skill-Registry **einmalig beim Session-Start** aus `C:/Users/User/.claude/skills/`. Die Skill-Liste, die im System-Reminder erscheint, ist für die aktuelle Session **fix**. Ein echter In-Session Hot-Reload ist nicht möglich — neue Skills werden erst in der **nächsten Session** verfügbar.
>
> Dieser Skill ist deshalb ein **Diff + Validator**: er zeigt, was nach einem Restart geladen würde, und validiert dass alle SKILL.md Dateien well-formed sind.

---

## WANN NUTZEN

- Nach `mkdir` + neue `SKILL.md` erstellt → prüfen ob sie gültig ist
- Nach Edit an bestehender `SKILL.md` → prüfen ob Frontmatter okay
- User fragt "sind meine neuen Skills aktiv?" → Antwort: "Nein, Restart nötig — hier die Diff"
- Debugging: warum triggert Skill X nicht? → prüfen ob `description` sinnvoll ist

---

## WORKFLOW

### 1. Scan Skills-Directory

```bash
ls C:/Users/User/.claude/skills/
```

Für jeden Unterordner: prüfe ob `SKILL.md` existiert.

### 2. Validierung pro SKILL.md

Lies jede `SKILL.md` und prüfe:

1. **Frontmatter vorhanden?** Muss starten mit `---\nname: ...\ndescription: ...\n---`
2. **`name` matched den Ordnernamen?** (sonst lädt Claude es unter falschem Namen)
3. **`description` hat Trigger-Wörter?** (sonst triggert der Skill nicht zuverlässig)
4. **Datei > 20 Zeilen?** (sonst vermutlich leeres Scaffold)

### 3. Diff zur aktuellen Session

Vergleiche Scan-Ergebnis mit der Skill-Liste aus dem aktuellen System-Reminder:

- **Neu:** Skill-Ordner existiert, aber nicht in aktueller Session-Liste → *"aktiv nach Restart"*
- **Gelöscht:** In Session-Liste, aber kein Ordner mehr → *"noch geladen, beim Restart weg"*
- **Geändert:** Mtime der `SKILL.md` > Session-Start-Zeit → *"Änderung aktiv nach Restart"*

### 4. Report

Gib strukturiert aus:

```
SKILL RELOAD CHECK — <timestamp>

Scan: <N> Skills gefunden
Valide: <X>
Fehler: <Y>

[NEW] skill-foo — valid, wird nach Restart geladen
[CHANGED] claw-memory — SKILL.md editiert (mtime: ...), Restart nötig
[ERROR] broken-skill — fehlender Frontmatter-Block

Handlungsbedarf: <ja/nein — wenn ja: Restart empfohlen>
```

### 5. Output-Rule

- Wenn **keine Änderungen**: "Alle Skills aktuell, kein Restart nötig."
- Wenn **Änderungen**: "X neu / Y geändert — in neuer Session verfügbar. Restart via `/clear` oder neuem Chat."

---

## HARD RULES

- **Niemals** `settings.json` anfassen (Registrierung erfolgt automatisch per Ordnername)
- **Niemals** SKILL.md Dateien automatisch editieren/reparieren — nur Fehler **melden**
- Wenn ein Skill-Name kollidiert mit bestehendem: nur **warnen**, nicht umbenennen

---

## BEKANNTE LIMITATIONEN

1. Die aktuelle Session-Skill-Liste ist nicht programmatisch abrufbar — Diff gegen System-Reminder geht nur wenn Claude die Liste im Kontext hat. Fallback: einfach alle gefundenen Skills listen + Hinweis "Restart für Aktivierung".
2. Plugin-Skills (namespaced wie `wiki:research`) liegen außerhalb von `~/.claude/skills/` und werden nicht gescannt.
3. Mtime-Check ist nur indikativ — ein Git-Pull kann Mtimes verfälschen.

---

## ALTERNATIVE (vorgeschlagen, nicht implementiert)

Ein Filesystem-Watcher der bei `.claude/skills/**/SKILL.md`-Änderungen eine Desktop-Notification feuert ("Neuer Skill — Session neu starten"). Würde via Node `chokidar` im System-Tray laufen. Out-of-Scope für diesen Skill.
