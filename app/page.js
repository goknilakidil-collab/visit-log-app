"use client";

import React, { useMemo, useRef, useState } from "react";
import * as XLSX from "xlsx";

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

const criticalResults = [
  "Close follow-up required",
  "Order expected",
  "Revised offer to be shared",
  "Management-level follow-up required",
];

const initialLogs = [
  {
    id: "V0041",
    date: "2026-03-31",
    salesperson: "Özlem Köseoğlu",
    customer: "SBS Tekstil",
    brand: "Zara, Pull&Bear",
    segment: "Denim",
    allBrands: "Bershka, Stradivarius",
    monthlyCapacity: "220000",
    employeeCount: "850",
    inhouseProduction: "Yes",
    subcontractorQty: "3",
    subcontractorLocations: "Bursa, Çorlu",
    purpose: "Sales Opportunity",
    monthlyOpportunity: "120000",
    yearlyOpportunity: "1440000",
    notWorkingReason: "",
    responsibleKAM: "Göknil Akidil",
    result: "Revised offer to be shared",
    followUp: "2026-04-07",
    notes:
      "Care label ve woven label tarafında potansiyel mevcut. Fiyat revizyonu bekleniyor. Rakipte servis problemi olduğu paylaşıldı.",
  },
  {
    id: "V0040",
    date: "2026-03-30",
    salesperson: "İsmail Güneş",
    customer: "Dima Tekstil",
    brand: "Zara",
    segment: "Outerwear",
    allBrands: "Massimo Dutti",
    monthlyCapacity: "95000",
    employeeCount: "420",
    inhouseProduction: "No",
    subcontractorQty: "5",
    subcontractorLocations: "İzmir, Denizli",
    purpose: "Routine Visit / Status Check",
    monthlyOpportunity: "52500",
    yearlyOpportunity: "630000",
    notWorkingReason: "",
    responsibleKAM: "Göknil Akidil",
    result: "Follow-up visit planned",
    followUp: "2026-04-04",
    notes:
      "Rutin ziyaret yapıldı. Önümüzdeki hafta sample durumu ve termin beklentisi için tekrar görüşülecek.",
  },
  {
    id: "V0039",
    date: "2026-02-26",
    salesperson: "Özlem Köseoğlu",
    customer: "Hugo Boss",
    brand: "Hugo Boss",
    segment: "Premium",
    allBrands: "-",
    monthlyCapacity: "",
    employeeCount: "",
    inhouseProduction: "Yes",
    subcontractorQty: "",
    subcontractorLocations: "",
    purpose: "Sales Opportunity (Call)",
    monthlyOpportunity: "",
    yearlyOpportunity: "",
    notWorkingReason: "Approval process pending",
    responsibleKAM: "Göknil Akidil",
    result: "Management-level follow-up required",
    followUp: "",
    notes:
      "Karar süreci yavaş ilerliyor. Bir sonraki iletişim üst yönetim seviyesinde yapılmalı.",
  },
];

const emptyForm = {
  date: "",
  salesperson: "",
  customer: "",
  brand: "",
  segment: "",
  allBrands: "",
  monthlyCapacity: "",
  employeeCount: "",
  inhouseProduction: "",
  subcontractorQty: "",
  subcontractorLocations: "",
  purpose: "",
  monthlyOpportunity: "",
  yearlyOpportunity: "",
  notWorkingReason: "",
  responsibleKAM: "",
  result: "",
  followUp: "",
  notes: "",
};

function cardStyle() {
  return {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 20,
    padding: 20,
    boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
  };
}

function inputStyle() {
  return {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid #d1d5db",
    fontSize: 14,
    boxSizing: "border-box",
    outline: "none",
    background: "#fff",
  };
}

function labelStyle() {
  return {
    fontSize: 13,
    fontWeight: 600,
    marginBottom: 6,
    display: "block",
    color: "#374151",
  };
}

function badgeStyle(result) {
  const map = {
    "Follow-up visit planned": { bg: "#dbeafe", color: "#1d4ed8" },
    "Close follow-up required": { bg: "#fef3c7", color: "#b45309" },
    "Customer will be called": { bg: "#e5e7eb", color: "#374151" },
    "Order expected": { bg: "#d1fae5", color: "#047857" },
    "Regular visit required": { bg: "#ede9fe", color: "#6d28d9" },
    "Revised offer to be shared": { bg: "#ffedd5", color: "#c2410c" },
    "Put on hold": { bg: "#ffe4e6", color: "#be123c" },
    "Management-level follow-up required": { bg: "#fee2e2", color: "#b91c1c" },
  };
  return map[result] || { bg: "#e5e7eb", color: "#111827" };
}

const primaryButton = {
  background: "#111827",
  color: "#fff",
  border: "none",
  borderRadius: 12,
  padding: "10px 14px",
  fontWeight: 700,
  cursor: "pointer",
};

const secondaryButton = {
  background: "#fff",
  color: "#111827",
  border: "1px solid #d1d5db",
  borderRadius: 12,
  padding: "10px 14px",
  fontWeight: 700,
  cursor: "pointer",
};

