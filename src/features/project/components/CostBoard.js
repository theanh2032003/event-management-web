import React, { useState } from "react";

const thStyle = { textAlign: "left", padding: 8, borderBottom: "2px solid #ddd" };
const tdStyle = { padding: 8, verticalAlign: "top" };

export default function CostBoard() {
  const initialCosts = [
    { id: "c1", name: "Thuê âm thanh", amount: 4500000, assignee: "Dũng", task: "Thiết lập âm thanh", date: "2025-10-20" },
    { id: "c2", name: "In ấn poster", amount: 1200000, assignee: "Cúc", task: "In ấn poster", date: "2025-10-18" },
    { id: "c3", name: "Quà tặng khách", amount: 800000, assignee: "Tú", task: "Chuẩn bị quà tặng", date: "2025-10-15" },
    { id: "c4", name: "Chi phí vé", amount: 2300000, assignee: "Bình", task: "Bán vé", date: "2025-10-10" },
  ];

  const [costs, setCosts] = useState(initialCosts);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", amount: "", assignee: "", task: "", date: "" });

  const formatMoney = (n) => n.toLocaleString("vi-VN") + " ₫";

  const total = costs.reduce((s, c) => s + (Number(c.amount) || 0), 0);

  const styleTag = `
    .cost-cards { display: none; }
    @media (max-width: 640px) {
      .cost-table { display: none; }
      .cost-cards { display: block; }
    }
  `;

  function onChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  function handleAddSubmit(e) {
    e.preventDefault();
    if (!form.name || !form.amount) return;
    const newItem = {
      id: `c${Date.now()}`,
      name: form.name,
      amount: Number(form.amount),
      assignee: form.assignee || "-",
      task: form.task || "-",
      date: form.date || "-",
    };
    setCosts((cs) => [newItem, ...cs]);
    setForm({ name: "", amount: "", assignee: "", task: "", date: "" });
    setShowForm(false);
  }

  return (
    <div>
      <style>{styleTag}</style>

      {/* header with add button */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <h2 style={{ fontWeight: 700 }}>Bảng chi phí của sự kiện</h2>
        <div>
          
        </div>
      </div>

      {/* inline add form */}
      {showForm && (
        <form onSubmit={handleAddSubmit} style={{ marginBottom: 12, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 8 }}>
          <input name="name" value={form.name} onChange={onChange} placeholder="Tên khoản chi" style={{ padding: 8, borderRadius: 6, border: "1px solid #e6e6e6" }} />
          <input name="amount" value={form.amount} onChange={onChange} type="number" placeholder="Số tiền" style={{ padding: 8, borderRadius: 6, border: "1px solid #e6e6e6" }} />
          <input name="assignee" value={form.assignee} onChange={onChange} placeholder="Người phụ trách" style={{ padding: 8, borderRadius: 6, border: "1px solid #e6e6e6" }} />
          <input name="task" value={form.task} onChange={onChange} placeholder="Công việc liên quan" style={{ padding: 8, borderRadius: 6, border: "1px solid #e6e6e6" }} />
          <input name="date" value={form.date} onChange={onChange} type="date" placeholder="Ngày chi" style={{ padding: 8, borderRadius: 6, border: "1px solid #e6e6e6" }} />
          <div style={{ display: "flex", gap: 8 }}>
            <button type="submit" style={{ padding: "8px 12px", borderRadius: 6, background: "#0f50c7ff", color: "#fff", border: "none", cursor: "pointer" }}>
              Lưu
            </button>
            <button type="button" onClick={() => setShowForm(false)} style={{ padding: "8px 12px", borderRadius: 6, background: "#fff", border: "1px solid #ddd", cursor: "pointer" }}>
              Hủy
            </button>
          </div>
        </form>
      )}

      <div className="cost-table" style={{ overflowX: "auto", border: "1px solid #eee", borderRadius: 8, background: "#fff" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={thStyle}>Tên khoản chi</th>
              <th style={thStyle}>Số tiền</th>
              <th style={thStyle}>Người phụ trách</th>
              <th style={thStyle}>Công việc liên quan</th>
              <th style={thStyle}>Ngày chi</th>
            </tr>
          </thead>
          <tbody>
            {costs.map((c, idx) => (
              <tr key={c.id} style={{ background: idx % 2 ? "#fafafa" : "#fff", borderTop: "1px solid #f3f4f6" }}>
                <td style={tdStyle}>{c.name}</td>
                <td style={tdStyle}>{formatMoney(c.amount)}</td>
                <td style={tdStyle}>{c.assignee}</td>
                <td style={tdStyle}>{c.task}</td>
                <td style={tdStyle}>{c.date}</td>
              </tr>
            ))}
          </tbody>

        </table>
      </div>

      <div style={{ marginTop: 10, display: "flex", justifyContent: "flex-end", gap: 12, alignItems: "center" }}>
        <div style={{ color: "#6b7280" }}>Số khoản: {costs.length}</div>
        <div style={{ fontWeight: 700, fontSize: 16 }}>Tổng chi phí: {formatMoney(total)}</div>
      </div>

      <div className="cost-cards" style={{ display: "none", marginTop: 8 }}>
        {costs.map((c) => (
          <div key={c.id} style={{ border: "1px solid #eee", borderRadius: 8, padding: 12, marginBottom: 8, background: "#fff" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontWeight: 700 }}>{c.name}</div>
              <div style={{ color: "#065f46", fontWeight: 700 }}>{formatMoney(c.amount)}</div>
            </div>
            <div style={{ color: "#6b7280", fontSize: 13, marginTop: 8 }}>Người phụ trách: {c.assignee}</div>
            <div style={{ color: "#6b7280", fontSize: 13 }}>Công việc: {c.task}</div>
            <div style={{ color: "#6b7280", fontSize: 13 }}>Ngày: {c.date}</div>
          </div>
        ))}

        <div style={{ borderTop: "1px solid #eee", paddingTop: 8, marginTop: 8, textAlign: "right", fontWeight: 700 }}>
          Tổng chi phí: {formatMoney(total)}
        </div>
      </div>
    </div>
  );
}