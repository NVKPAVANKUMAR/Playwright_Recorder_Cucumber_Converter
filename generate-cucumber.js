const fs = require('fs');

// Read the Playwright script
const playwrightScript = fs.readFileSync('playwright-script.js', 'utf-8');

// Split the script by newlines to process each action separately
const actions = playwrightScript.split(/;\r?\n/);

// Function to map Playwright actions to Gherkin steps and generate step definitions
function mapActionToStep(action) {
    if (action.includes('page.goto')) {
        const url = action.match(/'([^']+)'/)[1];
        return {
            step: `Given the user navigates to "${url}"`,
            definition: `
Given('the user navigates to {string}', async function (url) {
  await this.page.goto(url);
});
`
        };
    }
    if (action.includes('page.getByPlaceholder')) {
        const placeholder = action.match(/'([^']+)'/)[1];
        if (action.includes('.click()')) {
            return {
                step: `When the user clicks on the input with placeholder "${placeholder}"`,
                definition: `
When('the user clicks on the input with placeholder {string}', async function (placeholder) {
  await this.page.getByPlaceholder(placeholder).click();
});
`
            };
        }
        if (action.includes('.fill')) {
            const value = action.match(/\.fill\('([^']+)'/)[1];
            return {
                step: `When the user enters "${value}" into the input with placeholder "${placeholder}"`,
                definition: `
When('the user enters {string} into the input with placeholder {string}', async function (value, placeholder) {
  await this.page.getByPlaceholder(placeholder).fill(value);
});
`
            };
        }
    }
    if (action.includes('page.getByRole')) {
        const roleMatch = action.match(/getByRole\('([^']+)', \{ name: '([^']+)' \}/);
        if (roleMatch) {
            const [, role, name] = roleMatch;
            if (action.includes('.click()')) {
                return {
                    step: `When the user clicks on the element with role "${role}" and name "${name}"`,
                    definition: `
When('the user clicks on the element with role {string} and name {string}', async function (role, name) {
  await this.page.getByRole(role, { name: name }).click();
});
`
                };
            }
        }
    }
    if (action.includes('page.locator')) {
        const locator = action.match(/'([^']+)'/)[1];
        if (action.includes('.click()')) {
            return {
                step: `When the user clicks on the element with locator "${locator}"`,
                definition: `
When('the user clicks on the element with locator {string}', async function (locator) {
  await this.page.locator(locator).click();
});
`
            };
        }
    }
    return null;
}

// Generate Gherkin scenario and step definitions
let gherkinScenario = 'Feature: User Login and Navigation\n\n  Scenario: Successful login and navigation\n';
let stepDefinitions = `
const { Given, When, Then } = require('@cucumber/cucumber');
const { chromium } = require('playwright');

let browser;
let page;
`;

// Keep track of the added step definitions
const addedSteps = new Set();

actions.forEach(action => {
    const result = mapActionToStep(action);
    if (result) {
        gherkinScenario += `    ${result.step}\n`;
        if (!addedSteps.has(result.definition)) {
            stepDefinitions += result.definition;
            addedSteps.add(result.definition);
        }
    }
});

// Close the browser at the end of the tests
stepDefinitions += `
Then('the user should see the element with role {string} and name {string}', async function (role, name) {
  await page.getByRole(role, { name: name }).isVisible();
  await browser.close();
});
`;

try {
    fs.mkdirSync('features', { recursive: true });
    fs.mkdirSync('steps', { recursive: true });
} catch (e) {
    console.log('Cannot create folder ', e);
}

let fileContent = `const { Before, After, AfterStep } = require('@cucumber/cucumber');
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
   const filePath = path.join('screenshots', \`\${Date.now()}_\${stepText}.png\`);
    await this.page.screenshot({ path: filePath });
    this.attach(fs.readFileSync(filePath), 'image/png'); 
  });`;

if (!fs.existsSync('hooks.js')) {
    // File does not exist, create the file and write content
    fs.writeFileSync('hooks.js', fileContent, 'utf8');
    console.log('File created and content written.');
} else {
    console.log('File already exists. Content not replaced.');
}
// Save the Gherkin scenario to a .feature file
fs.writeFileSync('features/generated-scenario.feature', gherkinScenario);

// Save the step definitions to a steps.js file
fs.writeFileSync('steps/steps.js', stepDefinitions);
