import React, { useState } from "react";

export default function EventHeader({ ev, navigate, onSave }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ ...ev });

  function openEdit() {
    setForm({ ...ev });
    setEditing(true);
  }

  function save() {
    setEditing(false);
    if (onSave) onSave(form);
  }

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <button
          onClick={() => navigate(-1)}
          style={{ marginRight: 8, padding: "6px 10px", borderRadius: 6, border: "1px solid #e6e6e6", background: "#fff", cursor: "pointer" }}
        >
          Quay lại
        </button>

        <h2 style={{ margin: 0 }}>{ev.name}</h2>
      </div>

   
    </div>
  );
}