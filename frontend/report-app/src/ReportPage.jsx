import { useState } from "react";

export default function ReportPage() {
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [project, setProject] = useState("");
  const [status, setStatus] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!startTime || !endTime || !project) {
      setStatus("⚠️ Wypełnij wszystkie pola!");
      return;
    }

    const data = { startTime, endTime, project };

    try {
      const res = await fetch("http://localhost:5000/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        setStatus("✅ Raport zapisany!");
        setStartTime("");
        setEndTime("");
        setProject("");
      } else {
        setStatus("❌ Błąd przy zapisie raportu!");
      }
    } catch {
      setStatus("🚫 Brak połączenia z serwerem!");
    }
  };

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        alignItems: "center",
        justifyContent: "center",
        background: "#f4f6f8",
      }}
    >
      <div
        style={{
          background: "white",
          padding: "30px",
          borderRadius: "10px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          width: "350px",
        }}
      >
        <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
          Raportowanie pracy
        </h2>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <label>
            Czas rozpoczęcia:
            <input
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              style={{
                width: "100%",
                padding: "8px",
                marginTop: "4px",
                boxSizing: "border-box",
              }}
            />
          </label>

          <label>
            Czas zakończenia:
            <input
              type="datetime-local"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              style={{
                width: "100%",
                padding: "8px",
                marginTop: "4px",
                boxSizing: "border-box",
              }}
            />
          </label>

          <label>
            Projekt:
            <input
              type="text"
              placeholder="np. System CRM"
              value={project}
              onChange={(e) => setProject(e.target.value)}
              style={{
                width: "100%",
                padding: "8px",
                marginTop: "4px",
                boxSizing: "border-box",
              }}
            />
          </label>

          <button
            type="submit"
            style={{
              backgroundColor: "#007bff",
              color: "white",
              padding: "10px",
              border: "none",
              borderRadius: "6px",
              fontSize: "16px",
              cursor: "pointer",
              marginTop: "10px",
            }}
          >
            🚀 Zaraportuj
          </button>
        </form>

        {status && (
          <p style={{ textAlign: "center", marginTop: "15px" }}>{status}</p>
        )}
      </div>
    </div>
  );
}
