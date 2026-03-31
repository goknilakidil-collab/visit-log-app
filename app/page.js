"use client";

import React, { useMemo, useState } from "react";

// ================= AI FUNCTION =================
function aiAnalyze(log) {
  if (!log) return null;

  const text = `${log.notes || ""} ${log.result || ""}`.toLowerCase();

  let score = 50;
  let risks = [];
  let actions = [];

  if (text.includes("fiyat") || text.includes("revizyon")) {
    score += 10;
    risks.push("Fiyat hassasiyeti yüksek");
    actions.push("Revize teklif + value selling yapılmalı");
  }

  if (text.includes("rakip")) {
    score += 15;
    actions.push("Rakip zayıflığı agresif kullanılmalı");
  }

  if (text.includes("sample")) {
    score += 10;
    actions.push("Sample süreci hızlandırılmalı");
  }

  if (!log.followUp) {
    score -= 10;
    risks.push("Follow-up tarihi yok");
  }

  return {
    score: Math.min(score, 95),
    priority: score > 75 ? "High" : score > 60 ? "Medium" : "Low",
    nextAction: actions[0] || "Müşteri ile tekrar temas kurulmalı",
    risks: risks.length ? risks : ["Belirgin risk yok"],
    actions: actions.length ? actions : ["Standart follow-up yap"],
  };
}

// ================= ORIGINAL CODE =================

const visitResults = [
  "Follow-up visit planned",
  "Close follow-up required",
  "Customer will be called",
  "Order expected",
  "Regular visit required",
  "Revised offer to be shared",
  "Put on hold",
  "Management-level follow-up required",
];

export default function VisitLogModule() {
  const [activeTab, setActiveTab] = useState("entry");
  const [logs, setLogs] = useState([]);
  const [selectedLog, setSelectedLog] = useState(null);

  return (
    <div style={{ padding: 40 }}>
      <h1>Visit Log Module</h1>

      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={() => setActiveTab("entry")}>Entry</button>
        <button onClick={() => setActiveTab("list")}>List</button>
        <button onClick={() => setActiveTab("ai")}>AI Insights</button>
      </div>

      {activeTab === "entry" && <div>Entry Screen</div>}

      {activeTab === "list" && (
        <div>
          {logs.map((log, i) => (
            <div key={i} onClick={() => setSelectedLog(log)}>
              {log.customer}
            </div>
          ))}
        </div>
      )}

      {activeTab === "ai" && selectedLog && (
        <div style={{ marginTop: 20 }}>
          {(() => {
            const ai = aiAnalyze(selectedLog);

            return (
              <div style={{ display: "grid", gap: 12 }}>
                <div>
                  <b>Score:</b> {ai.score}
                </div>

                <div>
                  <b>Priority:</b> {ai.priority}
                </div>

                <div>
                  <b>Next Action:</b> {ai.nextAction}
                </div>

                <div>
                  <b>Risks:</b>
                  {ai.risks.map((r, i) => (
                    <div key={i}>• {r}</div>
                  ))}
                </div>

                <div>
                  <b>Actions:</b>
                  {ai.actions.map((a, i) => (
                    <div key={i}>• {a}</div>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
