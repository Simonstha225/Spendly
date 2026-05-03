import React, { useEffect, useState } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";

function App() {
  const [expenses, setExpenses] = useState([]);
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [editId, setEditId] = useState(null);

  const [selectedMonth, setSelectedMonth] = useState("");
  const [budget, setBudget] = useState("");

  const API = "https://spendly-7dkt.onrender.com/api/expenses";

  // 📥 Fetch expenses
  const fetchExpenses = async () => {
    const res = await axios.get(API);
    setExpenses(res.data);
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  // 📅 FILTER by month
  const filteredExpenses = selectedMonth
    ? expenses.filter((e) => {
        const month = new Date(e.date).getMonth() + 1;
        return month === Number(selectedMonth);
      })
    : expenses;

  // 💰 TOTAL
  const total = filteredExpenses.reduce(
    (sum, e) => sum + Number(e.amount),
    0
  );

  // 🚨 BUDGET ALERT
  const isOverBudget =
    budget && total > Number(budget);

  // ➕ ADD / ✏️ UPDATE
  const handleSubmit = async () => {
    if (!amount || !category) return;

    const payload = {
      amount,
      category,
      date: new Date().toISOString().split("T")[0],
    };

    if (editId) {
      await axios.put(`${API}/${editId}`, payload);
      setEditId(null);
    } else {
      await axios.post(API, payload);
    }

    setAmount("");
    setCategory("");
    fetchExpenses();
  };

  // ❌ DELETE
  const deleteExpense = async (id) => {
    await axios.delete(`${API}/${id}`);
    fetchExpenses();
  };

  // ✏️ EDIT
  const editExpense = (exp) => {
    setAmount(exp.amount);
    setCategory(exp.category);
    setEditId(exp.id || exp._id);
  };

  // 📊 CHART
  const chartData = {
    labels: filteredExpenses.map((e) => e.category),
    datasets: [
      {
        label: "Spending",
        data: filteredExpenses.map((e) => Number(e.amount)),
        backgroundColor: "#4f46e5",
        borderRadius: 6,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">

      {/* HEADER */}
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        💸 Spendly Dashboard
      </h1>

      {/* BUDGET CARD */}
      <div className="bg-white p-4 rounded-xl shadow mb-4 w-64">
        <p className="text-gray-500">Set Budget</p>
        <input
          className="border p-2 rounded w-full mt-2"
          placeholder="Enter budget"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
        />
      </div>

      {/* ALERT */}
      {budget && (
        <div
          className={`p-3 rounded mb-4 w-fit ${
            isOverBudget
              ? "bg-red-100 text-red-700"
              : "bg-green-100 text-green-700"
          }`}
        >
          {isOverBudget
            ? "⚠️ You exceeded your budget!"
            : "✅ You are within budget"}
        </div>
      )}

      {/* TOTAL */}
      <div className="bg-white p-4 rounded-xl shadow w-64 mb-6">
        <p className="text-gray-500">Total Spending</p>
        <h2 className="text-2xl font-bold text-indigo-600">
          Rs {total}
        </h2>
      </div>

      {/* FORM */}
      <div className="bg-white p-4 rounded-xl shadow flex gap-3 mb-6">
        <input
          className="border p-2 rounded w-full"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        <input
          className="border p-2 rounded w-full"
          placeholder="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />

        <button
          onClick={handleSubmit}
          className="bg-indigo-600 text-white px-4 rounded"
        >
          {editId ? "Update" : "Add"}
        </button>
      </div>

      {/* FILTER */}
      <div className="mb-4">
        <select
          className="border p-2 rounded"
          onChange={(e) => setSelectedMonth(e.target.value)}
        >
          <option value="">All Months</option>
          <option value="1">January</option>
          <option value="2">February</option>
          <option value="3">March</option>
          <option value="4">April</option>
          <option value="5">May</option>
          <option value="6">June</option>
          <option value="7">July</option>
          <option value="8">August</option>
          <option value="9">September</option>
          <option value="10">October</option>
          <option value="11">November</option>
          <option value="12">December</option>
        </select>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* LIST */}
        <div className="bg-white p-4 rounded-xl shadow">
          <h2 className="font-semibold mb-3">Expenses</h2>

          <ul>
            {filteredExpenses.map((e) => (
              <li
                key={e.id || e._id}
                className="flex justify-between items-center border-b py-2"
              >
                <span>
                  Rs {e.amount} - {e.category}
                </span>

                <div className="flex gap-2">
                  <button
                    onClick={() => editExpense(e)}
                    className="text-blue-600"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => deleteExpense(e.id || e._id)}
                    className="text-red-600"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* CHART */}
        <div className="bg-white p-4 rounded-xl shadow">
          <h2 className="font-semibold mb-3">Spending Chart</h2>
          <Bar data={chartData} />
        </div>

      </div>
    </div>
  );
}

export default App;