# Playwright_Recorder_Cucumber_Converter

Goal for this project to create cucumber bdd scenario from the code generated from playwright codegen feature

# Steps to convert
1. Run `npx playwright codegen` command in terminal.
2. Record any application flow and copy code from codegen ui.
3. Paste code into playwright-script.js file and save it.
4. Then run `node generate-cucumber.js` command in terminal.
5. Feature files as well stepdefs would be generated features and steps folders respectively.
6. Then run `npm run test` command to execute the scenarios.
7. Report would be generated under `reports` folder.
