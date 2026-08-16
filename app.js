const baseExpenses = [
  { name: "Groceries", category: "Food", amount: 120.5 },
  { name: "Bus pass", category: "Transport", amount: 45 },
  { name: "Internet bill", category: "Bills", amount: 60 },
  { name: "Music app", category: "Subscriptions", amount: 12.99 },
  { name: "Sneakers", category: "Shopping", amount: 90 }
];

const budget = 8420;
const state = {
  expenses: [...baseExpenses]
};

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD"
});

const listElement = document.getElementById("transaction-list");
const barsElement = document.getElementById("expense-bars");
const form = document.getElementById("expense-form");

if (listElement && barsElement) {
  renderAll();
}

if (form) {
  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const name = (formData.get("name") || "").toString().trim();
    const category = (formData.get("category") || "").toString();
    const amount = Number(formData.get("amount"));

    if (!name || !Number.isFinite(amount) || amount <= 0) {
      return;
    }

    state.expenses.unshift({ name, category, amount });
    form.reset();
    renderAll();
  });
}

function renderAll() {
  renderTransactions();
  renderBreakdown();
  renderStats();
}

function renderTransactions() {
  listElement.innerHTML = "";

  state.expenses.slice(0, 8).forEach((expense) => {
    const item = document.createElement("li");
    item.className = "transaction";
    item.innerHTML = `<span>${escapeText(expense.name)} · ${escapeText(expense.category)}</span><strong>${currency.format(expense.amount)}</strong>`;
    listElement.appendChild(item);
  });
}

function renderBreakdown() {
  barsElement.innerHTML = "";

  const totals = state.expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {});

  const max = Math.max(...Object.values(totals), 1);

  Object.entries(totals)
    .sort((a, b) => b[1] - a[1])
    .forEach(([category, value]) => {
      const item = document.createElement("div");
      item.className = "bar-item";
      const percentage = Math.round((value / max) * 100);
      item.innerHTML = `
        <div><strong>${escapeText(category)}</strong> <span>${currency.format(value)}</span></div>
        <div class="bar-track" role="img" aria-label="${escapeText(category)} ${percentage}% of top category">
          <div class="bar-fill" style="width:${percentage}%;"></div>
        </div>
      `;
      barsElement.appendChild(item);
    });
}

function renderStats() {
  const spent = state.expenses.reduce((sum, item) => sum + item.amount, 0);
  const balance = budget - spent;

  const categoryTotals = state.expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {});

  const topCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0]?.[0] || "—";

  setText("total-balance", currency.format(balance));
  setText("month-spent", currency.format(spent));
  setText("top-category", topCategory);
}

function setText(id, text) {
  const element = document.getElementById(id);
  if (element) {
    element.textContent = text;
  }
}

function escapeText(value) {
  return value.replace(/[&<>'"]/g, (char) => {
    const map = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "'": "&#39;",
      '"': "&quot;"
    };
    return map[char];
  });
}
