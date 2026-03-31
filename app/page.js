"use client";

import React, { useMemo, useState } from "react";

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

const purposes = [
  "Sales Opportunity",
  "Routine Visit / Status Check",
  "EP Training",
  "Complaint",
  "Networking / Relationship",
  "Sales Opportunity (Call)",
];

const initialLogs = [
  {
    id: "V0041",
    date: "2026-03-31",
    salesperson: "Özlem Köseoğlu",
    customer: "SBS Tekstil",
    brand: "Zara, Pull&Bear",
    purpose: "Sales Opportunity",
    result: "Revised offer to be shared",
    followUp: "2026-04-07",
    monthlyOpportunity: "120000",
    yearlyOpportunity: "1440000",
    responsibleKAM: "Göknil Akidil",
    notes:
      "Care label ve woven label tarafında potansiyel mevcut. Fiyat revizyonu bekleniyor. Rakipte servis problemi olduğu paylaşıldı. Sample sonrası hızlı karar verebileceklerini söylediler.",
  },
  {
    id: "V0040",
    date: "2026-03-30",
    salesperson: "İsmail Güneş",
    customer: "Dima Tekstil",
    brand: "Zara",
    purpose: "Routine Visit / Status Check",
    result: "Follow-up visit planned",
    followUp: "2026-04-04",
    monthlyOpportunity: "52500",
    yearlyOpportunity: "630000",
    responsibleKAM: "Göknil Akidil",
    notes:
      "Rutin ziyaret yapıldı. Önümüzdeki hafta sample durumu ve termin beklentisi için tekrar görüşülecek.",
  },
];

const emptyForm = {
  date: new Date().toISOString().slice(0, 10),
  salesperson: "",
  customer: "",
  brand: "",
  purpose: "",
  result: "",
  followUp: "",
  monthlyOpportunity: "",
  yearlyOpportunity: "",
  responsibleKAM: "",
  notes: "",
};

function aiAnalyze(form) {
  const text = `${form.notes || ""} ${form.result || ""} ${form.purpose || ""}`.toLowerCase();

  let score = 52;
  const reasons = [];
  const risks = [];
  const actions = [];

  if (text.includes("sample")) {
    score += 8;
    reasons.push("Müşteri sample üzerinden ilerlemeye açık görünüyor.");
    actions.push("Sample planını tarih ve sorumlu ile netleştir.");
  }

  if (
    text.includes("fiyat") ||
    text.includes("revizyon") ||
    text.includes("price")
  ) {
    score += 6;
    risks.push("Fiyat hassasiyeti yüksek olabilir.");
    actions.push("Revize teklif sunarken servis ve lead time avantajını birlikte vurgula.");
  }

  if (text.includes("rakip") || text.includes("servis problemi")) {
    score += 10;
    reasons.push("Rakip zafiyeti var; bu fırsat penceresi yaratıyor.");
    actions.push("Rakibe kıyasla teslimat güveni ve servis hızını öne çıkar.");
  }

  if (text.includes("bekliyor") || text.includes("pending")) {
    risks.push("Karar süreci uzayabilir.");
  }

  if (text.includes("order") || text.includes("sipariş")) {
    score += 10;
    reasons.push("Siparişe dönüşme sinyali mevcut.");
  }

  if (form.result === "Order expected") {
    score += 14;
    actions.push("PO kapanışı için net tarih al ve iç ekipleri önceden hizala.");
  }

  if (form.result === "Management-level follow-up required") {
    score -= 6;
    risks.push("Kararın üst yönetim seviyesinde tıkanma ihtimali var.");
    actions.push("Üst yönetim toplantısı için net agenda ve ticari teklif hazırla.");
  }

  if (!form.followUp) {
    score -= 8;
    risks.push("Follow-up tarihi tanımlı değil.");
    actions.push("İlk iş olarak bir follow-up tarihi belirle.");
  }

  score = Math.max(25, Math.min(92, score));

  const priority = score >= 75 ? "High" : score >= 60 ? "Medium" : "Normal";
  const nextStep =
    actions[0] || "Müşteriyle bir sonraki adımı netleştir ve iç ekiplerle paylaş.";

  const mail = `Dear Team,

AI review based on the latest visit note suggests a ${priority.toLowerCase()} priority follow-up for ${
    form.customer || "this customer"
  }.

Recommended next action: ${nextStep}
Win probability score: ${score}/100
Main risk: ${risks[0] || "No major risk flagged"}

Best regards`;

  return {
    score,
    priority,
    summary:
      reasons[0] ||
      "Not içeriğine göre müşteriyle ilerleme fırsatı mevcut, ancak takip disiplini kritik.",
    reasons: reasons.length ? reasons : ["Müşteriyle ilerleme sinyali var."],
    risks: risks.length ? risks : ["Belirgin kritik risk işaretlenmedi."],
    actions: actions.length ? actions : ["Kısa bir follow-up planı oluştur."],
    nextStep,
    suggestedMail: mail,
  };
}

