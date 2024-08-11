const fs = require('fs');
const path = require('path');

// Read the Playwright script
let playwrightScript;
try {
  playwrightScript = fs.readFileSync('playwright-script.js', 'utf-8');
} catch (error) {
  console.error('Error reading Playwright script:', error);
  process.exit(1);
}

// Split the script by newlines to process each action separately
const lines = playwrightScript.split(/\r?\n/);

// Filter out import statements and test blocks
const actions = lines.filter(line => 
  !line.trim().startsWith('import') &&
  !line.trim().startsWith('test') &&
  line.trim().includes('page.')
);

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
            if (action.includes('.isVisible()')) {
                return {
                    step: `Then the user should see the element with role "${role}" and name "${name}"`,
                    definition: `
Then('the user should see the element with role {string} and name {string}', async function (role, name) {
  await this.page.getByRole(role, { name: name }).isVisible();
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
        if (action.includes('.isVisible()')) {
            return {
                step: `Then the user should see the element with locator "${locator}"`,
                definition: `
Then('the user should see the element with locator {string}', async function (locator) {
  await this.page.locator(locator).isVisible();
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
const { Given, When, Then, After} = require('@cucumber/cucumber');
const { chromium } = require('playwright');

let browser;
let context;
let page;
`;

// Keep track of the added steps to avoid duplication
const addedSteps = new Set();

actions.forEach(action => {
    const result = mapActionToStep(action);
    if (result) {
        if (!gherkinScenario.includes(result.step)) {
            gherkinScenario += `    ${result.step}\n`;
        }
        if (!addedSteps.has(result.definition)) {
            stepDefinitions += result.definition;
            addedSteps.add(result.definition);
        }
    }
});

// Ensure the last step is correctly processed
const lastAction = actions[actions.length - 1];
const lastResult = mapActionToStep(lastAction);
if (lastResult) {
    if (!gherkinScenario.includes(lastResult.step)) {
        gherkinScenario += `    ${lastResult.step}\n`;
    }
    if (!addedSteps.has(lastResult.definition)) {
        stepDefinitions += lastResult.definition;
        addedSteps.add(lastResult.definition);
    }
}

// Close the browser at the end of the tests
stepDefinitions += `
After(async function () {
  if (browser) {
    await browser.close();
  }
});
`;

try {
    fs.mkdirSync('features', { recursive: true });
    fs.mkdirSync('steps', { recursive: true });
} catch (e) {
    console.error('Cannot create folders:', e);
    process.exit(1);
}

const hooksFileContent = `const { Before, After, AfterStep } = require('@cucumber/cucumber');
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
    });
    context = await browser.newContext({ viewport: null });
    page = await context.newPage();
    this.page = page;
});

After(async function () {
    if (browser) {
        await browser.close();
    }
});

AfterStep(async function (step) {
    if (!fs.existsSync('screenshots')) {
        fs.mkdirSync('screenshots');
    }
    const stepText = step.pickleStep.text.replace(/[^a-zA-Z0-9]/g, '_');
    const filePath = path.join('screenshots', \`\${Date.now()}_\${stepText}.png\`);
    await this.page.screenshot({ path: filePath });
    this.attach(fs.readFileSync(filePath), 'image/png');
});
`;

try {
    if (!fs.existsSync('hooks.js')) {
        fs.writeFileSync('hooks.js', hooksFileContent, 'utf8');
        console.log('hooks.js created and content written.');
    } else {
        console.log('hooks.js already exists. Content not replaced.');
    }
} catch (error) {
    console.error('Error writing hooks.js:', error);
    process.exit(1);
}

// Save the Gherkin scenario to a .feature file
try {
    fs.writeFileSync('features/generated-scenario.feature', gherkinScenario, 'utf8');
    console.log('Feature file created and content written.');
} catch (error) {
    console.error('Error writing feature file:', error);
    process.exit(1);
}

// Save the step definitions to a steps.js file
try {
    fs.writeFileSync('steps/steps.js', stepDefinitions, 'utf8');
    console.log('Step definitions file created and content written.');
} catch (error) {
    console.error('Error writing step definitions file:', error);
    process.exit(1);
}
