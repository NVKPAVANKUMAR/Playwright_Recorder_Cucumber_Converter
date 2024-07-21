module.exports = {
    default: {
      // Specifies which files to include for testing
      require: [
        'steps/*.js', // Path to your step definitions
        'hooks.js'       // Path to your hooks file
      ],
      // Formats the output of the test run
      format: [
        'json:reports/cucumber-report.json' // Output JSON for reports
      ],
      // Specifies which files to use as feature files
      features: 'features/*.feature', // Path to feature files
      // Allows you to define a custom world (optional)
      worldParameters: {
        customParameter: 'value'
      },
      // Tags to include or exclude from running
     // tags: '@smoke', // Run only tests tagged with @smoke
      // Strict mode to fail the test run if there are undefined or pending steps
      strict: true
    }
  };
  