function aiAnalyze(log) {
  if (!log) {
    return {
      score: 0,
      priority: "Low",
      nextAction: "-",
      risks: ["Kayıt seçilmedi."],
      actions: ["Kayıt seçip yeniden deneyin."],
      summary: "AI analizi için kayıt seçilmedi.",
      suggestedMail: "",
    };
  }

  const text = `${log.notes || ""} ${log.result || ""} ${log.purpose || ""}`.toLowerCase();

  let score = 50;
  const risks = [];
  const actions = [];
  const strengths = [];

  if (text.includes("fiyat") || text.includes("revizyon") || text.includes("price")) {
    score += 8;
    risks.push("Fiyat hassasiyeti yüksek olabilir.");
    actions.push("Revize teklif verirken sadece fiyat değil, servis ve termin avantajını da vurgula.");
  }

  if (text.includes("rakip")) {
    score += 12;
    strengths.push("Rakip zafiyeti fırsat yaratıyor.");
    actions.push("Rakibin zayıf kaldığı noktaları ticari argüman olarak kullan.");
  }

  if (text.includes("sample")) {
    score += 8;
    strengths.push("Sample üzerinden ilerleme işareti var.");
    actions.push("Sample gönderimi ve geri bildirim tarihini netleştir.");
  }

  if (text.includes("karar") || text.includes("pending") || text.includes("bekliyor")) {
    risks.push("Karar süreci uzayabilir.");
  }

  if (log.result === "Order expected") {
    score += 14;
    strengths.push("Siparişe dönüşme sinyali güçlü.");
    actions.push("PO kapanışı için net tarih al ve iç ekipleri önceden hizala.");
  }

  if (log.result === "Revised offer to be shared") {
    score += 10;
    actions.push("Revize teklifi 24-48 saat içinde paylaş.");
  }

  if (log.result === "Management-level follow-up required") {
    score -= 6;
    risks.push("Üst yönetim seviyesinde tıkanma olabilir.");
    actions.push("Üst yönetim toplantısı için kısa bir agenda ve teklif özeti hazırla.");
  }

  if (!log.followUp) {
    score -= 10;
    risks.push("Follow-up tarihi tanımlı değil.");
    actions.push("İlk iş olarak follow-up tarihi belirle.");
  }

  score = Math.max(25, Math.min(95, score));

  const priority = score >= 75 ? "High" : score >= 60 ? "Medium" : "Low";
  const nextAction =
    actions[0] || "Müşteri ile tekrar temas kurulup sonraki adım netleştirilmeli.";

  const summary =
    strengths[0] ||
    "Not içeriğine göre fırsat mevcut, ancak takip planının netleştirilmesi gerekiyor.";

  const suggestedMail = `Subject: AI Review - ${log.customer || "-"}

Dear Team,

Below is the AI-supported recommendation for the latest visit.

Customer: ${log.customer || "-"}
Priority: ${priority}
Win Probability: ${score}/100
Recommended Next Action: ${nextAction}
Main Risk: ${risks[0] || "No major risk flagged"}

Best regards`;

  return {
    score,
    priority,
    nextAction,
    risks: risks.length ? risks : ["Belirgin kritik risk görünmüyor."],
    actions: actions.length ? actions : ["Standart follow-up planı uygula."],
    summary,
    suggestedMail,
  };
}

const dashboardData = (logs) => {
  const bySales = {};
  const byResult = {};
  const byBrand = {};
  let highAI = 0;
  let totalOpportunity = 0;

  logs.forEach((log) => {
    const sales = log.salesperson || "Unknown";
    const result = log.result || "Unknown";
    const brand = log.brand || "Unknown";
    const yearly = Number(log.yearlyOpportunity || 0);

    bySales[sales] = (bySales[sales] || 0) + 1;
    byResult[result] = (byResult[result] || 0) + 1;
    byBrand[brand] = (byBrand[brand] || 0) + yearly;

    totalOpportunity += yearly;

    if (aiAnalyze(log).priority === "High") {
      highAI++;
    }
  });

  const monthlyTrend = {};
  logs.forEach((log) => {
    const month = (log.date || "").slice(0, 7) || "Unknown";
    monthlyTrend[month] = (monthlyTrend[month] || 0) + 1;
  });

  const upcomingFollowups = logs
    .filter((x) => x.followUp)
    .sort((a, b) => a.followUp.localeCompare(b.followUp))
    .slice(0, 5);

  const topCustomers = [...logs]
    .sort(
      (a, b) =>
        Number(b.yearlyOpportunity || 0) - Number(a.yearlyOpportunity || 0)
    )
    .slice(0, 5);

  return {
    bySales,
    byResult,
    byBrand,
    highAI,
    totalOpportunity,
    monthlyTrend,
    upcomingFollowups,
    topCustomers,
  };
};

function normalizeExcelDate(value) {
  if (!value) return "";
  if (typeof value === "number") {
    const date = XLSX.SSF.parse_date_code(value);
    if (!date) return "";
    const mm = String(date.m).padStart(2, "0");
    const dd = String(date.d).padStart(2, "0");
    return `${date.y}-${mm}-${dd}`;
  }

  const str = String(value).trim();
  if (!str) return "";

  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;

  const slash = str.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/);
  if (slash) {
    const dd = String(slash[1]).padStart(2, "0");
    const mm = String(slash[2]).padStart(2, "0");
    return `${slash[3]}-${mm}-${dd}`;
  }

  const parsed = new Date(str);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString().slice(0, 10);
  }

  return str;
}

function mapExcelRowToLog(row, fallbackIndex = 0) {
  const visitCode = row.visit_code || row.visitCode || row.id || `IMP${Date.now()}${fallbackIndex}`;

  return {
    id: String(visitCode),
    date: normalizeExcelDate(row.date),
    salesperson: String(row.salesperson || ""),
    customer: String(row.customer || ""),
    brand: String(row.brand || ""),
    segment: String(row.segment || ""),
    allBrands: String(row.all_brands || row.allBrands || ""),
    monthlyCapacity: String(row.monthly_capacity || row.monthlyCapacity || ""),
    employeeCount: String(row.employee_count || row.employeeCount || ""),
    inhouseProduction: String(row.inhouse_production || row.inhouseProduction || ""),
    subcontractorQty: String(row.subcontractor_qty || row.subcontractorQty || ""),
    subcontractorLocations: String(
      row.subcontractor_locations || row.subcontractorLocations || ""
    ),
    purpose: String(row.purpose || ""),
    monthlyOpportunity: String(row.monthly_opportunity || row.monthlyOpportunity || ""),
    yearlyOpportunity: String(row.yearly_opportunity || row.yearlyOpportunity || ""),
    notWorkingReason: String(row.not_working_reason || row.notWorkingReason || ""),
    responsibleKAM: String(row.responsible_kam || row.responsibleKAM || ""),
    result: String(row.result || ""),
    followUp: normalizeExcelDate(row.follow_up || row.followUp),
    notes: String(row.notes || ""),
  };
}

