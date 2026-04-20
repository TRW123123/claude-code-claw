import puppeteer from 'puppeteer-core';

// Verbinde mit laufendem Chrome über CDP (Chrome DevTools Protocol)
// Chrome muss mit --remote-debugging-port=9222 laufen

async function connectToChrome() {
    try {
        // Versuch 1: An laufenden Chrome mit Debugging-Port verbinden
        const browser = await puppeteer.connect({
            browserURL: 'http://127.0.0.1:9222',
            defaultViewport: null
        });
        console.log('Verbunden mit laufendem Chrome');
        return browser;
    } catch {
        console.log('Kein Chrome mit Debugging-Port gefunden.');
        console.log('Starte Chrome mit Remote Debugging...');

        // Versuch 2: Chrome mit Debugging-Port NEU starten (mit richtigem Profil)
        const browser = await puppeteer.launch({
            executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
            headless: false,
            userDataDir: 'C:/Users/User/AppData/Local/Google/Chrome/User Data',
            args: [
                '--profile-directory=Profile 1',
                '--remote-debugging-port=9222',
                '--no-first-run',
                '--no-default-browser-check',
                '--disable-blink-features=AutomationControlled'
            ],
            defaultViewport: null
        });
        console.log('Chrome gestartet mit Profile 1 + Debugging-Port');
        return browser;
    }
}

const browser = await connectToChrome();
const page = await browser.newPage();

console.log('Navigiere zu GSC...');
await page.goto('https://search.google.com/search-console', { waitUntil: 'networkidle2', timeout: 30000 });
console.log('Title:', await page.title());
console.log('URL:', page.url());

await page.screenshot({ path: 'C:/Users/User/Claude/scripts/gsc-test.png' });
console.log('Screenshot gespeichert');

// Tab schließen, aber Chrome bleibt offen
await page.close();
console.log('Tab geschlossen, Chrome bleibt offen.');
