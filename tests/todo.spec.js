const { test, expect } = require('@playwright/test');
const { TodoPage } = require('./pages/TodoPage');

let todoPage;

test.beforeEach(async ({ page }) => {
  todoPage = new TodoPage(page);
  await todoPage.open();
});

test.describe('Додавання завдань', () => {
  test('додає завдання до списку після натискання кнопки', async () => {
    await todoPage.addTodo('Купити молоко', 'mon');

    await expect(todoPage.getTodoItem('Купити молоко')).toBeVisible();
  });

  test('поле вводу очищується після додавання', async () => {
    await todoPage.addTodo('Зробити домашнє завдання');

    await expect(todoPage.input).toHaveValue('');
  });

  test('не додає порожнє завдання', async () => {
    await todoPage.submitBtn.click();

    await expect(todoPage.todoList.locator('.todo-item')).toHaveCount(0);
  });

  test('завдання потрапляє у правильний день тижня', async () => {
    await todoPage.addTodo('Похід у спортзал', 'fri');

    await expect(todoPage.getDaySection('fri').getByText('Похід у спортзал')).toBeVisible();
  });

  test('завдання потрапляють у правильні секції для всіх днів тижня', async () => {
    const days = [
      { day: 'mon', text: 'Завдання на понеділок' },
      { day: 'tue', text: 'Завдання на вівторок' },
      { day: 'wed', text: 'Завдання на середу' },
      { day: 'thu', text: 'Завдання на четвер' },
      { day: 'fri', text: 'Завдання на пʼятницю' },
      { day: 'sat', text: 'Завдання на суботу' },
      { day: 'sun', text: 'Завдання на неділю' },
    ];

    for (const { day, text } of days) {
      await todoPage.addTodo(text, day);
    }

    for (const { day, text } of days) {
      await expect(todoPage.getDaySection(day).getByText(text)).toBeVisible();
    }
  });
});

test.describe('Виконання та видалення завдань', () => {
  test('відмічає завдання як виконане через чекбокс', async () => {
    await todoPage.addTodo('Прочитати книгу', 'tue');
    await todoPage.toggleTodo('Прочитати книгу');

    await expect(todoPage.getTodoItem('Прочитати книгу')).toHaveClass(/completed/);
  });

  test('видаляє завдання зі списку', async () => {
    await todoPage.addTodo('Тимчасове завдання', 'wed');
    await todoPage.deleteTodo('Тимчасове завдання');

    await expect(todoPage.getTodoItem('Тимчасове завдання')).toHaveCount(0);
  });
});

test.describe('Фільтри', () => {
  test('фільтр "Активні" показує лише невиконані завдання', async () => {
    await todoPage.addTodo('Активне завдання', 'mon');
    await todoPage.addTodo('Виконане завдання', 'mon');
    await todoPage.toggleTodo('Виконане завдання');

    await todoPage.filterActive.click();

    await expect(todoPage.getTodoItem('Активне завдання')).toBeVisible();
    await expect(todoPage.getTodoItem('Виконане завдання')).toHaveCount(0);
  });

  test('фільтр "Виконані" показує лише виконані завдання', async () => {
    await todoPage.addTodo('Активне', 'tue');
    await todoPage.addTodo('Виконане', 'tue');
    await todoPage.toggleTodo('Виконане');

    await todoPage.filterCompleted.click();

    await expect(todoPage.getTodoItem('Виконане')).toBeVisible();
    await expect(todoPage.getTodoItem('Активне')).toHaveCount(0);
  });

  test('фільтр "Всі" показує всі завдання', async () => {
    await todoPage.addTodo('Перше', 'mon');
    await todoPage.addTodo('Друге', 'mon');
    await todoPage.toggleTodo('Друге');

    await todoPage.filterCompleted.click();
    await todoPage.filterAll.click();

    await expect(todoPage.getTodoItem('Перше')).toBeVisible();
    await expect(todoPage.getTodoItem('Друге')).toBeVisible();
  });
});

test.describe('Лічильник та очищення', () => {
  test('лічильник показує правильну кількість активних завдань (форма множини)', async () => {
    await todoPage.addTodo('Завдання 1', 'mon');
    await todoPage.addTodo('Завдання 2', 'tue');

    await expect(todoPage.itemsCount).toHaveText(/2 завдань/);
  });

  test('лічильник показує правильну форму для одного завдання', async () => {
    await todoPage.addTodo('Єдине завдання', 'mon');

    await expect(todoPage.itemsCount).toHaveText(/1 завдання/);
  });

  test('лічильник зменшується після позначення завдання виконаним', async () => {
    await todoPage.addTodo('Завдання 1', 'mon');
    await todoPage.addTodo('Завдання 2', 'mon');
    await todoPage.toggleTodo('Завдання 1');

    await expect(todoPage.itemsCount).toHaveText(/1 завдання/);
  });

  test('кнопка "Очистити виконані" видаляє всі виконані завдання', async () => {
    await todoPage.addTodo('Залишити', 'mon');
    await todoPage.addTodo('Видалити', 'mon');
    await todoPage.toggleTodo('Видалити');

    await todoPage.clearBtn.click();

    await expect(todoPage.getTodoItem('Залишити')).toBeVisible();
    await expect(todoPage.getTodoItem('Видалити')).toHaveCount(0);
  });
});

test.describe('Збереження даних (localStorage)', () => {
  test('завдання зберігаються після перезавантаження сторінки', async () => {
    await todoPage.addTodo('Збережене завдання', 'thu');

    await todoPage.open();

    await expect(todoPage.getTodoItem('Збережене завдання')).toBeVisible();
  });

  test('стан виконаного завдання зберігається після перезавантаження', async () => {
    await todoPage.addTodo('Виконане збережене', 'fri');
    await todoPage.toggleTodo('Виконане збережене');

    await todoPage.open();

    await expect(todoPage.getTodoItem('Виконане збережене')).toHaveClass(/completed/);
  });
});
