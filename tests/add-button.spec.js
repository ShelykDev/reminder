const { test, expect } = require('@playwright/test');
const path = require('path');

test('кнопка "Додати" додає нове завдання до списку', async ({ page }) => {
  await page.goto('file://' + path.resolve(__dirname, '../index.html'));

  await page.fill('#todo-input', 'Купити молоко');
  await page.click('button[type="submit"]');

  const todoItem = page.locator('#todo-list').getByText('Купити молоко');
  await expect(todoItem).toBeVisible();
});