export default function VisitLogAIModule() {
  const [activeTab, setActiveTab] = useState("entry");
  const [logs, setLogs] = useState(initialLogs);
  const [selectedLog, setSelectedLog] = useState(initialLogs[0]);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState("");

  const aiOutput = useMemo(() => aiAnalyze(form), [form]);
  const selectedAI = useMemo(
    () => aiAnalyze(selectedLog || emptyForm),
    [selectedLog]
  );

  function updateForm(key, value) {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "monthlyOpportunity") {
        const monthly = Number(value || 0);
        next.yearlyOpportunity = monthly > 0 ? String(monthly * 12) : "";
      }
      return next;
    });
  }

  function saveVisit() {
    if (!form.customer || !form.salesperson || !form.purpose || !form.result) {
      setMessage("Customer, Salesperson, Purpose ve Result zorunlu.");
      return;
    }

    const record = {
      ...form,
      id: `V${String(logs.length + 42).padStart(4, "0")}`,
    };

    setLogs([record, ...logs]);
    setSelectedLog(record);
    setMessage(`${record.id} kaydedildi. AI tavsiyesi üretildi.`);
    setForm({
      ...emptyForm,
      date: new Date().toISOString().slice(0, 10),
    });
    setActiveTab("ai");
  }

  function copyText(text) {
    navigator.clipboard.writeText(text);
    setMessage("Kopyalandı.");
  }

  const averageScore =
    logs.length > 0
      ? Math.round(logs.reduce((a, b) => a + aiAnalyze(b).score, 0) / logs.length)
      : 0;

  return (
    <div className="page-shell">
      <div className="container">
        <div className="header-card">
          <div>
            <div className="eyebrow">Visit Management + AI Assistant</div>
            <h1>Visit Log AI Module</h1>
          </div>
          <div className="header-actions">
            <button className="btn btn-secondary">Export</button>
            <button onClick={saveVisit} className="btn btn-primary">
              Save Visit
            </button>
          </div>
        </div>

        <div className="kpi-grid">
          {[
            ["Visit Count", logs.length],
            [
              "AI Priority High",
              logs.filter((x) => aiAnalyze(x).priority === "High").length,
            ],
            ["Avg Win Score", averageScore],
            ["Action Items", logs.reduce((a, b) => a + aiAnalyze(b).actions.length, 0)],
            ["Risk Flags", logs.reduce((a, b) => a + aiAnalyze(b).risks.length, 0)],
          ].map(([label, value]) => (
            <div key={label} className="kpi-card">
              <div className="kpi-label">{label}</div>
              <div className="kpi-value">{value}</div>
            </div>
          ))}
        </div>

        <div className="tabs-card">
          <div className="tabs-row">
            {[
              ["entry", "Visit Entry"],
              ["ai", "AI Recommendation"],
              ["list", "Visit List"],
              ["mail", "Suggested Mail"],
            ].map(([key, label]) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`tab-btn ${activeTab === key ? "active" : ""}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {message ? <div className="message-box">{message}</div> : null}

        {activeTab === "entry" && (
          <div className="main-grid">
            <div className="card">
              <h2>Visit Entry</h2>
              <p className="subtext">
                Kaydetmeden önce AI tavsiyesini sağ panelde anlık gör.
              </p>

              <div className="form-grid">
                <Field label="Date">
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => updateForm("date", e.target.value)}
                    className="input"
                  />
                </Field>

                <Field label="Salesperson">
                  <input
                    value={form.salesperson}
                    onChange={(e) => updateForm("salesperson", e.target.value)}
                    className="input"
                  />
                </Field>

                <Field label="Customer">
                  <input
                    value={form.customer}
                    onChange={(e) => updateForm("customer", e.target.value)}
                    className="input"
                  />
                </Field>

                <Field label="Brand">
                  <input
                    value={form.brand}
                    onChange={(e) => updateForm("brand", e.target.value)}
                    className="input"
                  />
                </Field>

                <Field label="Purpose of Visit">
                  <select
                    value={form.purpose}
                    onChange={(e) => updateForm("purpose", e.target.value)}
                    className="input"
                  >
                    <option value="">Seçiniz</option>
                    {purposes.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Visit Result">
                  <select
                    value={form.result}
                    onChange={(e) => updateForm("result", e.target.value)}
                    className="input"
                  >
                    <option value="">Seçiniz</option>
                    {visitResults.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Monthly Opportunity (HKD)">
                  <input
                    value={form.monthlyOpportunity}
                    onChange={(e) => updateForm("monthlyOpportunity", e.target.value)}
                    className="input"
                  />
                </Field>

                <Field label="Yearly Opportunity (HKD)">
                  <input
                    value={form.yearlyOpportunity}
                    onChange={(e) => updateForm("yearlyOpportunity", e.target.value)}
                    className="input"
                  />
                </Field>

                <Field label="Responsible KAM">
                  <input
                    value={form.responsibleKAM}
                    onChange={(e) => updateForm("responsibleKAM", e.target.value)}
                    className="input"
                  />
                </Field>

                <Field label="Next Follow-up">
                  <input
                    type="date"
                    value={form.followUp}
                    onChange={(e) => updateForm("followUp", e.target.value)}
                    className="input"
                  />
                </Field>
              </div>

              <div className="notes-wrap">
                <label className="field-label">Visit Notes</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => updateForm("notes", e.target.value)}
                  className="input notes"
                  placeholder="Müşteri notlarını yaz..."
                />
              </div>
            </div>

            <AIInsightPanel title="Live AI Preview" data={aiOutput} />
          </div>
        )}

        {activeTab === "ai" && (
          <div className="two-col-grid">
            <div className="card">
              <div className="panel-head">
                <div>
                  <h2>AI Recommendation</h2>
                  <p className="subtext">Selected visit için öneri motoru</p>
                </div>
                <div
                  className={`priority-badge ${
                    selectedAI.priority === "High"
                      ? "high"
                      : selectedAI.priority === "Medium"
                      ? "medium"
                      : "normal"
                  }`}
                >
                  {selectedAI.priority} Priority
                </div>
              </div>

              <div className="score-box">
                <div className="score-label">Win Probability Score</div>
                <div className="score-value">
                  {selectedAI.score}
                  <span>/100</span>
                </div>
              </div>

              <div className="stack">
                <InfoCard title="AI Summary" content={selectedAI.summary} />
                <InfoCard
                  title="Recommended Next Step"
                  content={selectedAI.nextStep}
                />
              </div>
            </div>

            <AIInsightPanel
              title={`Detailed AI Analysis${
                selectedLog ? ` - ${selectedLog.customer}` : ""
              }`}
              data={selectedAI}
            />
          </div>
        )}

        {activeTab === "list" && (
          <div className="two-col-grid">
            <div className="card">
              <h2>Visit List</h2>

              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Visit ID</th>
                      <th>Customer</th>
                      <th>Result</th>
                      <th>AI Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((item) => (
                      <tr
                        key={item.id}
                        onClick={() => setSelectedLog(item)}
                        className="clickable-row"
                      >
                        <td className="strong">{item.id}</td>
                        <td>{item.customer}</td>
                        <td>{item.result}</td>
                        <td>{aiAnalyze(item).score}/100</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <AIInsightPanel title="Selected Visit AI Review" data={selectedAI} />
          </div>
        )}

        {activeTab === "mail" && (
          <div className="mail-grid">
            <div className="card">
              <h2>Select Visit</h2>
              <div className="select-list">
                {logs.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedLog(item)}
                    className={`select-btn ${
                      selectedLog?.id === item.id ? "selected" : ""
                    }`}
                  >
                    <span>
                      {item.id} - {item.customer}
                    </span>
                    <span className="tiny">{aiAnalyze(item).priority}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="card">
              <div className="panel-head">
                <h2>AI Suggested Internal Mail</h2>
                <button
                  onClick={() => copyText(selectedAI.suggestedMail)}
                  className="btn btn-secondary"
                >
                  Copy
                </button>
              </div>

              <textarea
                readOnly
                value={selectedAI.suggestedMail}
                className="input mail-area"
              />
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .page-shell {
          min-height: 100vh;
          background: #f8fafc;
          padding: 24px;
          color: #0f172a;
          font-family: Arial, sans-serif;
        }

        .container {
          max-width: 1280px;
          margin: 0 auto;
        }

        .header-card,
        .card,
        .tabs-card,
        .kpi-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 24px;
          box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
        }

        .header-card {
          padding: 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
          margin-bottom: 20px;
        }

        .eyebrow {
          font-size: 14px;
          color: #64748b;
          margin-bottom: 8px;
        }

        h1 {
          margin: 0;
          font-size: 32px;
        }

        h2,
        h3 {
          margin: 0;
        }

        .header-actions,
        .tabs-row {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .btn {
          border-radius: 16px;
          padding: 10px 16px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
        }

        .btn-primary {
          background: #0f172a;
          color: white;
          border: none;
        }

        .btn-secondary {
          background: white;
          color: #0f172a;
          border: 1px solid #cbd5e1;
        }

        .kpi-grid {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 16px;
          margin-bottom: 20px;
        }

        .kpi-card {
          padding: 20px;
        }

        .kpi-label {
          font-size: 14px;
          color: #64748b;
        }

        .kpi-value {
          margin-top: 10px;
          font-size: 34px;
          font-weight: 800;
        }

        .tabs-card {
          padding: 12px;
          margin-bottom: 20px;
        }

        .tab-btn {
          border: none;
          border-radius: 16px;
          padding: 10px 16px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          background: #f1f5f9;
          color: #334155;
        }

        .tab-btn.active {
          background: #0f172a;
          color: #ffffff;
        }

        .message-box {
          margin-bottom: 20px;
          border-radius: 16px;
          padding: 14px 16px;
          background: #ecfdf5;
          border: 1px solid #a7f3d0;
          color: #065f46;
          font-size: 14px;
        }

        .main-grid {
          display: grid;
          grid-template-columns: 1.2fr 0.8fr;
          gap: 20px;
          align-items: start;
        }

        .two-col-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          align-items: start;
        }

        .mail-grid {
          display: grid;
          grid-template-columns: 0.85fr 1.15fr;
          gap: 20px;
          align-items: start;
        }

        .card {
          padding: 24px;
        }

        .subtext {
          margin-top: 8px;
          margin-bottom: 0;
          color: #64748b;
          font-size: 14px;
        }

        .form-grid {
          margin-top: 20px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .field-label {
          display: block;
          margin-bottom: 8px;
          font-size: 14px;
          font-weight: 600;
          color: #334155;
        }

        .notes-wrap {
          margin-top: 16px;
        }

        .input {
          width: 100%;
          box-sizing: border-box;
          padding: 12px 14px;
          border-radius: 16px;
          border: 1px solid #cbd5e1;
          background: white;
          font-size: 14px;
          outline: none;
        }

        .notes {
          min-height: 180px;
          resize: vertical;
        }

        .mail-area {
          min-height: 420px;
          background: #f8fafc;
        }

        .info-stack,
        .stack,
        .select-list {
          display: grid;
          gap: 12px;
        }

        .info-card {
          border-radius: 18px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          padding: 16px;
        }

        .info-title {
          font-size: 12px;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          margin-bottom: 10px;
        }

        .info-content {
          font-size: 14px;
          line-height: 1.6;
          color: #1e293b;
        }

        .info-list {
          display: grid;
          gap: 10px;
        }

        .info-item {
          display: flex;
          gap: 10px;
          align-items: flex-start;
          font-size: 14px;
          color: #1e293b;
          line-height: 1.5;
        }

        .dot {
          width: 8px;
          height: 8px;
          border-radius: 999px;
          background: #0f172a;
          margin-top: 7px;
          flex-shrink: 0;
        }

        .panel-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
          margin-bottom: 16px;
        }

        .priority-badge {
          border-radius: 999px;
          padding: 10px 14px;
          font-size: 14px;
          font-weight: 700;
        }

        .priority-badge.high {
          background: #fee2e2;
          color: #b91c1c;
        }

        .priority-badge.medium {
          background: #fef3c7;
          color: #b45309;
        }

        .priority-badge.normal {
          background: #dcfce7;
          color: #15803d;
        }

        .score-box {
          border-radius: 24px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          padding: 20px;
          margin-bottom: 16px;
        }

        .score-label {
          font-size: 14px;
          color: #64748b;
        }

        .score-value {
          margin-top: 10px;
          font-size: 54px;
          font-weight: 800;
        }

        .score-value span {
          font-size: 22px;
          color: #94a3b8;
          margin-left: 4px;
        }

        .table-wrap {
          margin-top: 16px;
          overflow-x: auto;
          border-radius: 24px;
          border: 1px solid #e2e8f0;
        }

        .table {
          width: 100%;
          border-collapse: collapse;
          font-size: 14px;
          background: white;
        }

        .table th {
          text-align: left;
          padding: 14px 16px;
          background: #f8fafc;
          color: #64748b;
          font-weight: 700;
        }

        .table td {
          padding: 14px 16px;
          border-top: 1px solid #eef2f7;
        }

        .clickable-row {
          cursor: pointer;
        }

        .clickable-row:hover {
          background: #f8fafc;
        }

        .strong {
          font-weight: 700;
        }

        .select-btn {
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          text-align: left;
          border-radius: 16px;
          border: 1px solid #e2e8f0;
          background: white;
          color: #0f172a;
          padding: 14px 16px;
          cursor: pointer;
        }

        .select-btn.selected {
          background: #0f172a;
          color: white;
          border-color: #0f172a;
        }

        .tiny {
          font-size: 12px;
          opacity: 0.8;
        }

        @media (max-width: 1100px) {
          .kpi-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .main-grid,
          .two-col-grid,
          .mail-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 700px) {
          .page-shell {
            padding: 14px;
          }

          .kpi-grid,
          .form-grid {
            grid-template-columns: 1fr;
          }

          h1 {
            font-size: 26px;
          }

          .score-value {
            font-size: 42px;
          }
        }
      `}</style>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="field-label">{label}</label>
      {children}
    </div>
  );
}

function InfoCard({ title, content }) {
  return (
    <div className="info-card">
      <div className="info-title">{title}</div>
      <div className="info-content">{content}</div>
    </div>
  );
}

function InfoList({ title, items }) {
  return (
    <div className="info-card">
      <div className="info-title">{title}</div>
      <div className="info-list">
        {items.map((item, idx) => (
          <div key={idx} className="info-item">
            <div className="dot" />
            <div>{item}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AIInsightPanel({ title, data }) {
  return (
    <div className="card">
      <h3>{title}</h3>
      <div className="info-stack" style={{ marginTop: 20 }}>
        <InfoList title="Why AI Thinks This Can Be Won" items={data.reasons} />
        <InfoList title="Risk Flags" items={data.risks} />
        <InfoList title="Recommended Actions" items={data.actions} />
      </div>
    </div>
  );
}
