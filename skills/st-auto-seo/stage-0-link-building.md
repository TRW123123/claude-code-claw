# Stage 0b: Domain Authority Building (Chrome Automation)

## Zweck
Aktiver Aufbau von Domain Authority durch Directory Submissions und Entitaets-Signale.
Nutzt Chrome MCP fuer Browser-Automation. Tasks werden aus `claw.link_building_queue` abgearbeitet.

## Wann ausfuehren
- Wenn der Weekly Agent Link-Building Opportunities identifiziert hat
- Manuell via `/st-auto-seo` wenn DA-Building ansteht
- NICHT autonom — immer mit Safak-OK

## NAP-Daten (Name, Address, Phone)

Diese Daten muessen bei JEDER Directory Submission identisch sein:

| Feld | Wert |
|---|---|
| **Firmenname** | ST Automatisierung UG (haftungsbeschraenkt) |
| **Strasse** | [Aus Google Business Profile lesen] |
| **PLZ/Stadt** | [Aus Google Business Profile lesen] |
| **Telefon** | [Aus Google Business Profile lesen] |
| **Website** | https://st-automatisierung.de |
| **E-Mail** | [Aus Google Business Profile lesen] |
| **Beschreibung kurz** | KI-Beratung und Prozessautomatisierung fuer den Mittelstand |
| **Beschreibung lang** | ST Automatisierung berät mittelständische Unternehmen bei der Einfuehrung von KI-Loesungen, Prozessautomatisierung und der Nutzung von BAFA-Foerdermitteln. Schwerpunkte: KI-Strategie, AI Act Compliance, Digitalisierungsberatung. |
| **Branche** | Unternehmensberatung / IT-Beratung / KI-Beratung |
| **Gruendungsjahr** | [Aus Creditreform/IHK] |

**WICHTIG:** Vor erstem Lauf NAP-Daten aus Google Business Profile verifizieren und hier eintragen.

## Directory-Liste (DACH B2B relevant)

### Tier 1: Hohe Autoritaet (DA 60+)

| Verzeichnis | URL | Kategorie | Status |
|---|---|---|---|
| Gelbe Seiten | gelbeseiten.de | Branchenbuch | pending |
| 11880 | 11880.com | Branchenbuch | pending |
| Das Oertliche | dasoertliche.de | Branchenbuch | pending |
| WLW (Wer liefert was) | wlw.de | B2B Verzeichnis | pending |
| Creditreform | creditreform.de | Wirtschaftsauskunft | verifizieren |
| IHK Firmensuche | ihk.de | Kammer | verifizieren |

### Tier 2: Mittlere Autoritaet (DA 40-60)

| Verzeichnis | URL | Kategorie | Status |
|---|---|---|---|
| GoLocal | golocal.de | Bewertungsportal | pending |
| Cylex | cylex.de | Branchenbuch | pending |
| Hotfrog | hotfrog.de | Branchenbuch | pending |
| Firmenwissen | firmenwissen.de | Firmenverzeichnis | pending |
| Branchenbuch.de | branchenbuch.de | Branchenbuch | pending |
| KennstDuEinen | kennstdueinen.de | Bewertungsportal | pending |

### Tier 3: Nischen (B2B/Beratung spezifisch)

| Verzeichnis | URL | Kategorie | Status |
|---|---|---|---|
| BAFA Beraterliste | bafa.de | Foerderung | verifizieren |
| BDU (Bundesverband Deutscher Unternehmensberater) | bdu.de | Branchenverband | pruefen |
| DIHK Firmendatenbank | dihk.de | Kammer | pruefen |
| ProvenExpert | provenexpert.com | Bewertungsportal | pending |
| Trustpilot | trustpilot.de | Bewertungsportal | pending |

## Workflow

### Schritt 1: Queue befuellen (einmalig beim Setup)

```sql
INSERT INTO claw.link_building_queue (domain, directory_name, directory_url, category, status, nap_data)
VALUES
 ('st-automatisierung.de', 'Gelbe Seiten', 'https://www.gelbeseiten.de', 'branchenbuch', 'pending', '{}'),
 ('st-automatisierung.de', '11880', 'https://www.11880.com', 'branchenbuch', 'pending', '{}'),
 ('st-automatisierung.de', 'Das Oertliche', 'https://www.dasoertliche.de', 'branchenbuch', 'pending', '{}'),
 ('st-automatisierung.de', 'WLW', 'https://www.wlw.de', 'b2b', 'pending', '{}'),
 ('st-automatisierung.de', 'GoLocal', 'https://www.golocal.de', 'bewertung', 'pending', '{}'),
 ('st-automatisierung.de', 'Cylex', 'https://www.cylex.de', 'branchenbuch', 'pending', '{}'),
 ('st-automatisierung.de', 'Hotfrog', 'https://www.hotfrog.de', 'branchenbuch', 'pending', '{}'),
 ('st-automatisierung.de', 'Firmenwissen', 'https://www.firmenwissen.de', 'firmenverzeichnis', 'pending', '{}'),
 ('st-automatisierung.de', 'Branchenbuch.de', 'https://www.branchenbuch.de', 'branchenbuch', 'pending', '{}'),
 ('st-automatisierung.de', 'ProvenExpert', 'https://www.provenexpert.com', 'bewertung', 'pending', '{}'),
 ('st-automatisierung.de', 'Creditreform', 'https://www.creditreform.de', 'wirtschaft', 'verifizieren', '{}'),
 ('st-automatisierung.de', 'IHK', 'https://www.ihk.de', 'kammer', 'verifizieren', '{}'),
 ('st-automatisierung.de', 'BAFA Beraterliste', 'https://www.bafa.de', 'foerderung', 'verifizieren', '{}')
ON CONFLICT (domain, directory_name) DO NOTHING;
```

### Schritt 2: Bestehende Eintraege verifizieren

Fuer jeden Eintrag mit Status `verifizieren`:
1. Chrome MCP → `navigate` zur Directory-URL
2. Suche nach "ST Automatisierung" oder "st-automatisierung.de"
3. Wenn gefunden: Status → `verified`, `backlink_url` speichern
4. Wenn nicht gefunden: Status → `pending` (muss eingetragen werden)

### Schritt 3: Neue Eintraege erstellen

Fuer jeden Eintrag mit Status `pending` (einer pro Session):
1. Chrome MCP → `navigate` zur Directory-URL
2. Registrierungsseite finden
3. Formular ausfuellen mit NAP-Daten
4. Screenshots machen als Beweis
5. Status → `submitted`, `submitted_at` setzen

### Schritt 4: Wöchentliche Verifizierung

DataForSEO `backlinks_backlinks` mit Filter auf bekannte Directory-Domains:

```
target: "st-automatisierung.de"
filters: [["referring_main_domain", "=", "gelbeseiten.de"]]
```

Wenn Backlink erscheint: Status → `verified`, `verified_at` + `backlink_url` setzen.

## Chrome MCP Konfiguration

- **Profil:** Profil 1 ([your-gmail])
- **Tools:** `navigate`, `read_page`, `form_input`, `computer` (fuer Formulare)
- **Timeout:** 30s pro Seite
- **Screenshots:** Vor und nach Submission speichern

## Hard Rules

1. **Maximal 1 Directory Submission pro Session** — nicht spammen
2. **NAP-Daten muessen exakt identisch sein** bei jedem Eintrag
3. **Keine Fake-Bewertungen** — nur Profil erstellen, keine Reviews generieren
4. **Immer Safak-OK** vor dem Start einer Chrome-Session
5. **Captchas:** Wenn Captcha erscheint → abbrechen, im Log vermerken, Safak informieren
