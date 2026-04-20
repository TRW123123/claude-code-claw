#!/usr/bin/env node
/**
 * CLAW GSC URL Submission
 * Öffnet Chrome mit dem richtigen Profil → GSC → Request Indexing
 *
 * Usage: node claw-gsc-submit.mjs "https://ki-automatisieren.de/ratgeber/..."
 *        node claw-gsc-submit.mjs --urls-from results/2026-03-29-title-tags.md
 *
 * Env: (keine — nutzt gespeicherten Chrome Login)
 */

import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH    = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const PROFILE_DIR    = 'C:/Users/User/AppData/Local/Google/Chrome/User Data';
const PROFILE_NAME   = 'Profile 1';  // <USER_EMAIL> — GSC-Account
const LOG_FILE       = 'C:/Users/User/Claude/scripts/claw-gsc.log';

const DOMAIN_MAP = {
    'ki-automatisieren.de':  'https://search.google.com/search-console/inspect?resource_id=sc-domain%3Aki-automatisieren.de',
    'profilfoto-ki.de':      'https://search.google.com/search-console/inspect?resource_id=sc-domain%3Aprofilfoto-ki.de',
    'st-automatisierung.de': 'https://search.google.com/search-console/inspect?resource_id=sc-domain%3Ast-automatisierung.de',
    '<BUSINESS_EXAMPLE>':             'https://search.google.com/search-console/inspect?resource_id=sc-domain%3A<BUSINESS_EXAMPLE>',
};

function log(msg) {
    const line = `[${new Date().toISOString()}] ${msg}`;
    console.log(line);
    fs.appendFileSync(LOG_FILE, line + '\n');
}

function detectDomain(url) {
    try {
        const hostname = new URL(url).hostname.replace('www.', '');
        return hostname;
    } catch {
        return null;
    }
}

function extractUrlsFromFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const urlRegex = /https?:\/\/(?:www\.)?(?:ki-automatisieren|profilfoto-ki|st-automatisierung|sanper)\.de[^\s"')>]*/g;
    return [...new Set(content.match(urlRegex) || [])];
}

async function submitUrl(page, url) {
    const domain = detectDomain(url);
    if (!domain || !DOMAIN_MAP[domain]) {
        log(`  ✗ Unbekannte Domain: ${url}`);
        return false;
    }

    const gscUrl = DOMAIN_MAP[domain];
    log(`  → Navigiere zu GSC für ${domain}...`);

    try {
        await page.goto(gscUrl, { waitUntil: 'networkidle2', timeout: 30000 });
        await new Promise(r => setTimeout(r, 2000));

        // URL-Eingabefeld finden und ausfüllen
        const inputSelector = 'input[aria-label="Inspect any URL"]';
        const altInputSelector = 'input[type="text"]';

        let input = await page.$(inputSelector);
        if (!input) input = await page.$(altInputSelector);

        if (!input) {
            log(`  ✗ URL-Eingabefeld nicht gefunden für ${domain}`);
            return false;
        }

        // Feld leeren und URL eingeben
        await input.click({ clickCount: 3 });
        await input.type(url, { delay: 30 });
        await page.keyboard.press('Enter');

        log(`  → URL eingegeben, warte auf Inspection...`);
        await new Promise(r => setTimeout(r, 8000));

        // "Request Indexing" Button suchen und klicken
        const buttons = await page.$$('button, [role="button"]');
        let requestBtn = null;

        for (const btn of buttons) {
            const text = await page.evaluate(el => el.textContent || el.innerText || '', btn);
            if (text.includes('Request Indexing') || text.includes('Indexierung beantragen')) {
                requestBtn = btn;
                break;
            }
        }

        if (!requestBtn) {
            // Vielleicht ist die URL schon indexiert
            const pageContent = await page.content();
            if (pageContent.includes('URL is on Google') || pageContent.includes('URL ist in Google')) {
                log(`  ✓ ${url} — bereits indexiert`);
                return true;
            }
            log(`  ✗ "Request Indexing" Button nicht gefunden`);
            return false;
        }

        await requestBtn.click();
        log(`  → "Request Indexing" geklickt, warte auf Bestätigung...`);

        // Warten auf Confirmation-Dialog
        await new Promise(r => setTimeout(r, 15000));

        // Prüfen ob Bestätigung kam
        const pageContent = await page.content();
        if (pageContent.includes('Indexing requested') || pageContent.includes('Indexierung wurde beantragt') || pageContent.includes('successfully')) {
            log(`  ✓ ${url} — Indexierung beantragt`);
            return true;
        } else {
            log(`  ~ ${url} — Status unklar, manuell prüfen`);
            return true; // Optimistisch
        }

    } catch (err) {
        log(`  ✗ Fehler bei ${url}: ${err.message.slice(0, 200)}`);
        return false;
    }
}

async function main() {
    log('=== CLAW GSC Submit Start ===');

    // URLs aus Args oder Datei sammeln
    let urls = [];
    const args = process.argv.slice(2);

    for (const arg of args) {
        if (arg.startsWith('--urls-from=') || arg.startsWith('--urls-from ')) {
            const file = arg.replace('--urls-from=', '').replace('--urls-from ', '');
            urls.push(...extractUrlsFromFile(file));
        } else if (arg.startsWith('http')) {
            urls.push(arg);
        }
    }

    if (urls.length === 0) {
        log('Keine URLs angegeben. Usage: node claw-gsc-submit.mjs "https://..." oder --urls-from=datei.md');
        process.exit(0);
    }

    urls = [...new Set(urls)]; // Deduplizieren
    log(`${urls.length} URLs zum Einreichen: ${urls.join(', ')}`);

    // Chrome verbinden — erst CDP, dann Launch
    let browser;
    let launchedByUs = false;
    try {
        browser = await puppeteer.connect({
            browserURL: 'http://127.0.0.1:9222',
            defaultViewport: null
        });
        log('Verbunden mit laufendem Chrome (CDP)');
    } catch {
        try {
            browser = await puppeteer.launch({
                executablePath: CHROME_PATH,
                headless: false,
                userDataDir: PROFILE_DIR,
                args: [
                    `--profile-directory=${PROFILE_NAME}`,
                    '--remote-debugging-port=9222',
                    '--no-first-run',
                    '--no-default-browser-check',
                    '--disable-blink-features=AutomationControlled'
                ],
                defaultViewport: { width: 1280, height: 800 }
            });
            launchedByUs = true;
            log('Chrome gestartet mit Profile 1 + Debug-Port');
        } catch (err) {
            log(`Chrome-Start fehlgeschlagen: ${err.message}`);
            log('Tipp: Chrome schließen oder mit --remote-debugging-port=9222 starten');
            process.exit(1);
        }
    }

    const page = await browser.newPage();
    let submitted = 0;
    let failed = 0;

    for (const url of urls) {
        log(`[${submitted + failed + 1}/${urls.length}] ${url}`);
        const ok = await submitUrl(page, url);
        if (ok) submitted++; else failed++;

        // Pause zwischen Submissions (Google Rate Limit)
        if (urls.indexOf(url) < urls.length - 1) {
            log('  ⏱ 5s Pause...');
            await new Promise(r => setTimeout(r, 5000));
        }
    }

    // Tab schließen, Browser nur schließen wenn wir ihn gestartet haben
    await page.close();
    if (launchedByUs) await browser.close();
    log(`=== GSC Submit Ende — ${submitted} eingereicht, ${failed} fehlgeschlagen ===`);
}

main().catch(err => {
    log(`KRITISCHER FEHLER: ${err.message}`);
    process.exit(1);
});
