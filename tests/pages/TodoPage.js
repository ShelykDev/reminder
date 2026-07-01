const path = require('path');

class TodoPage {
  constructor(page) {
    this.page = page;

    this.input        = page.locator('#todo-input');
    this.daySelect    = page.locator('#day-select');
    this.submitBtn    = page.locator('button[type="submit"]');
    this.todoList     = page.locator('#todo-list');
    this.itemsCount   = page.locator('#items-count');
    this.clearBtn     = page.locator('#clear-completed');

    this.filterAll       = page.locator('.filter-btn[data-filter="all"]');
    this.filterActive    = page.locator('.filter-btn[data-filter="active"]');
    this.filterCompleted = page.locator('.filter-btn[data-filter="completed"]');
  }

  async open() {
    await this.page.goto('file://' + path.resolve(__dirname, '../../index.html'));
  }

  async addTodo(text, day = null) {
    await this.input.fill(text);
    if (day) await this.daySelect.selectOption(day);
    await this.submitBtn.click();
  }

  async toggleTodo(text) {
    await this.getTodoItem(text).locator('input[type="checkbox"]').click();
  }

  async deleteTodo(text) {
    await this.getTodoItem(text).locator('.delete-btn').click();
  }

  getTodoItem(text) {
    return this.todoList.locator('.todo-item').filter({ hasText: text });
  }

  getDaySection(day) {
    return this.page.locator(`.day-section.day-${day}`);
  }
}

module.exports = { TodoPage };
