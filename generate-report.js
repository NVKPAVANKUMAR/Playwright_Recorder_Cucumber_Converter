const reporter = require('cucumber-html-reporter');

// Configure the reporter
const options = {
  theme: 'bootstrap',
  jsonFile: 'reports/cucumber-report.json',
  output: 'reports/cucumber-report.html',
  reportSuiteAsScenarios: true,
  launchReport: true,
  metadata: {
    browser: {
      name: 'chrome',
      version: '91',
    },
    device: 'Local Test Machine',
    platform: {
      name: 'Windows',
      version: '10',
    },
  },
};

// Generate the HTML report
reporter.generate(options);
