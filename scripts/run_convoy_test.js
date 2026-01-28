const puppeteer = require('puppeteer');
const { spawn } = require('child_process');
const path = require('path');

async function runTest() {
  console.log('🚀 Starting Convoy Delivery Test Automation...');

  const serverPath = path.join(__dirname, '../agent-ui/server/index.js');
  const serverProcess = spawn('node', [serverPath], {
    stdio: ['ignore', 'pipe', 'pipe'], 
    env: { ...process.env, PORT: '3001' }
  });

  serverProcess.stdout.on('data', d => console.log(`[SERVER]: ${d.toString().trim()}`));
  serverProcess.stderr.on('data', d => console.error(`[SERVER ERR]: ${d.toString().trim()}`));

  // Give server time to start
  await new Promise(resolve => setTimeout(resolve, 3000));

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true, 
      args: ['--no-sandbox', '--disable-setuid-sandbox'] 
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
    page.on('pageerror', err => console.error('BROWSER ERROR:', err));
    page.on('requestfailed', req => console.error(`REQ FAILED: ${req.url()} - ${req.failure().errorText}`));

    console.log('Navigating to http://localhost:3001...');
    await page.goto('http://localhost:3001', { waitUntil: 'networkidle0' });

    console.log('Clicking Start...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const startBtn = buttons.find(b => b.innerText.includes('Start'));
      if (startBtn) startBtn.click();
      else throw new Error('Start button not found');
    });

    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log('Clicking Convoy Delivery Test...');
    await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll('li'));
      const testItem = items.find(i => i.innerText.includes('Convoy Delivery Test'));
      if (testItem) testItem.click();
      else {
        // Try fallback
         const all = Array.from(document.querySelectorAll('*'));
         const el = all.find(e => e.innerText && e.innerText.includes('Convoy Delivery Test') && e.tagName !== 'SCRIPT');
         if (el) el.click();
         else throw new Error('Convoy Delivery Test item not found');
      }
    });

    console.log('Waiting for terminals...');
    await new Promise(resolve => setTimeout(resolve, 4000));

    // Verify
    const titles = [
      'Z.ai Agent (GLM 4.7)',
      'Asset Generator (HF)',
      'Sisyphus (Claude)',
      'Oracle (OpenAI)'
    ];

    const content = await page.content();
    let foundAll = true;
    for (const title of titles) {
      if (content.includes(title)) {
        console.log(`✅ Found terminal: ${title}`);
      } else {
        console.log(`❌ Missing terminal: ${title}`);
        foundAll = false;
      }
    }

    const screenshotPath = path.join(__dirname, '../convoy-test-proof.png');
    console.log(`Taking screenshot: ${screenshotPath}`);
    await page.screenshot({ path: screenshotPath });

    if (!foundAll) {
      throw new Error('Not all terminals spawned correctly');
    }

    console.log('🎉 Test Completed Successfully!');

  } catch (error) {
    console.error('❌ Test Failed:', error);
    process.exitCode = 1;
  } finally {
    if (browser) await browser.close();
    if (serverProcess) serverProcess.kill();
    process.exit();
  }
}

runTest();