export default function VisitLogModule() {
  const [activeTab, setActiveTab] = useState("entry");
  const [logs, setLogs] = useState(initialLogs);
  const [selectedLog, setSelectedLog] = useState(initialLogs[0] || null);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");
  const [form, setForm] = useState({
    ...emptyForm,
    date: new Date().toISOString().slice(0, 10),
  });

  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [salespersonFilter, setSalespersonFilter] = useState("");
  const [brandFilter, setBrandFilter] = useState("");

  const fileInputRef = useRef(null);

  const salespersonOptions = useMemo(() => {
    return [...new Set(logs.map((x) => x.salesperson).filter(Boolean))].sort();
  }, [logs]);

  const brandOptions = useMemo(() => {
    return [...new Set(logs.map((x) => x.brand).filter(Boolean))].sort();
  }, [logs]);

  const filteredLogs = useMemo(() => {
    const q = search.toLowerCase().trim();

    return logs.filter((item) => {
      const matchesSearch =
        !q ||
        [
          item.id,
          item.customer,
          item.salesperson,
          item.brand,
          item.result,
          item.responsibleKAM,
        ]
          .join(" ")
          .toLowerCase()
          .includes(q);

      const matchesFrom = !dateFrom || (item.date && item.date >= dateFrom);
      const matchesTo = !dateTo || (item.date && item.date <= dateTo);
      const matchesSalesperson =
        !salespersonFilter || item.salesperson === salespersonFilter;
      const matchesBrand = !brandFilter || item.brand === brandFilter;

      return matchesSearch && matchesFrom && matchesTo && matchesSalesperson && matchesBrand;
    });
  }, [logs, search, dateFrom, dateTo, salespersonFilter, brandFilter]);

  const kpis = useMemo(() => {
    return {
      total: filteredLogs.length,
      followUps: filteredLogs.filter((x) => x.followUp).length,
      orderExpected: filteredLogs.filter((x) => x.result === "Order expected").length,
      critical: filteredLogs.filter((x) => criticalResults.includes(x.result)).length,
    };
  }, [filteredLogs]);

  const actionItems = useMemo(() => {
    return filteredLogs
      .filter((x) => criticalResults.includes(x.result))
      .map((x) => ({
        id: x.id,
        customer: x.customer,
        owner: x.responsibleKAM || "Unassigned",
        due: x.followUp || "-",
        priority:
          x.result === "Management-level follow-up required" ? "High" : "Medium",
        action:
          x.result === "Revised offer to be shared"
            ? "Share revised quotation"
            : x.result === "Order expected"
            ? "Secure PO and shipment timing"
            : x.result === "Management-level follow-up required"
            ? "Escalate to management"
            : "Close follow-up with customer",
      }));
  }, [filteredLogs]);

  const mailOutput = useMemo(() => {
    if (!selectedLog) return "";

    return `Subject: Visit Summary - ${selectedLog.customer} - ${selectedLog.date}

Dear Team,

Please find below the summary of today's visit.

Customer: ${selectedLog.customer}
Salesperson: ${selectedLog.salesperson}
Brand(s): ${selectedLog.brand || "-"}
Purpose: ${selectedLog.purpose || "-"}
Result: ${selectedLog.result || "-"}
Follow-up Date: ${selectedLog.followUp || "-"}
Responsible KAM: ${selectedLog.responsibleKAM || "-"}

Summary Notes:
${selectedLog.notes || "-"}

Commercial Opportunity:
Monthly: ${selectedLog.monthlyOpportunity || "-"} HKD
Yearly: ${selectedLog.yearlyOpportunity || "-"} HKD

Best regards`;
  }, [selectedLog]);

  const aiOutput = useMemo(() => aiAnalyze(selectedLog), [selectedLog]);
  const dashboard = useMemo(() => dashboardData(filteredLogs), [filteredLogs]);

  function showMessage(text, type = "success") {
    setMessage(text);
    setMessageType(type);
  }

  function updateForm(key, value) {
    setForm((prev) => {
      const next = { ...prev, [key]: value };

      if (key === "monthlyOpportunity") {
        const num = Number(value || 0);
        next.yearlyOpportunity = num > 0 ? String(num * 12) : "";
      }

      return next;
    });
  }

  function resetForm() {
    setForm({
      ...emptyForm,
      date: new Date().toISOString().slice(0, 10),
    });
  }

  function resetFilters() {
    setDateFrom("");
    setDateTo("");
    setSalespersonFilter("");
    setBrandFilter("");
    setSearch("");
  }

  function saveLog() {
    if (!form.customer || !form.salesperson || !form.purpose || !form.result) {
      showMessage(
        "Customer, Salesperson, Purpose of Visit ve Visit Result zorunlu.",
        "error"
      );
      setActiveTab("entry");
      return;
    }

    if (criticalResults.includes(form.result) && !form.followUp) {
      showMessage("Kritik sonuçlar için Next Follow-up zorunlu.", "error");
      setActiveTab("entry");
      return;
    }

    const nextId = `V${String(logs.length + 40).padStart(4, "0")}`;
    const record = { ...form, id: nextId };
    const nextLogs = [record, ...logs];

    setLogs(nextLogs);
    setSelectedLog(record);
    resetForm();
    showMessage(`${nextId} kaydedildi.`);
    setActiveTab("list");
  }

  function copyMailOutput() {
    if (!mailOutput) return;
    navigator.clipboard.writeText(mailOutput);
    showMessage("Mail özeti kopyalandı.");
  }

  function copyAIOutput() {
    if (!aiOutput?.suggestedMail) return;
    navigator.clipboard.writeText(aiOutput.suggestedMail);
    showMessage("AI mail önerisi kopyalandı.");
  }

  function triggerExcelImport() {
    fileInputRef.current?.click();
  }

  async function handleExcelImport(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

      const imported = rows
        .map((row, index) => mapExcelRowToLog(row, index))
        .filter((row) => row.customer || row.salesperson || row.notes);

      if (!imported.length) {
        showMessage("Excel içinde import edilecek satır bulunamadı.", "error");
        event.target.value = "";
        return;
      }

      const existingIds = new Set(logs.map((x) => x.id));
      const uniqueImported = imported.map((item, index) => {
        let nextId = item.id || `IMP${Date.now()}${index}`;
        while (existingIds.has(nextId)) {
          nextId = `${nextId}-1`;
        }
        existingIds.add(nextId);
        return { ...item, id: nextId };
      });

      const nextLogs = [...uniqueImported, ...logs];
      setLogs(nextLogs);
      setSelectedLog(uniqueImported[0]);
      showMessage(`${uniqueImported.length} kayıt Excel'den içe aktarıldı.`);
      setActiveTab("list");
    } catch (error) {
      showMessage("Excel import sırasında hata oluştu.", "error");
    } finally {
      event.target.value = "";
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#dc2626",
        color: "#111827",
        fontFamily:
          'Inter, Arial, Helvetica, ui-sans-serif, system-ui, sans-serif',
        padding: 24,
      }}
    >
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls"
          onChange={handleExcelImport}
          style={{ display: "none" }}
        />

        <div
          style={{
            ...cardStyle(),
            marginBottom: 20,
            padding: 14,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                background: "#fff",
                padding: 8,
                borderRadius: 12,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <img
                src="/logo.JPG"
                alt="SML Logo"
                style={{ height: 42, width: "auto", display: "block" }}
              />
            </div>

            <div>
              <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>
                SML Turkey
              </div>
              <div style={{ fontSize: 22, fontWeight: 800 }}>
                Visit Log Module
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <div
              style={{
                background: "#f8fafc",
                border: "1px solid #e5e7eb",
                borderRadius: 14,
                padding: "10px 14px",
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: "999px",
                  background: "#111827",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  fontSize: 13,
                }}
              >
                GA
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>Göknil Akidil</div>
                <div style={{ fontSize: 11, color: "#6b7280" }}>Sales & Marketing</div>
              </div>
            </div>

            <button style={secondaryButton}>Profile</button>
            <button style={secondaryButton}>Logout</button>
          </div>
        </div>

        <div
          style={{
            ...cardStyle(),
            marginBottom: 20,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <div>
            <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 6 }}>
              Sales App / Visit Management
            </div>
            <h1 style={{ margin: 0, fontSize: 28 }}>Control Panel</h1>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button style={secondaryButton} onClick={triggerExcelImport}>
              Excel Import
            </button>
            <button style={primaryButton} onClick={saveLog}>
              Save Visit Log
            </button>
          </div>
        </div>

        <div
          className="kpi-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
            gap: 16,
            marginBottom: 20,
          }}
        >
          <KpiCard label="Toplam Visit" value={kpis.total} />
          <KpiCard label="Follow-up" value={kpis.followUps} />
          <KpiCard label="Order Expected" value={kpis.orderExpected} />
          <KpiCard label="Critical" value={kpis.critical} />
        </div>

        <div style={{ ...cardStyle(), marginBottom: 20, padding: 12 }}>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <TabButton
              active={activeTab === "entry"}
              onClick={() => setActiveTab("entry")}
            >
              Visit Entry
            </TabButton>
            <TabButton
              active={activeTab === "list"}
              onClick={() => setActiveTab("list")}
            >
              Visit List
            </TabButton>
            <TabButton
              active={activeTab === "actions"}
              onClick={() => setActiveTab("actions")}
            >
              Action Tracker
            </TabButton>
            <TabButton
              active={activeTab === "mail"}
              onClick={() => setActiveTab("mail")}
            >
              Mail Output
            </TabButton>
            <TabButton
              active={activeTab === "ai"}
              onClick={() => setActiveTab("ai")}
            >
              AI Insights
            </TabButton>
            <TabButton
              active={activeTab === "dashboard"}
              onClick={() => setActiveTab("dashboard")}
            >
              Dashboard
            </TabButton>
          </div>
        </div>

        <div style={{ ...cardStyle(), marginBottom: 20 }}>
          <div style={{ marginBottom: 14 }}>
            <h3 style={{ margin: 0 }}>Filters</h3>
            <div style={{ color: "#6b7280", fontSize: 13, marginTop: 6 }}>
              Tarih aralığı, salesperson ve brand bazında filtreleme
            </div>
          </div>

          <div
            className="filter-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr",
              gap: 14,
              alignItems: "end",
            }}
          >
            <Field label="Date From">
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                style={inputStyle()}
              />
            </Field>

            <Field label="Date To">
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                style={inputStyle()}
              />
            </Field>

            <Field label="Salesperson">
              <select
                value={salespersonFilter}
                onChange={(e) => setSalespersonFilter(e.target.value)}
                style={inputStyle()}
              >
                <option value="">All</option>
                {salespersonOptions.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Brand">
              <select
                value={brandFilter}
                onChange={(e) => setBrandFilter(e.target.value)}
                style={inputStyle()}
              >
                <option value="">All</option>
                {brandOptions.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </Field>

            <div style={{ display: "flex", gap: 10 }}>
              <button style={secondaryButton} onClick={resetFilters}>
                Reset
              </button>
            </div>
          </div>
        </div>

        {message ? (
          <div
            style={{
              marginBottom: 20,
              background: messageType === "error" ? "#fef2f2" : "#ecfdf5",
              border:
                messageType === "error"
                  ? "1px solid #fecaca"
                  : "1px solid #a7f3d0",
              color: messageType === "error" ? "#b91c1c" : "#065f46",
              borderRadius: 14,
              padding: 14,
              fontSize: 14,
            }}
          >
            {message}
          </div>
        ) : null}

        {activeTab === "entry" && (
          <div
            className="main-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 1fr",
              gap: 20,
              alignItems: "start",
            }}
          >
            <div style={cardStyle()}>
              <h2 style={{ marginTop: 0 }}>Yeni Visit Log Girişi</h2>
              <p style={{ color: "#6b7280", marginTop: -6, marginBottom: 18 }}>
                Ziyaret sonrası standart veri girişi, fırsat takibi ve aksiyon üretimi.
              </p>

              <div
                className="form-grid"
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 14,
                }}
              >
                <Field label="Ziyaret Tarihi">
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => updateForm("date", e.target.value)}
                    style={inputStyle()}
                  />
                </Field>

                <Field label="Salesperson">
                  <input
                    value={form.salesperson}
                    onChange={(e) => updateForm("salesperson", e.target.value)}
                    style={inputStyle()}
                    placeholder="Seçiniz"
                  />
                </Field>

                <Field label="Customer">
                  <input
                    value={form.customer}
                    onChange={(e) => updateForm("customer", e.target.value)}
                    style={inputStyle()}
                    placeholder="Firma adı"
                  />
                </Field>

                <Field label="Target Brand">
                  <input
                    value={form.brand}
                    onChange={(e) => updateForm("brand", e.target.value)}
                    style={inputStyle()}
                    placeholder="Zara, Next, M&S..."
                  />
                </Field>

                <Field label="Segment">
                  <input
                    value={form.segment}
                    onChange={(e) => updateForm("segment", e.target.value)}
                    style={inputStyle()}
                    placeholder="Tricot, Denim, Socks..."
                  />
                </Field>

                <Field label="All Brands Customer Working">
                  <input
                    value={form.allBrands}
                    onChange={(e) => updateForm("allBrands", e.target.value)}
                    style={inputStyle()}
                    placeholder="Diğer markalar"
                  />
                </Field>

                <Field label="Monthly Production Capacity">
                  <input
                    value={form.monthlyCapacity}
                    onChange={(e) => updateForm("monthlyCapacity", e.target.value)}
                    style={inputStyle()}
                    placeholder="Aylık adet"
                  />
                </Field>

                <Field label="Factory Employee Count">
                  <input
                    value={form.employeeCount}
                    onChange={(e) => updateForm("employeeCount", e.target.value)}
                    style={inputStyle()}
                    placeholder="Kaç kişi çalışıyor"
                  />
                </Field>

                <Field label="Inhouse Production">
                  <select
                    value={form.inhouseProduction}
                    onChange={(e) => updateForm("inhouseProduction", e.target.value)}
                    style={inputStyle()}
                  >
                    <option value="">Seçiniz</option>
                    <option>Yes</option>
                    <option>No</option>
                  </select>
                </Field>

                <Field label="Subcontractor QTY">
                  <input
                    value={form.subcontractorQty}
                    onChange={(e) => updateForm("subcontractorQty", e.target.value)}
                    style={inputStyle()}
                    placeholder="Adet"
                  />
                </Field>

                <Field label="Subcontractor Locations">
                  <input
                    value={form.subcontractorLocations}
                    onChange={(e) =>
                      updateForm("subcontractorLocations", e.target.value)
                    }
                    style={inputStyle()}
                    placeholder="Lokasyon bilgisi"
                  />
                </Field>

                <Field label="Purpose of Visit">
                  <select
                    value={form.purpose}
                    onChange={(e) => updateForm("purpose", e.target.value)}
                    style={inputStyle()}
                  >
                    <option value="">Seçiniz</option>
                    {purposes.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Monthly Opportunity (HKD)">
                  <input
                    value={form.monthlyOpportunity}
                    onChange={(e) =>
                      updateForm("monthlyOpportunity", e.target.value)
                    }
                    style={inputStyle()}
                    placeholder="0"
                  />
                </Field>

                <Field label="Yearly Opportunity (HKD)">
                  <input
                    value={form.yearlyOpportunity}
                    onChange={(e) =>
                      updateForm("yearlyOpportunity", e.target.value)
                    }
                    style={inputStyle()}
                    placeholder="0"
                  />
                </Field>

                <Field label="If Not Working / Reason">
                  <input
                    value={form.notWorkingReason}
                    onChange={(e) => updateForm("notWorkingReason", e.target.value)}
                    style={inputStyle()}
                    placeholder="Sebep"
                  />
                </Field>

                <Field label="Responsible KAM">
                  <input
                    value={form.responsibleKAM}
                    onChange={(e) => updateForm("responsibleKAM", e.target.value)}
                    style={inputStyle()}
                    placeholder="KAM seçiniz"
                  />
                </Field>

                <Field label="Visit Result">
                  <select
                    value={form.result}
                    onChange={(e) => updateForm("result", e.target.value)}
                    style={inputStyle()}
                  >
                    <option value="">Seçiniz</option>
                    {visitResults.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Next Follow-up">
                  <input
                    type="date"
                    value={form.followUp}
                    onChange={(e) => updateForm("followUp", e.target.value)}
                    style={inputStyle()}
                  />
                </Field>
              </div>

              <div style={{ marginTop: 16 }}>
                <label style={labelStyle()}>Notes</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => updateForm("notes", e.target.value)}
                  style={{ ...inputStyle(), minHeight: 140, resize: "vertical" }}
                  placeholder="Ziyaret notu, sipariş potansiyeli, riskler, aksiyonlar..."
                />
              </div>
            </div>

            <div style={{ display: "grid", gap: 20 }}>
              <div style={cardStyle()}>
                <h3 style={{ marginTop: 0 }}>İş Kuralları</h3>
                <Checklist text="Customer, Salesperson, Purpose ve Result zorunlu" />
                <Checklist text="Kritik sonuçlarda follow-up tarihi zorunlu" />
                <Checklist text="Monthly girilirse yearly otomatik hesaplanır" />
                <Checklist text="Kritik kayıtlar action tracker'a düşer" />
                <Checklist text="Mail Output sekmesinde otomatik özet oluşur" />
              </div>

              <div style={cardStyle()}>
                <h3 style={{ marginTop: 0 }}>Bu Modülde Var</h3>
                <MiniStat label="Form girişi" value="Aktif" />
                <MiniStat label="Listeleme" value="Aktif" />
                <MiniStat
                  label="Action Tracker"
                  value={`${actionItems.length} kayıt`}
                />
                <MiniStat label="Mail summary" value="Aktif" />
              </div>
            </div>
          </div>
        )}

        {activeTab === "list" && (
          <div
            className="two-col-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "1.2fr 0.8fr",
              gap: 20,
              alignItems: "start",
            }}
          >
            <div style={cardStyle()}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 12,
                  flexWrap: "wrap",
                  marginBottom: 14,
                }}
              >
                <div>
                  <h2 style={{ margin: 0 }}>Visit List</h2>
                  <div style={{ color: "#6b7280", fontSize: 14, marginTop: 6 }}>
                    Kayıtlar, filtre ve seçim ekranı
                  </div>
                </div>

                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Customer, brand, salesperson ara"
                  style={{ ...inputStyle(), width: 320 }}
                />
              </div>

              <div style={{ overflowX: "auto" }}>
                <table
                  style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}
                >
                  <thead>
                    <tr style={{ background: "#f8fafc", textAlign: "left" }}>
                      <Th>Visit ID</Th>
                      <Th>Date</Th>
                      <Th>Customer</Th>
                      <Th>Salesperson</Th>
                      <Th>Result</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLogs.map((item) => {
                      const b = badgeStyle(item.result);

                      return (
                        <tr
                          key={item.id}
                          onClick={() => setSelectedLog(item)}
                          style={{
                            cursor: "pointer",
                            borderTop: "1px solid #e5e7eb",
                          }}
                        >
                          <Td strong>{item.id}</Td>
                          <Td>{item.date || "-"}</Td>
                          <Td>{item.customer}</Td>
                          <Td>{item.salesperson}</Td>
                          <Td>
                            <span
                              style={{
                                background: b.bg,
                                color: b.color,
                                padding: "6px 10px",
                                borderRadius: 999,
                                fontSize: 12,
                                fontWeight: 700,
                                display: "inline-block",
                              }}
                            >
                              {item.result}
                            </span>
                          </Td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div style={cardStyle()}>
              <h3 style={{ marginTop: 0 }}>Selected Visit Detail</h3>

              {selectedLog ? (
                <div style={{ display: "grid", gap: 10 }}>
                  <Detail label="Visit ID" value={selectedLog.id} />
                  <Detail label="Customer" value={selectedLog.customer} />
                  <Detail label="Brand" value={selectedLog.brand || "-"} />
                  <Detail label="Purpose" value={selectedLog.purpose || "-"} />
                  <Detail label="Result" value={selectedLog.result || "-"} />
                  <Detail label="Follow-up" value={selectedLog.followUp || "-"} />
                  <Detail
                    label="Responsible KAM"
                    value={selectedLog.responsibleKAM || "-"}
                  />
                  <Detail
                    label="Yearly Opportunity"
                    value={
                      selectedLog.yearlyOpportunity
                        ? `${selectedLog.yearlyOpportunity} HKD`
                        : "-"
                    }
                  />

                  <div
                    style={{
                      background: "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: 14,
                      padding: 14,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 12,
                        textTransform: "uppercase",
                        letterSpacing: 0.5,
                        color: "#6b7280",
                        marginBottom: 8,
                      }}
                    >
                      Notes
                    </div>
                    <div style={{ fontSize: 14, lineHeight: 1.5 }}>
                      {selectedLog.notes || "-"}
                    </div>
                  </div>
                </div>
              ) : (
                <div>Kayıt seçilmedi.</div>
              )}
            </div>
          </div>
        )}

        {activeTab === "actions" && (
          <div style={cardStyle()}>
            <h2 style={{ marginTop: 0 }}>Action Tracker</h2>
            <div style={{ color: "#6b7280", marginBottom: 14, fontSize: 14 }}>
              Kritik visit sonuçlarından türeyen aksiyonlar
            </div>

            <div style={{ overflowX: "auto" }}>
              <table
                style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}
              >
                <thead>
                  <tr style={{ background: "#f8fafc", textAlign: "left" }}>
                    <Th>Visit ID</Th>
                    <Th>Customer</Th>
                    <Th>Action</Th>
                    <Th>Owner</Th>
                    <Th>Due Date</Th>
                    <Th>Priority</Th>
                  </tr>
                </thead>
                <tbody>
                  {actionItems.map((item) => (
                    <tr
                      key={`${item.id}-${item.action}`}
                      style={{ borderTop: "1px solid #e5e7eb" }}
                    >
                      <Td strong>{item.id}</Td>
                      <Td>{item.customer}</Td>
                      <Td>{item.action}</Td>
                      <Td>{item.owner}</Td>
                      <Td>{item.due}</Td>
                      <Td>
                        <span
                          style={{
                            background:
                              item.priority === "High" ? "#fee2e2" : "#fef3c7",
                            color:
                              item.priority === "High" ? "#b91c1c" : "#b45309",
                            padding: "6px 10px",
                            borderRadius: 999,
                            fontSize: 12,
                            fontWeight: 700,
                            display: "inline-block",
                          }}
                        >
                          {item.priority}
                        </span>
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "mail" && (
          <div
            className="two-col-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "0.8fr 1.2fr",
              gap: 20,
              alignItems: "start",
            }}
          >
            <div style={cardStyle()}>
              <h2 style={{ marginTop: 0 }}>Mail Output Source</h2>
              <div style={{ color: "#6b7280", marginBottom: 14, fontSize: 14 }}>
                Bir kayıt seç ve otomatik mail özetini gör
              </div>

              <div style={{ display: "grid", gap: 10 }}>
                {filteredLogs.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedLog(item)}
                    style={{
                      textAlign: "left",
                      padding: 14,
                      borderRadius: 14,
                      border:
                        selectedLog?.id === item.id
                          ? "1px solid #111827"
                          : "1px solid #e5e7eb",
                      background: selectedLog?.id === item.id ? "#111827" : "#fff",
                      color: selectedLog?.id === item.id ? "#fff" : "#111827",
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ fontWeight: 700 }}>
                      {item.id} - {item.customer}
                    </div>
                    <div style={{ fontSize: 12, opacity: 0.8, marginTop: 4 }}>
                      {item.date}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div style={cardStyle()}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 12,
                  flexWrap: "wrap",
                  marginBottom: 14,
                }}
              >
                <h2 style={{ margin: 0 }}>Automatic Mail Summary</h2>
                <button style={secondaryButton} onClick={copyMailOutput}>
                  Copy
                </button>
              </div>

              <textarea
                readOnly
                value={mailOutput}
                style={{
                  ...inputStyle(),
                  minHeight: 520,
                  background: "#f8fafc",
                  whiteSpace: "pre-wrap",
                }}
              />
            </div>
          </div>
        )}

        {activeTab === "ai" && (
          <div style={cardStyle()}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 12,
                flexWrap: "wrap",
                marginBottom: 16,
              }}
            >
              <div>
                <h2 style={{ margin: 0 }}>AI Insights</h2>
                <div style={{ color: "#6b7280", fontSize: 14, marginTop: 6 }}>
                  Seçili visit kaydı için öneri, risk ve sonraki aksiyon analizi
                </div>
              </div>
              <button style={secondaryButton} onClick={copyAIOutput}>
                Copy AI Mail
              </button>
            </div>

            <div
              className="two-col-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 20,
                alignItems: "start",
              }}
            >
              <div style={{ display: "grid", gap: 16 }}>
                <div style={cardStyle()}>
                  <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 8 }}>
                    Win Probability
                  </div>
                  <div style={{ fontSize: 36, fontWeight: 800 }}>
                    {aiOutput.score}/100
                  </div>
                </div>

                <div style={cardStyle()}>
                  <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 8 }}>
                    Priority
                  </div>
                  <div
                    style={{
                      fontSize: 18,
                      fontWeight: 700,
                      color:
                        aiOutput.priority === "High"
                          ? "#b91c1c"
                          : aiOutput.priority === "Medium"
                          ? "#b45309"
                          : "#15803d",
                    }}
                  >
                    {aiOutput.priority}
                  </div>
                </div>

                <div style={cardStyle()}>
                  <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 8 }}>
                    AI Summary
                  </div>
                  <div style={{ fontSize: 14, lineHeight: 1.6 }}>
                    {aiOutput.summary}
                  </div>
                </div>

                <div style={cardStyle()}>
                  <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 8 }}>
                    Recommended Next Action
                  </div>
                  <div style={{ fontSize: 14, lineHeight: 1.6 }}>
                    {aiOutput.nextAction}
                  </div>
                </div>
              </div>

              <div style={{ display: "grid", gap: 16 }}>
                <div style={cardStyle()}>
                  <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 8 }}>
                    Risk Flags
                  </div>
                  <div style={{ display: "grid", gap: 8 }}>
                    {aiOutput.risks.map((risk, index) => (
                      <div key={index} style={{ fontSize: 14 }}>
                        • {risk}
                      </div>
                    ))}
                  </div>
                </div>

                <div style={cardStyle()}>
                  <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 8 }}>
                    Recommended Actions
                  </div>
                  <div style={{ display: "grid", gap: 8 }}>
                    {aiOutput.actions.map((action, index) => (
                      <div key={index} style={{ fontSize: 14 }}>
                        • {action}
                      </div>
                    ))}
                  </div>
                </div>

                <div style={cardStyle()}>
                  <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 8 }}>
                    AI Suggested Internal Mail
                  </div>
                  <textarea
                    readOnly
                    value={aiOutput.suggestedMail}
                    style={{
                      ...inputStyle(),
                      minHeight: 220,
                      background: "#f8fafc",
                      whiteSpace: "pre-wrap",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "dashboard" && (
          <div style={{ display: "grid", gap: 20 }}>
            <div
              className="kpi-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                gap: 16,
              }}
            >
              <KpiCard label="Total Visits" value={filteredLogs.length} />
              <KpiCard
                label="Critical Visits"
                value={filteredLogs.filter((x) => criticalResults.includes(x.result)).length}
              />
              <KpiCard label="AI High Priority" value={dashboard.highAI} />
              <KpiCard
                label="Total Opportunity"
                value={`${Number(dashboard.totalOpportunity).toLocaleString()} HKD`}
              />
            </div>

            <div
              className="two-col-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 20,
                alignItems: "start",
              }}
            >
              <div style={cardStyle()}>
                <h3 style={{ marginTop: 0, marginBottom: 16 }}>Visits by Salesperson</h3>
                {Object.entries(dashboard.bySales).map(([name, val]) => {
                  const maxVal = Math.max(...Object.values(dashboard.bySales));
                  const width = maxVal ? (val / maxVal) * 100 : 0;

                  return (
                    <div key={name} style={{ marginBottom: 14 }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontSize: 13,
                          marginBottom: 6,
                        }}
                      >
                        <span>{name}</span>
                        <strong>{val}</strong>
                      </div>
                      <div
                        style={{
                          height: 10,
                          background: "#e5e7eb",
                          borderRadius: 999,
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            width: `${width}%`,
                            background: "#111827",
                            height: "100%",
                            borderRadius: 999,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={cardStyle()}>
                <h3 style={{ marginTop: 0, marginBottom: 16 }}>Monthly Visit Trend</h3>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 12, minHeight: 180, flexWrap: "wrap" }}>
                  {Object.entries(dashboard.monthlyTrend).map(([month, val]) => {
                    const maxVal = Math.max(...Object.values(dashboard.monthlyTrend));
                    const height = maxVal ? (val / maxVal) * 120 : 0;

                    return (
                      <div
                        key={month}
                        style={{
                          display: "inline-flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "end",
                          width: 70,
                          verticalAlign: "bottom",
                        }}
                      >
                        <div style={{ fontSize: 12, marginBottom: 6 }}>{val}</div>
                        <div
                          style={{
                            width: 36,
                            height: `${height}px`,
                            minHeight: 8,
                            background: "#0f172a",
                            borderRadius: "10px 10px 0 0",
                          }}
                        />
                        <div style={{ fontSize: 12, marginTop: 8, color: "#6b7280" }}>
                          {month}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div
              className="two-col-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 20,
                alignItems: "start",
              }}
            >
              <div style={cardStyle()}>
                <h3 style={{ marginTop: 0, marginBottom: 16 }}>Result Distribution</h3>
                {Object.entries(dashboard.byResult).map(([name, val]) => (
                  <div
                    key={name}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "10px 0",
                      borderBottom: "1px solid #f1f5f9",
                      fontSize: 14,
                    }}
                  >
                    <span>{name}</span>
                    <strong>{val}</strong>
                  </div>
                ))}
              </div>

              <div style={cardStyle()}>
                <h3 style={{ marginTop: 0, marginBottom: 16 }}>Top 5 Customers by Opportunity</h3>
                {dashboard.topCustomers.map((x) => (
                  <div
                    key={x.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "10px 0",
                      borderBottom: "1px solid #f1f5f9",
                      fontSize: 14,
                    }}
                  >
                    <span>{x.customer}</span>
                    <strong>{Number(x.yearlyOpportunity || 0).toLocaleString()} HKD</strong>
                  </div>
                ))}
              </div>
            </div>

            <div
              className="two-col-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 20,
                alignItems: "start",
              }}
            >
              <div style={cardStyle()}>
                <h3 style={{ marginTop: 0, marginBottom: 16 }}>Upcoming Follow-ups</h3>
                {dashboard.upcomingFollowups.length === 0 ? (
                  <div style={{ color: "#6b7280", fontSize: 14 }}>No follow-up found.</div>
                ) : (
                  dashboard.upcomingFollowups.map((x) => (
                    <div
                      key={x.id}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "10px 0",
                        borderBottom: "1px solid #f1f5f9",
                        fontSize: 14,
                      }}
                    >
                      <span>{x.customer}</span>
                      <strong>{x.followUp}</strong>
                    </div>
                  ))
                )}
              </div>

              <div style={cardStyle()}>
                <h3 style={{ marginTop: 0, marginBottom: 16 }}>Brand Opportunity Mix</h3>
                {Object.entries(dashboard.byBrand)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 5)
                  .map(([brand, val]) => (
                    <div key={brand} style={{ marginBottom: 14 }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontSize: 13,
                          marginBottom: 6,
                        }}
                      >
                        <span>{brand}</span>
                        <strong>{Number(val).toLocaleString()} HKD</strong>
                      </div>
                      <div
                        style={{
                          height: 10,
                          background: "#e5e7eb",
                          borderRadius: 999,
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            width: `${
                              dashboard.totalOpportunity
                                ? (val / dashboard.totalOpportunity) * 100
                                : 0
                            }%`,
                            background: "#334155",
                            height: "100%",
                            borderRadius: 999,
                          }}
                        />
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        @media (max-width: 1180px) {
          .filter-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }
        }

        @media (max-width: 1100px) {
          .kpi-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }
        }

        @media (max-width: 900px) {
          .main-grid,
          .two-col-grid {
            grid-template-columns: 1fr !important;
          }

          .form-grid {
            grid-template-columns: 1fr !important;
          }

          .filter-grid {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 640px) {
          .kpi-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </main>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label style={labelStyle()}>{label}</label>
      {children}
    </div>
  );
}

