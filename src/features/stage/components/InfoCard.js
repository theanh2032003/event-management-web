import React from "react";

export default function InfoCard({ title, children }) {
  return (
    <div style={{ border: "1px solid #e6e6e6", padding: 12, borderRadius: 8, background: "linear-gradient(180deg,#fff,#fbfbfd)", boxShadow: "0 1px 3px rgba(16,24,40,0.04)" }}>
      <div style={{ fontSize: 12, color: "#666", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.4 }}>{title}</div>
      <div style={{ fontSize: 14, color: "#222", fontWeight: 600 }}>{children}</div>
    </div>
  );
}