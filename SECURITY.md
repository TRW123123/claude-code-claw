# Security Policy

## Reporting a vulnerability

If you discover a security issue in CLAW, please report it privately.

**Contact:** `<MAINTAINER_EMAIL>` (to be filled in before going public)

Please include:

- A description of the issue and its potential impact
- Steps to reproduce
- Any proof-of-concept code or artifacts

We aim to acknowledge reports within 72 hours and provide a remediation timeline within 7 days for confirmed issues.

## Scope

In scope:

- Secret exposure in committed files
- Injection vectors in hook scripts (`scripts/*.mjs`, `*.py`)
- Privilege escalation via skill or scheduled-task definitions
- Supabase / Pinecone access control issues in the reference scripts

Out of scope:

- Misconfiguration in user-supplied `.env` / `settings.json`
- Vulnerabilities in third-party services (Claude Code harness, Supabase, Gemini API, Pinecone)

## Disclosure policy

We follow coordinated disclosure. Please give us a reasonable window to fix before publishing details.
