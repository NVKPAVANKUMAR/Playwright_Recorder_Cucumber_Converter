
const { Given, When, Then } = require('@cucumber/cucumber');
const { chromium } = require('playwright');

let browser;
let page;

Given('the user navigates to {string}', async function (url) {
  await this.page.goto(url);
});

When('the user clicks on the input with placeholder {string}', async function (placeholder) {
  await this.page.getByPlaceholder(placeholder).click();
});

When('the user enters {string} into the input with placeholder {string}', async function (value, placeholder) {
  await this.page.getByPlaceholder(placeholder).fill(value);
});

When('the user clicks on the element with role {string} and name {string}', async function (role, name) {
  await this.page.getByRole(role, { name: name }).click();
});

When('the user clicks on the element with locator {string}', async function (locator) {
  await this.page.locator(locator).click();
});

Then('the user should see the element with role {string} and name {string}', async function (role, name) {
  await page.getByRole(role, { name: name }).isVisible();
  await browser.close();
});
