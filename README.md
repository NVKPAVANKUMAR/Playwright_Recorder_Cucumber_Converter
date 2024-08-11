# Playwright_Recorder_Cucumber_Converter

Goal for this project to create cucumber bdd scenario from the code generated from playwright codegen feature

# Steps to convert (e2e)
1. Run `URL="<url>" npm test` command in terminal.(replace <url> with actual).
2. Perform test steps on opened web appliction.
3. Close browser window after performing required steps.
4. Feature files as well stepdefs would be generated `features` and `steps` folders respectively.
6. Also code will executes the scenarios created.
7. And Report would be generated under `reports` folder.

# Steps to run only scenario execution and report
1. Run `npm run posttest` script in terminal.
2. Executes scenario created in earlier run. 
3. Genertes html report under `reports` folder.   
