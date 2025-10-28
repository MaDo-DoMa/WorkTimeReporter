import { useState } from "react";
import "../styles/ReportPage.css"; // Importujemy plik CSS

export default function ReportPage() {
  // Stany dla formularza raportowania
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [project, setProject] = useState("");
  const [reportStatus, setReportStatus] = useState("");

  // Nowe stany dla formularza wyszukiwania
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [position, setPosition] = useState("");
  const [searchStatus, setSearchStatus] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!startTime || !endTime || !project) {
      setReportStatus("⚠️ Wypełnij wszystkie pola raportu!");
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
        setReportStatus("✅ Raport zapisany!");
        setStartTime("");
        setEndTime("");
        setProject("");
      } else {
        setReportStatus("❌ Błąd przy zapisie raportu!");
      }
    } catch {
      setReportStatus("🚫 Brak połączenia z serwerem!");
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();

    if (!firstName && !lastName && !position) {
      setSearchStatus("⚠️ Wypełnij przynajmniej jedno pole wyszukiwania!");
      return;
    }

    // TUTAJ ZINTEGRUJESZ LOGIKĘ WYSZUKIWANIA RAPORTÓW
    // (np. wywołanie API: /api/reports/search?name=...&lastName=...&position=...)

    console.log("Wyszukaj raporty dla:", { firstName, lastName, position });
    setSearchStatus("🔍 Wyszukiwanie... (Logika API do integracji)");

    // Poniżej możesz zresetować status i pola po krótkim czasie,
    // gdy API zwróciłoby wynik
    // setTimeout(() => setSearchStatus(""), 3000);
  };

  return (
    <div className="page-container">
      {/* Karta Raportowania */}
      <div className="form-card">
        <h2 className="card-header">Raportowanie pracy</h2>

        <form onSubmit={handleSubmit} className="form-content">
          <label>
            Czas rozpoczęcia:
            <input
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="form-input"
            />
          </label>

          <label>
            Czas zakończenia:
            <input
              type="datetime-local"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="form-input"
            />
          </label>

          <label>
            Projekt:
            <input
              type="text"
              placeholder="np. System CRM"
              value={project}
              onChange={(e) => setProject(e.target.value)}
              className="form-input"
            />
          </label>

          <button type="submit" className="submit-button">
            🚀 Zaraportuj
          </button>
        </form>

        {reportStatus && <p className="status-message">{reportStatus}</p>}
      </div>

      {/* Karta Wyszukiwania */}
      <div className="form-card search-card">
        <h2 className="card-header">Wyszukiwanie raportów</h2>

        <form onSubmit={handleSearch} className="form-content">
          <label>
            Imię:
            <input
              type="text"
              placeholder="Imię"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="form-input"
            />
          </label>

          <label>
            Nazwisko:
            <input
              type="text"
              placeholder="Nazwisko"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="form-input"
            />
          </label>

          <label>
            Stanowisko:
            <input
              type="text"
              placeholder="Stanowisko"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              className="form-input"
            />
          </label>

          <button type="submit" className="search-button">
            🔎 Wyszukaj
          </button>
        </form>

        {searchStatus && <p className="status-message">{searchStatus}</p>}
      </div>
    </div>
  );
}