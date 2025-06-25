import React, { useState, useEffect } from "react";
import "./App.css";

const expenseItems = [
  "1 教職者謝儀", "2 福利厚生費", "2.2 献身者補助", "3 牧会・伝道費", "4 教育研修費",
  "5 講師謝礼", "6 教会学校・ユースミニストリー費", "7 JEC・聖会分担金", "8 宣教費", "9 教職者住宅維持管理費",
  "10 水・光熱費", "11 自動車&交通費", "12 通信・事務費", "13 備品・修理費", "14 交際・慶弔費",
  "15 雑費・その他", "16 指定献金", "17 返済・振替"
];

const expenseGroups = {
  "人件費": [0, 1, 2],
  "伝道費": [3, 4, 5, 6],
  "管理費": [9, 10, 11, 12, 13]
};

const incomeItems = [
  { key: "A", label: "A 什一返金・月定献金" },
  { key: "B", label: "B 礼拝献金" },
  { key: "C", label: "C 特別献金" },
  { key: "D", label: "D 利息・雑収入" },
  { key: "E", label: "E 宣教献金" },
  { key: "EE", label: "EE 献身者指定" },
  { key: "F", label: "F 指定献金" },
  { key: "G", label: "G 一時借入金・振替" }
];

export default function App() {
  const [tab, setTab] = useState("expense");
  const [expenseRecords, setExpenseRecords] = useState([]);
  const [incomeRecords, setIncomeRecords] = useState([]);
  const [selectedExpense, setSelectedExpense] = useState(0);
  const [expenseAmount, setExpenseAmount] = useState("");
  const [selectedIncome, setSelectedIncome] = useState("A");
  const [incomeAmount, setIncomeAmount] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("2025-06");
  const [editIndex, setEditIndex] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [editMonth, setEditMonth] = useState("");

  useEffect(() => {
    const savedExpenses = localStorage.getItem("expenseRecords");
    const savedIncome = localStorage.getItem("incomeRecords");
    if (savedExpenses) setExpenseRecords(JSON.parse(savedExpenses));
    if (savedIncome) setIncomeRecords(JSON.parse(savedIncome));
  }, []);

  useEffect(() => {
    localStorage.setItem("expenseRecords", JSON.stringify(expenseRecords));
    localStorage.setItem("incomeRecords", JSON.stringify(incomeRecords));
  }, [expenseRecords, incomeRecords]);

  const addExpense = () => {
    if (!expenseAmount || isNaN(expenseAmount)) return;
    const newRecord = {
      item: selectedExpense,
      amount: Number(expenseAmount),
      date: new Date().toLocaleString(),
      month: selectedMonth
    };
    setExpenseRecords([...expenseRecords, newRecord]);
    setExpenseAmount("");
  };

  const addIncome = () => {
    if (!incomeAmount || isNaN(incomeAmount)) return;
    const newRecord = {
      item: selectedIncome,
      amount: Number(incomeAmount),
      date: new Date().toLocaleString(),
      month: selectedMonth
    };
    setIncomeRecords([...incomeRecords, newRecord]);
    setIncomeAmount("");
  };

  const deleteRecord = (type, index) => {
    if (type === "expense") {
      setExpenseRecords(expenseRecords.filter((_, i) => i !== index));
    } else {
      setIncomeRecords(incomeRecords.filter((_, i) => i !== index));
    }
  };

  const saveEdit = (type, index) => {
    if (!editValue || isNaN(editValue)) return;
    const updated = type === "expense" ? [...expenseRecords] : [...incomeRecords];
    updated[index].amount = Number(editValue);
    updated[index].month = editMonth;
    type === "expense" ? setExpenseRecords(updated) : setIncomeRecords(updated);
    setEditIndex(null);
    setEditValue("");
    setEditMonth("");
  };

  const filteredExpenseRecords = expenseRecords.filter(rec => rec.month === selectedMonth);
  const filteredIncomeRecords = incomeRecords.filter(rec => rec.month === selectedMonth);

  const expenseSums = Array(expenseItems.length).fill(0);
  filteredExpenseRecords.forEach(rec => expenseSums[rec.item] += rec.amount);
  const totalExpense = expenseSums.reduce((a, b) => a + b, 0);

  const expenseGroupTotals = {};
  for (const [group, indexes] of Object.entries(expenseGroups)) {
    expenseGroupTotals[group] = indexes.reduce((sum, idx) => sum + expenseSums[idx], 0);
  }

  const incomeSums = {};
  incomeItems.forEach(item => incomeSums[item.key] = 0);
  filteredIncomeRecords.forEach(rec => incomeSums[rec.item] += rec.amount);
  const incomeSetTotal = ["A", "B", "C", "D", "E", "EE"].reduce((sum, key) => sum + incomeSums[key], 0);
  const totalIncome = incomeSetTotal + incomeSums.F + incomeSums.G;

  const getPreviousMonth = (monthStr) => {
    const [year, month] = monthStr.split("-").map(Number);
    const date = new Date(year, month - 2);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  };

  const previousMonth = getPreviousMonth(selectedMonth);
  const prevIncome = incomeRecords.filter(r => r.month === previousMonth);
  const prevExpense = expenseRecords.filter(r => r.month === previousMonth);
  const prevIncomeTotal = prevIncome.reduce((sum, r) => sum + r.amount, 0);
  const prevExpenseTotal = prevExpense.reduce((sum, r) => sum + r.amount, 0);
  const carriedOver = prevIncomeTotal - prevExpenseTotal;

  const getIncomeLabel = (key) => {
    const found = incomeItems.find(i => i.key === key);
    return found ? found.label : key;
  };

  const formatAmount = (amount) => {
    return amount < 0 ? `△¥${Math.abs(amount).toLocaleString()}` : `¥${amount.toLocaleString()}`;
  };

  return (
    <div className="container">
      <h1>収支管理アプリ</h1>

      <div className="month-selector">
        <label>月選択：</label>
        <input type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} />
      </div>

      <div className="tabs">
        <button onClick={() => setTab("expense")}>支出</button>
        <button onClick={() => setTab("income")}>収入</button>
      </div>

      {tab === "expense" && (
        <div className="expense">
          <h2>支出入力</h2>
          <select value={selectedExpense} onChange={(e) => setSelectedExpense(Number(e.target.value))}>
            {expenseItems.map((label, index) => (
              <option key={index} value={index}>{label}</option>
            ))}
          </select>
          <input type="number" placeholder="金額（マイナスも可）" value={expenseAmount} onChange={(e) => setExpenseAmount(e.target.value)} />
          <button onClick={addExpense}>追加</button>

          <h3>支出累計一覧（{selectedMonth}）</h3>
          <ul>
            <li><strong>人件費 合計: {formatAmount(expenseGroupTotals["人件費"] || 0)}</strong></li>
            {expenseItems.slice(0, 3).map((label, index) => (
              <li key={index}>{label}: {formatAmount(expenseSums[index])}</li>
            ))}
            <li><strong>伝道費 合計: {formatAmount(expenseGroupTotals["伝道費"] || 0)}</strong></li>
            {expenseItems.slice(3, 7).map((label, index) => (
              <li key={index + 3}>{label}: {formatAmount(expenseSums[index + 3])}</li>
            ))}
            {expenseItems.slice(7, 9).map((label, index) => (
              <li key={index + 7}>{label}: {formatAmount(expenseSums[index + 7])}</li>
            ))}
            <li><strong>管理費 合計: {formatAmount(expenseGroupTotals["管理費"] || 0)}</strong></li>
            {expenseItems.slice(9).map((label, index) => (
              <li key={index + 9}>{label}: {formatAmount(expenseSums[index + 9])}</li>
            ))}
          </ul>

          <h3>支出合計: {formatAmount(totalExpense)}</h3>

          <h4>入力履歴（{selectedMonth}）</h4>
          <ul>
            {filteredExpenseRecords.map((rec, i) => (
              <li key={i}>
                {editIndex === i ? (
                  <>
                    <select value={rec.item} disabled>
                      <option>{expenseItems[rec.item]}</option>
                    </select>
                    <input value={editValue} onChange={(e) => setEditValue(e.target.value)} />
                    <input type="month" value={editMonth} onChange={(e) => setEditMonth(e.target.value)} />
                    <button onClick={() => saveEdit("expense", i)}>保存</button>
                  </>
                ) : (
                  <>
                    {expenseItems[rec.item]} - {formatAmount(rec.amount)} ({rec.date} / {rec.month})
                    <button onClick={() => { setEditIndex(i); setEditValue(rec.amount); setEditMonth(rec.month); }}>✏️</button>
                    <button onClick={() => deleteRecord("expense", i)}>🗑</button>
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {tab === "income" && (
        <div className="income">
          <h2>収入入力</h2>
          <select value={selectedIncome} onChange={(e) => setSelectedIncome(e.target.value)}>
            {incomeItems.map((item) => (
              <option key={item.key} value={item.key}>{item.label}</option>
            ))}
          </select>
          <input type="number" placeholder="金額" value={incomeAmount} onChange={(e) => setIncomeAmount(e.target.value)} />
          <button onClick={addIncome}>追加</button>

          <h3>収入累計一覧（{selectedMonth}）</h3>
          <ul>
            {["A", "B", "C", "D", "E", "EE"].map((key) => (
              <li key={key}>{getIncomeLabel(key)}: {formatAmount(incomeSums[key])}</li>
            ))}
          </ul>
          <h4>A〜EE 合計: {formatAmount(incomeSetTotal)}</h4>

          <ul>
            {["F", "G"].map((key) => (
              <li key={key}>{getIncomeLabel(key)}: {formatAmount(incomeSums[key])}</li>
            ))}
            <li>前月繰越: {formatAmount(carriedOver)}</li>
          </ul>

          <h3>収入合計（A〜G + 繰越）: {formatAmount(totalIncome + carriedOver)}</h3>
          <h3>支出合計: {formatAmount(totalExpense)}</h3>
          <h2>残高: {formatAmount((totalIncome + carriedOver) - totalExpense)}</h2>

          <h4>入力履歴（{selectedMonth}）</h4>
          <ul>
            {filteredIncomeRecords.map((rec, i) => (
              <li key={i}>
                {editIndex === i ? (
                  <>
                    <select value={rec.item} disabled>
                      <option>{getIncomeLabel(rec.item)}</option>
                    </select>
                    <input value={editValue} onChange={(e) => setEditValue(e.target.value)} />
                    <input type="month" value={editMonth} onChange={(e) => setEditMonth(e.target.value)} />
                    <button onClick={() => saveEdit("income", i)}>保存</button>
                  </>
                ) : (
                  <>
                    {getIncomeLabel(rec.item)} - {formatAmount(rec.amount)} ({rec.date} / {rec.month})
                    <button onClick={() => { setEditIndex(i); setEditValue(rec.amount); setEditMonth(rec.month); }}>✏️</button>
                    <button onClick={() => deleteRecord("income", i)}>🗑</button>
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
