const { Before, After, AfterStep } = require('@cucumber/cucumber');
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
let browser;
let context;
let page;

Before(async function () {
    browser = await chromium.launch({
        headless: false,
        args: ['--start-maximized']
    }); // Launch browser
    context = await browser.newContext({ viewport: null} ); // Set viewport
    page = await context.newPage(); // Create a new page
    this.page = page; // Attach page to the context
});

After(async function () {
    if (browser) {
        await browser.close(); // Close browser after scenario
    }
});

AfterStep(async function (step) {
    if (!fs.existsSync('screenshots')) {
      fs.mkdirSync('screenshots');
    }
   const stepText = step.pickleStep.text.replace(/[^a-zA-Z0-9]/g, '_'); // Sanitize step text for file name
   const filePath = path.join('screenshots', `${Date.now()}_${stepText}.png`);
    await this.page.screenshot({ path: filePath });
    this.attach(fs.readFileSync(filePath), 'image/png'); 
  });