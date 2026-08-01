const balanceEl = document.getElementById("balance");
const incomeAmountEl = document.getElementById("income-amount");
const expenseAmountEl = document.getElementById("expense-amount");
const transactionListEl = document.getElementById("transaction-list");
const transactionFormEl = document.getElementById("transaction-form");
const descriptionEl = document.getElementById("description");
const amountEl = document.getElementById("amount");
const categoryEl = document.getElementById("category");
// Add budget limit constant
const FOOD_BUDGET_LIMIT = 200;

let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

transactionFormEl.addEventListener("submit", addTransaction);

// function addTransaction(e) {
//   e.preventDefault();

//   // get form values
//   const description = descriptionEl.value.trim();
//   const amount = parseFloat(amountEl.value);

//   transactions.push({
//     id: Date.now(),
//     description,
//     amount,
//   });

//   localStorage.setItem("transactions", JSON.stringify(transactions));

//   updateTransactionList();
//   updateSummary();

//   transactionFormEl.reset();
// }

function addTransaction(e) {
  e.preventDefault();

  const description = descriptionEl.value.trim();
  let amount = Math.abs(parseFloat(amountEl.value)); // Force positive base
  const type = document.getElementById("type").value; // Read dropdown
  const category = categoryEl ? categoryEl.value : "General"; // Read category

  if (isNaN(amount)) return;

  const currentBalance = transactions.reduce((acc, t) => acc + t.amount, 0);

  // Checks and conversions for expenses
  if (type === "expense") {
    // 1. Check total balance
    if (amount > currentBalance) {
      alert("Warning: Insufficient balance for this expense!");
      return;
    }

    // 👇 FIT THE FOOD ALERT HERE 👇
    const currentFoodSpent = transactions
      .filter((t) => t.amount < 0 && (t.category === "Food" || !t.category))
      .reduce((acc, t) => acc + Math.abs(t.amount), 0);

    if (
      (category === "Food" || !categorySelect) &&
      currentFoodSpent + amount > FOOD_BUDGET_LIMIT
    ) {
      alert(
        `Warning: This expense exceeds your $${FOOD_BUDGET_LIMIT} Food budget limit!`,
      );
    }

    // Convert amount to negative
    amount = -amount;
  }

  // Save transaction including category
  transactions.push({ id: Date.now(), description, amount, category });

  localStorage.setItem("transactions", JSON.stringify(transactions));
  updateTransactionList();
  updateSummary();
  updateBudgetUI(); // Update Budget bar
  transactionFormEl.reset();
}

function updateTransactionList() {
  transactionListEl.innerHTML = "";

  const sortedTransactions = [...transactions].reverse();

  sortedTransactions.forEach((transaction) => {
    const transactionEl = createTransactionElement(transaction);
    transactionListEl.appendChild(transactionEl);
  });
}

function createTransactionElement(transaction) {
  // Add category emojis mapping
  const categoryEmojis = {
    Food: "🍔",
    Transport: "🚗",
    Entertainment: "🎬",
    General: "📦",
  };

  const li = document.createElement("li");
  li.classList.add("transaction");
  li.classList.add(transaction.amount > 0 ? "income" : "expenses");

  li.innerHTML = `
    <span>${transaction.description}</span>
    <span>
  
    ${formatCurrency(transaction.amount)}
      <button class="delete-btn" onclick="removeTransaction(${transaction.id})">x</button>
    </span>
  `;

  return li;
}

function updateSummary() {
  // 100, -50, 200, -200 => 50
  const balance = transactions.reduce(
    (acc, transaction) => acc + transaction.amount,
    0,
  );

  const income = transactions
    .filter((transaction) => transaction.amount > 0)
    .reduce((acc, transaction) => acc + Math.abs(transaction.amount), 0);

  const expenses = transactions
    .filter((transaction) => transaction.amount < 0)
    .reduce((acc, transaction) => acc + Math.abs(transaction.amount), 0);

  // update ui => todo: fix the formatting
  balanceEl.textContent = formatCurrency(balance);
  incomeAmountEl.textContent = formatCurrency(income);
  expenseAmountEl.textContent = formatCurrency(expenses);
}

function formatCurrency(number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(number);
}

function removeTransaction(id) {
  // filter out the one we wanted to delete
  transactions = transactions.filter((transaction) => transaction.id !== id);

  localStorage.setItem("transactions", JSON.stringify(transactions));

  updateTransactionList();
  updateSummary();
}

function updateBudgetUI() {
  const foodSpent = transactions
    .filter((t) => t.amount < 0 && t.category === "Food")
    .reduce((acc, t) => acc + Math.abs(t.amount), 0);

  const percentage = Math.min((foodSpent / FOOD_BUDGET_LIMIT) * 100, 100);

  const progressBar = document.getElementById("food-progress");
  const budgetStatus = document.getElementById("budget-status");

  if (progressBar && budgetStatus) {
    progressBar.style.width = `${percentage}%`;
    budgetStatus.textContent = `$${foodSpent.toFixed(2)} / $${FOOD_BUDGET_LIMIT.toFixed(2)} spent`;

    if (percentage >= 80) {
      progressBar.classList.add("warning");
    } else {
      progressBar.classList.remove("warning");
    }
  }
}

// initial render
updateTransactionList();
updateSummary();
updateBudgetUI();
