import React, { useEffect, useState } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";

function App() {
  // ==================== AUTH STATE ====================
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [authError, setAuthError] = useState("");

  // ==================== EXPENSE STATE ====================
  const [expenses, setExpenses] = useState([]);
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [editId, setEditId] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [budget, setBudget] = useState("");

  // ==================== API URLS ====================
  const API = "https://spendly-7dkt.onrender.com/api/expenses";
  const AUTH = "https://spendly-7dkt.onrender.com/api/auth";

  // Every request includes the token in the header
  const authHeaders = {
    headers: { Authorization: `Bearer ${token}` }
  };

  // ==================== FETCH EXPENSES ====================
  const fetchExpenses = async () => {
    if (!token) return;
    const res = await axios.get(API, authHeaders);
    setExpenses(res.data);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchExpenses();
  }, [token]); // re-fetch when token changes (after login)

  // ==================== LOGIN / REGISTER ====================
  const handleAuth = async () => {
    setAuthError("");
    if (!email || !password) {
      setAuthError("Please enter email and password");
      return;
    }
    try {
      const url = isLogin ? `${AUTH}/login` : `${AUTH}/register`;
      const res = await axios.post(url, { email, password });

      if (res.data.token) {
        // Login successful - save token
        localStorage.setItem("token", res.data.token);
        setToken(res.data.token);
      } else if (res.data.message) {
        // Register successful
        setAuthError("Registered! Please login now.");
        setIsLogin(true);
      } else if (res.data.error) {
        setAuthError(res.data.error);
      }
    } catch (err) {
      setAuthError("Something went wrong. Try again.");
    }
  };

  // ==================== LOGOUT ====================
  const logout = () => {
    localStorage.removeItem("token");
    setToken("");
    setExpenses([]);
  };

  // ==================== FILTER BY MONTH ====================
  const filteredExpenses = selectedMonth
    ? expenses.filter((e) => {
        const month = new Date(e.date).getMonth() + 1;
        return month === Number(selectedMonth);
      })
    : expenses;

  // ==================== TOTAL ====================
  const total = filteredExpenses.reduce(
    (sum, e) => sum + Number(e.amount), 0
  );

  // ==================== BUDGET ALERT ====================
  const isOverBudget = budget && total > Number(budget);

  // ==================== ADD / UPDATE ====================
  const handleSubmit = async () => {
    if (!amount || !category) return;

    const payload = {
      amount,
      category,
      date: new Date().toISOString().split("T")[0],
    };

    if (editId) {
      await axios.put(`${API}/${editId}`, payload, authHeaders);
      setEditId(null);
    } else {
      await axios.post(API, payload, authHeaders);
    }

    setAmount("");
    setCategory("");
    fetchExpenses();
  };

  // ==================== DELETE ====================
  const deleteExpense = async (id) => {
    await axios.delete(`${API}/${id}`, authHeaders);
    fetchExpenses();
  };

  // ==================== EDIT ====================
  const editExpense = (exp) => {
    setAmount(exp.amount);
    setCategory(exp.category);
    setEditId(exp.id || exp._id);
  };

  // ==================== CHART DATA ====================
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

  // ==================== LOGIN/REGISTER SCREEN ====================
  // If no token, show login page instead of dashboard
  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-xl shadow-lg w-96">

          {/* Title */}
          <h1 className="text-3xl font-bold text-indigo-600 mb-2 text-center">
            💸 Spendly
          </h1>
          <p className="text-center text-gray-500 mb-6">
            {isLogin ? "Login to your account" : "Create a new account"}
          </p>

          {/* Error message */}
          {authError && (
            <div className="bg-red-100 text-red-700 p-2 rounded mb-4 text-sm">
              {authError}
            </div>
          )}

          {/* Email input */}
          <input
            className="border p-2 rounded w-full mb-3"
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          {/* Password input */}
          <input
            className="border p-2 rounded w-full mb-4"
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {/* Submit button */}
          <button
            onClick={handleAuth}
            className="bg-indigo-600 text-white p-2 rounded w-full mb-3 hover:bg-indigo-700"
          >
            {isLogin ? "Login" : "Register"}
          </button>

          {/* Toggle login/register */}
          <p
            className="text-center text-sm cursor-pointer text-indigo-600 hover:underline"
            onClick={() => {
              setIsLogin(!isLogin);
              setAuthError("");
            }}
          >
            {isLogin
              ? "No account? Register here"
              : "Already have account? Login"}
          </p>

        </div>
      </div>
    );
  }

  // ==================== MAIN DASHBOARD ====================
  return (
    <div className="min-h-screen bg-gray-100 p-6">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          💸 Spendly Dashboard
        </h1>
        {/* Logout button */}
        <button
          onClick={logout}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>

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

      {/* BUDGET ALERT */}
      {budget && (
        <div className={`p-3 rounded mb-4 w-fit ${
          isOverBudget
            ? "bg-red-100 text-red-700"
            : "bg-green-100 text-green-700"
        }`}>
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
          className="bg-indigo-600 text-white px-4 rounded hover:bg-indigo-700"
        >
          {editId ? "Update" : "Add"}
        </button>
      </div>

      {/* MONTH FILTER */}
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

      {/* GRID - LIST + CHART */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* EXPENSE LIST */}
        <div className="bg-white p-4 rounded-xl shadow">
          <h2 className="font-semibold mb-3">Expenses</h2>
          <ul>
            {filteredExpenses.map((e) => (
              <li
                key={e.id || e._id}
                className="flex justify-between items-center border-b py-2"
              >
                <span>Rs {e.amount} - {e.category}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => editExpense(e)}
                    className="text-blue-600 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteExpense(e.id || e._id)}
                    className="text-red-600 hover:underline"
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