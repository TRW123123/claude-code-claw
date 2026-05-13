# notebooklm-mcp PATCH NOTES

## Bug: System-Chrome-Konflikt unter Windows (2026-04-29)

Wenn der User-Chrome läuft, scheitert notebooklm-mcp mit:
- `browserType.launchPersistentContext: Target page, context or browser has been closed`
- Chrome exit code 21 (SingletonLock-Konflikt)

## Root Cause

Beide Files setzen `channel: "chrome"` → Playwright nutzt System-Chrome.
System-Chrome auf Windows refuses zweite Instanz mit `--remote-debugging-pipe`,
selbst mit separatem `--user-data-dir`.

## Patch (manuell anwenden nach jedem npm-Update / npx-Cache-Refresh)

Suche alle 3 Locations:
- `~/AppData/Roaming/npm/node_modules/notebooklm-mcp/`
- `~/AppData/Local/npm-cache/_npx/<hash>/node_modules/notebooklm-mcp/` (mehrere)

In beiden Files:
- `dist/session/shared-context-manager.js`
- `dist/auth/auth-manager.js`

Entferne die Zeile:
```js
channel: "chrome",
```

Dann nutzt Playwright sein bundled Chromium → kein Konflikt mehr mit System-Chrome.

## Restart-Pflicht

Nach Patch MUSS Claude Code neu gestartet werden, sonst läuft der MCP-Server
weiterhin mit altem Code im RAM.

## Bei npm-Update

Wenn `npx notebooklm-mcp@latest` neuere Version cached, ist der Patch weg.
Dann erneut anwenden in der neuen `_npx/<neuer-hash>/` Cache-Location.

