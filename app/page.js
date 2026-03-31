"use client";

import React, { useState } from "react";

export default function VisitLog() {
  const [logs, setLogs] = useState([]);
  const [form, setForm] = useState({
    customer: "",
    salesperson: "",
    result: "",
    notes: "",
  });

  const save = () => {
    if (!form.customer || !form.salesperson) {
      alert("Customer ve Salesperson zorunlu");
      return;
    }
    setLogs([{ ...form, id: Date.now() }, ...logs]);
    setForm({ customer: "", salesperson: "", result: "", notes: "" });
  };

  return (
    <div style={{ padding: 40, fontFamily: "Arial" }}>
      <h1>Visit Log System 🚀</h1>

      <div style={{ marginBottom: 20 }}>
        <input
          placeholder="Customer"
          value={form.customer}
          onChange={(e) => setForm({ ...form, customer: e.target.value })}
        />
        <input
          placeholder="Salesperson"
          value={form.salesperson}
          onChange={(e) => setForm({ ...form, salesperson: e.target.value })}
        />
        <input
          placeholder="Result"
          value={form.result}
          onChange={(e) => setForm({ ...form, result: e.target.value })}
        />
        <input
          placeholder="Notes"
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
        />

        <button onClick={save}>Kaydet</button>
      </div>

      <h2>Visit List</h2>

      {logs.map((log) => (
        <div key={log.id} style={{ border: "1px solid #ccc", margin: 10, padding: 10 }}>
          <b>{log.customer}</b> - {log.salesperson}
          <div>{log.result}</div>
          <div>{log.notes}</div>
        </div>
      ))}
    </div>
  );
}
