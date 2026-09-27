(() => {
  "use strict";

  const STORAGE_KEY = "taskflow.tasks.v1";
  const form = document.querySelector("#task-form");
  const input = document.querySelector("#task-input");
  const list = document.querySelector("#task-list");
  const emptyState = document.querySelector("#empty-state");
  const emptyTitle = document.querySelector("#empty-title");
  const emptyCopy = document.querySelector("#empty-copy");
  const formError = document.querySelector("#form-error");
  const allCount = document.querySelector("#all-count");
  const remainingCount = document.querySelector("#remaining-count");
  const progressRing = document.querySelector(".progress-ring");
  const progressNumber = document.querySelector("#progress-number");
  const clearCompletedButton = document.querySelector("#clear-completed");
  const filters = [...document.querySelectorAll("[data-filter]")];
  const editDialog = document.querySelector("#edit-dialog");
  const editForm = document.querySelector("#edit-form");
  const editInput = document.querySelector("#edit-input");
  const toast = document.querySelector("#toast");

  let tasks = loadTasks();
  let activeFilter = "all";
  let editingId = null;
  let toastTimeout;

  function loadTasks() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      if (!Array.isArray(saved)) return [];
      return saved.filter(task =>
        task && typeof task.id === "string" &&
        typeof task.text === "string" &&
        typeof task.completed === "boolean"
      );
    } catch (error) {
      console.warn("Could not read saved tasks:", error);
      return [];
    }
  }

  function saveTasks() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
      return true;
    } catch (error) {
      console.error("Could not save tasks:", error);
      showToast("Could not save changes. Check your browser storage.");
      return false;
    }
  }

  function makeId() {
    return typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => toast.classList.remove("show"), 2600);
  }

  function formatDate() {
    const now = new Date();
    return new Intl.DateTimeFormat(undefined, {
      weekday: "long", month: "long", day: "numeric"
    }).format(now);
  }

  function makeIconButton(label, icon, extraClass = "") {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `icon-button ${extraClass}`.trim();
    button.setAttribute("aria-label", label);
    button.title = label;
    button.textContent = icon;
    return button;
  }

  function render() {
    const visibleTasks = tasks.filter(task =>
      activeFilter === "all" ||
      (activeFilter === "active" && !task.completed) ||
      (activeFilter === "completed" && task.completed)
    );
    const completed = tasks.filter(task => task.completed).length;
    const remaining = tasks.length - completed;
    const progress = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;

    list.replaceChildren();
    visibleTasks.forEach(task => {
      const item = document.createElement("li");
      item.className = `task-item${task.completed ? " completed" : ""}`;

      const check = document.createElement("button");
      check.type = "button";
      check.className = "check-button";
      check.setAttribute("aria-label", task.completed ? `Mark "${task.text}" active` : `Complete "${task.text}"`);
      check.setAttribute("aria-pressed", String(task.completed));
      if (task.completed) {
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("viewBox", "0 0 16 16");
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("d", "m3 8 3.2 3.2L13 4.5");
        svg.append(path);
        check.append(svg);
      }
      check.addEventListener("click", () => toggleTask(task.id));

      const text = document.createElement("span");
      text.className = "task-text";
      text.textContent = task.text;

      const actions = document.createElement("div");
      actions.className = "task-actions";
      const edit = makeIconButton("Edit task", "✎");
      edit.addEventListener("click", () => openEdit(task.id));
      const remove = makeIconButton("Delete task", "⌫", "delete");
      remove.addEventListener("click", () => deleteTask(task.id));
      actions.append(edit, remove);
      item.append(check, text, actions);
      list.append(item);
    });

    allCount.textContent = String(tasks.length);
    remainingCount.textContent = `${remaining} ${remaining === 1 ? "task" : "tasks"} left`;
    progressNumber.textContent = `${progress}%`;
    progressRing.style.setProperty("--progress", `${progress}%`);
    clearCompletedButton.disabled = completed === 0;
    emptyState.hidden = visibleTasks.length !== 0;
    if (activeFilter === "active") {
      emptyTitle.textContent = "All caught up!";
      emptyCopy.textContent = "There are no active tasks right now.";
    } else if (activeFilter === "completed") {
      emptyTitle.textContent = "Nothing completed yet";
      emptyCopy.textContent = "Finished tasks will show up here.";
    } else {
      emptyTitle.textContent = "Your list is clear";
      emptyCopy.textContent = "Add a task above and take the first step.";
    }
  }

  function addTask(text) {
    const cleanText = text.trim();
    if (!cleanText) {
      formError.textContent = "Please enter a task before adding it.";
      formError.hidden = false;
      input.focus();
      return;
    }
    tasks.unshift({ id: makeId(), text: cleanText, completed: false, createdAt: Date.now() });
    saveTasks();
    activeFilter = "all";
    updateFilters();
    render();
    form.reset();
    formError.hidden = true;
    input.focus();
    showToast("Task added to your list.");
  }

  function toggleTask(id) {
    tasks = tasks.map(task => task.id === id ? { ...task, completed: !task.completed } : task);
    saveTasks();
    render();
  }

  function deleteTask(id) {
    tasks = tasks.filter(task => task.id !== id);
    saveTasks();
    render();
    showToast("Task deleted.");
  }

  function openEdit(id) {
    const task = tasks.find(item => item.id === id);
    if (!task) return;
    editingId = id;
    editInput.value = task.text;
    editDialog.showModal();
    editInput.focus();
    editInput.select();
  }

  function updateFilters() {
    filters.forEach(button => {
      const selected = button.dataset.filter === activeFilter;
      button.classList.toggle("active", selected);
      button.setAttribute("aria-pressed", String(selected));
    });
  }

  form.addEventListener("submit", event => {
    event.preventDefault();
    addTask(input.value);
  });

  input.addEventListener("input", () => {
    if (input.value.trim()) formError.hidden = true;
  });

  filters.forEach(button => button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;
    updateFilters();
    render();
  }));

  clearCompletedButton.addEventListener("click", () => {
    const completedCount = tasks.filter(task => task.completed).length;
    if (!completedCount) return;
    tasks = tasks.filter(task => !task.completed);
    saveTasks();
    render();
    showToast(`Cleared ${completedCount} completed ${completedCount === 1 ? "task" : "tasks"}.`);
  });

  editForm.addEventListener("submit", event => {
    event.preventDefault();
    const cleanText = editInput.value.trim();
    if (!cleanText) {
      editInput.setCustomValidity("Please enter a task name.");
      editInput.reportValidity();
      return;
    }
    tasks = tasks.map(task => task.id === editingId ? { ...task, text: cleanText } : task);
    saveTasks();
    editDialog.close();
    render();
    showToast("Task updated.");
  });

  editInput.addEventListener("input", () => editInput.setCustomValidity(""));
  document.querySelector("#close-dialog").addEventListener("click", () => editDialog.close());
  document.querySelector("#cancel-edit").addEventListener("click", () => editDialog.close());
  editDialog.addEventListener("close", () => { editingId = null; });

  document.querySelector("#date-label").textContent = formatDate();
  render();
})();
