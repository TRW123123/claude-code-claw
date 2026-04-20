import puppeteer from 'puppeteer-core';
import fs from 'fs';

const browser = await puppeteer.connect({
    browserURL: 'http://127.0.0.1:9222',
    defaultViewport: null
});

const page = await browser.newPage();

// Direkt zur URL Inspection von ki-automatisieren.de
const gscUrl = 'https://search.google.com/search-console/inspect?resource_id=sc-domain%3Aki-automatisieren.de';
console.log('Navigiere zu:', gscUrl);
await page.goto(gscUrl, { waitUntil: 'networkidle2', timeout: 30000 });
await new Promise(r => setTimeout(r, 3000));

// Screenshot der Inspection-Seite
await page.screenshot({ path: 'C:/Users/User/Claude/scripts/gsc-debug-1.png', fullPage: true });
console.log('Screenshot 1 gespeichert');

// Alle input-Elemente auflisten
const inputs = await page.evaluate(() => {
    return [...document.querySelectorAll('input, [contenteditable], [role="textbox"], [role="combobox"], [role="searchbox"]')].map(el => ({
        tag: el.tagName,
        type: el.type || '',
        id: el.id || '',
        name: el.name || '',
        placeholder: el.placeholder || '',
        ariaLabel: el.getAttribute('aria-label') || '',
        role: el.getAttribute('role') || '',
        className: el.className?.toString()?.slice(0, 80) || '',
        visible: el.offsetHeight > 0
    }));
});
console.log('Gefundene Input-Elemente:', JSON.stringify(inputs, null, 2));

await page.close();
console.log('Fertig.');
