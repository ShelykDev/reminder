// ========================================================================
//  СПИСОК ЗАВДАНЬ — логіка
// ========================================================================

// --- 1. Знаходимо потрібні елементи на сторінці ---
const form = document.getElementById("todo-form");
const input = document.getElementById("todo-input");
const daySelect = document.getElementById("day-select");
const list = document.getElementById("todo-list");
const filterButtons = document.querySelectorAll(".filter-btn");
const itemsCount = document.getElementById("items-count");
const clearCompletedBtn = document.getElementById("clear-completed");

// Дні тижня у порядку відображення (тиждень починається з понеділка)
const DAYS = [
  { key: "mon", label: "Понеділок" },
  { key: "tue", label: "Вівторок" },
  { key: "wed", label: "Середа" },
  { key: "thu", label: "Четвер" },
  { key: "fri", label: "П'ятниця" },
  { key: "sat", label: "Субота" },
  { key: "sun", label: "Неділя" },
];

// Який день тижня сьогодні (getDay(): 0 = Нд ... 6 = Сб)
const TODAY_KEY = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"][
  new Date().getDay()
];

// --- 2. Стан застосунку (дані, що живуть у пам'яті) ---
// Кожне завдання — це об'єкт: { id, text, completed }
let todos = [];
// Поточний активний фільтр: "all" | "active" | "completed"
let currentFilter = "all";

const STORAGE_KEY = "todos"; // ключ, під яким зберігаємо в localStorage

// ========================================================================
//  РОБОТА З localStorage
// ========================================================================

// Зберегти масив завдань у браузер
function saveTodos() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

// Завантажити завдання при відкритті сторінки
function loadTodos() {
  const saved = localStorage.getItem(STORAGE_KEY);
  todos = saved ? JSON.parse(saved) : [];

  // Старі завдання без дня — призначаємо понеділок, щоб вони не зникли
  todos.forEach((todo) => {
    if (!todo.day) todo.day = "mon";
  });
}

// ========================================================================
//  ФІЛЬТРАЦІЯ
// ========================================================================

// Повертає лише ті завдання, що підходять під поточний фільтр
function getFilteredTodos() {
  if (currentFilter === "active") {
    return todos.filter((todo) => !todo.completed);
  }
  if (currentFilter === "completed") {
    return todos.filter((todo) => todo.completed);
  }
  return todos; // "all"
}

// ========================================================================
//  ВІДОБРАЖЕННЯ (рендеринг)
// ========================================================================

// Створює один елемент завдання (<li>)
function createTodoItem(todo) {
  const li = document.createElement("li");
  li.className = "todo-item" + (todo.completed ? " completed" : "");

  // Чекбокс "виконано"
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = todo.completed;
  checkbox.addEventListener("change", () => toggleTodo(todo.id));

  // Текст завдання
  const span = document.createElement("span");
  span.className = "text";
  span.textContent = todo.text;

  // Кнопка видалення
  const deleteBtn = document.createElement("button");
  deleteBtn.className = "delete-btn";
  deleteBtn.textContent = "✕";
  deleteBtn.addEventListener("click", () => deleteTodo(todo.id));

  li.appendChild(checkbox);
  li.appendChild(span);
  li.appendChild(deleteBtn);
  return li;
}

// Перемальовує всю сторінку: 7 розділів (по одному на день тижня)
function render() {
  list.innerHTML = ""; // очищаємо перед перемальовуванням

  const visibleTodos = getFilteredTodos(); // завдання з урахуванням фільтра

  // Проходимо по всіх семи днях у фіксованому порядку
  DAYS.forEach((day) => {
    // Завдання саме цього дня (вже відфільтровані)
    const dayTodos = visibleTodos.filter((todo) => todo.day === day.key);

    // Розділ дня (клас day-<ключ> дозволяє розфарбувати кожен день окремо)
    const section = document.createElement("div");
    section.className =
      `day-section day-${day.key}` + (day.key === TODAY_KEY ? " today" : "");

    // Заголовок дня + кількість завдань
    const header = document.createElement("div");
    header.className = "day-header";
    header.innerHTML =
      `<span>${day.label}</span>` +
      `<span class="day-count">${dayTodos.length}</span>`;
    section.appendChild(header);

    if (dayTodos.length > 0) {
      // Список завдань цього дня
      const ul = document.createElement("ul");
      dayTodos.forEach((todo) => ul.appendChild(createTodoItem(todo)));
      section.appendChild(ul);
    } else {
      // Порожній день — показуємо підказку
      const empty = document.createElement("div");
      empty.className = "day-empty";
      empty.textContent = "Немає завдань";
      section.appendChild(empty);
    }

    list.appendChild(section);
  });

  // Оновлюємо лічильник активних завдань
  const activeCount = todos.filter((todo) => !todo.completed).length;
  itemsCount.textContent =
    activeCount + (activeCount === 1 ? " завдання" : " завдань");
}

// ========================================================================
//  ДІЇ НАД ЗАВДАННЯМИ
// ========================================================================

// Додати нове завдання
function addTodo(text) {
  const trimmed = text.trim();
  if (!trimmed) return; // не додаємо порожні

  todos.push({
    id: Date.now(), // унікальний id на основі часу
    text: trimmed,
    completed: false,
    day: daySelect.value, // день тижня, обраний у випадаючому списку
  });

  saveTodos();
  render();
}

// Перемкнути статус "виконано / не виконано"
function toggleTodo(id) {
  const todo = todos.find((t) => t.id === id);
  if (todo) {
    todo.completed = !todo.completed;
    saveTodos();
    render();
  }
}

// Видалити завдання
function deleteTodo(id) {
  todos = todos.filter((t) => t.id !== id);
  saveTodos();
  render();
}

// Видалити всі виконані завдання
function clearCompleted() {
  todos = todos.filter((t) => !t.completed);
  saveTodos();
  render();
}

// ========================================================================
//  ОБРОБНИКИ ПОДІЙ
// ========================================================================

// Сабміт форми (кнопка "Додати" або Enter)
form.addEventListener("submit", (event) => {
  event.preventDefault(); // не перезавантажуємо сторінку
  addTodo(input.value);
  input.value = ""; // очищаємо поле
  input.focus();
});

// Перемикання фільтрів (тоґли)
filterButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    currentFilter = btn.dataset.filter; // читаємо data-filter

    // Підсвічуємо натиснуту кнопку, знімаємо підсвітку з інших
    filterButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    render();
  });
});

// Кнопка "Очистити виконані"
clearCompletedBtn.addEventListener("click", clearCompleted);

// ========================================================================
//  СТАРТ
// ========================================================================

daySelect.value = TODAY_KEY; // за замовчуванням обираємо сьогоднішній день
loadTodos();                 // читаємо збережені завдання
render();                    // показуємо їх на сторінці
