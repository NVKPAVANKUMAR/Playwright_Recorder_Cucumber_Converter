const { exec } = require('child_process');

// Use environment variables for URL and output file
const url = process.env.URL;
const outputFile = 'playwright-script.js';

if (!url || !outputFile) {
  console.error('Usage: URL=<url> OUTPUT_FILE=<outputFile> npm test');
  process.exit(1);
}

console.log(`URL: ${url}`);
console.log(`Output File: ${outputFile}`);

// Construct the codegen command
const command = `npx playwright codegen ${url} --output=${outputFile}`;

// Execute the codegen command
const codegenProcess = exec(command, (error, stdout, stderr) => {
  if (error) {
    console.error(`Error: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`Stderr: ${stderr}`);
    return;
  }
  console.log(`Script generated and saved to ${outputFile}`);
});

// Listen for the exit event of the codegen process
codegenProcess.on('exit', (code) => {
  console.log(`Codegen process exited with code ${code}`);
  process.exit(code);
});