function KpiCard({ label, value }) {
  return (
    <div style={cardStyle()}>
      <div style={{ fontSize: 13, color: "#6b7280" }}>{label}</div>
      <div style={{ fontSize: 30, fontWeight: 800, marginTop: 8 }}>{value}</div>
    </div>
  );
}

function Checklist({ text }) {
  return (
    <div
      style={{
        display: "flex",
        gap: 10,
        alignItems: "flex-start",
        marginTop: 10,
      }}
    >
      <div
        style={{
          width: 22,
          height: 22,
          borderRadius: 999,
          background: "#111827",
          color: "#fff",
          fontSize: 12,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          marginTop: 1,
        }}
      >
        ✓
      </div>
      <div style={{ fontSize: 14, color: "#374151", lineHeight: 1.45 }}>
        {text}
      </div>
    </div>
  );
}

function MiniStat({ label, value }) {
  return (
    <div
      style={{
        background: "#f8fafc",
        border: "1px solid #e5e7eb",
        borderRadius: 14,
        padding: 12,
        marginTop: 10,
      }}
    >
      <div style={{ fontSize: 12, color: "#6b7280" }}>{label}</div>
      <div style={{ marginTop: 4, fontSize: 14, fontWeight: 700 }}>{value}</div>
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: 14,
        padding: 14,
        display: "flex",
        justifyContent: "space-between",
        gap: 12,
      }}
    >
      <div
        style={{
          fontSize: 12,
          textTransform: "uppercase",
          letterSpacing: 0.5,
          color: "#6b7280",
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: 14, fontWeight: 700, textAlign: "right" }}>
        {value}
      </div>
    </div>
  );
}

function TabButton({ active, children, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "10px 14px",
        borderRadius: 12,
        border: "none",
        background: active ? "#111827" : "#f3f4f6",
        color: active ? "#fff" : "#374151",
        fontWeight: 700,
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}

function Th({ children }) {
  return (
    <th
      style={{
        padding: 12,
        fontSize: 13,
        color: "#6b7280",
        fontWeight: 700,
      }}
    >
      {children}
    </th>
  );
}

function Td({ children, strong }) {
  return (
    <td
      style={{
        padding: 12,
        fontSize: 14,
        color: "#111827",
        fontWeight: strong ? 700 : 400,
        verticalAlign: "top",
      }}
    >
      {children}
    </td>
  );
}
