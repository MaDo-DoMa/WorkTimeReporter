import { useState } from "react";
import "../styles/ReportPage.css";

export default function ReportPage() {
  // === STANY DLA FORMULARZA RAPORTOWANIA (POST) ===
  const [workStart, setWorkStart] = useState("");
  const [workEnd, setWorkEnd] = useState("");
  const [project, setProject] = useState("");
  const [reportStatus, setReportStatus] = useState("");

  // === STANY DLA FORMULARZA WYSZUKIWANIA (GET) - TYLKO DANE OSOBOWE ===
  const [searchFirstName, setSearchFirstName] = useState("");
  const [searchLastName, setSearchLastName] = useState("");
  const [searchPosition, setSearchPosition] = useState("");

  const [searchStatus, setSearchStatus] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  // Funkcja pomocnicza do nagłówków (Autoryzacja przez Sesję/Ciasteczka)
  const getAuthHeaders = () => {
    return {
      "Content-Type": "application/json",
      // Używamy sesji, więc autoryzacja jest realizowana przez 'credentials: include'
    };
  };

  // === OBSŁUGA RAPORTOWANIA (POST) ===
  const handleSubmit = async (e) => {
    e.preventDefault();
    setReportStatus("");

    if (!workStart || !project) {
      setReportStatus("⚠️ Wypełnij czas rozpoczęcia i projekt!");
      return;
    }

    const data = {
        work_start: workStart,
        work_end: workEnd,
        project: project
    };

    try {
      const res = await fetch("http://localhost:5000/reports", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
        credentials: 'include'
      });

      if (res.ok) {
        setReportStatus("✅ Raport zapisany!");
        setWorkStart("");
        setWorkEnd("");
        setProject("");
      } else {
        const errorData = await res.json();
        setReportStatus(`❌ Błąd: ${errorData.error || res.statusText}`);
      }
    } catch {
      setReportStatus("🚫 Brak połączenia z serwerem!");
    }
  };


  // === OBSŁUGA WYSZUKIWANIA (GET) ===
  const handleSearch = async (e) => {
    e.preventDefault();
    setSearchStatus("🔍 Wyszukiwanie...");
    setSearchResults([]);

    const params = new URLSearchParams();

    // --- POLA OSOBOWE WYSYŁANE DO BACKENDU ---
    // WAŻNA UWAGA: Obecny reports.py ignoruje te parametry.
    // Backend ZAWSZE zwróci tylko raporty zalogowanego użytkownika,
    // ignorując podane imię, nazwisko i stanowisko.
    if (searchFirstName) params.append('firstName', searchFirstName);
    if (searchLastName) params.append('lastName', searchLastName);
    if (searchPosition) params.append('position', searchPosition);

    // Pamiętaj: backend reports.py używa tylko: project, start_date, end_date.

    try {
        // Używamy GET /reports, które domyślnie zwraca raporty ZALOGOWANEGO użytkownika
        const res = await fetch(`http://localhost:5000/reports?${params.toString()}`, {
            method: 'GET',
            headers: getAuthHeaders(),
            credentials: 'include'
        });

        if (res.ok) {
            const data = await res.json();
            setSearchResults(data.reports);
            setSearchStatus(`✅ Znaleziono ${data.count} raportów (dla zalogowanego użytkownika).`);

            // W przypadku, gdyby to był admin i chciał zobaczyć inne osoby,
            // ta implementacja backendu to uniemożliwia.
            if (searchFirstName || searchLastName || searchPosition) {
                 console.warn("UWAGA: Backend nie filtruje po Imieniu/Nazwisku/Stanowisku. Zwraca tylko raporty zalogowanego użytkownika.");
            }
        } else if (res.status === 401) {
            setSearchStatus("❌ Błąd: Musisz być zalogowany, aby wyszukiwać.");
        }
        else {
             const errorData = await res.json();
             setSearchStatus(`❌ Błąd: ${errorData.error || res.statusText}`);
        }

    } catch (e) {
        setSearchStatus("🚫 Brak połączenia z serwerem!");
    }
  };


  // Funkcja pomocnicza do wyświetlania daty i czasu trwania
  const formatDuration = (start, end) => {
    if (!start) return "Brak danych";
    const startDt = new Date(start);

    if (!end) {
        return `Start: ${startDt.toLocaleString()} (Aktywny)`;
    }

    const endDt = new Date(end);
    const diffMs = endDt - startDt;

    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    return `${startDt.toLocaleDateString()} | Trwanie: ${hours}h ${minutes}m`;
  };


  return (
    <div className="page-container">
      {/* Karta Raportowania (Lewa) */}
      <div className="form-card">
        <h2 className="card-header">Raportowanie pracy</h2>
        <form onSubmit={handleSubmit} className="form-content">
          <label>
            Czas rozpoczęcia:
            <input
              type="datetime-local"
              value={workStart}
              onChange={(e) => setWorkStart(e.target.value)}
              className="form-input"
              required
            />
          </label>

          <label>
            Czas zakończenia (Opcjonalnie):
            <input
              type="datetime-local"
              value={workEnd}
              onChange={(e) => setWorkEnd(e.target.value)}
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
              required
            />
          </label>

          <button type="submit" className="submit-button">
            🚀 Zaraportuj
          </button>
        </form>
        {reportStatus && <p className="status-message">{reportStatus}</p>}
      </div>

      {/* Karta Wyszukiwania (Prawa) - Zmieniona: Imię, Nazwisko, Stanowisko */}
      <div className="form-card search-card">
        <h2 className="card-header">Wyszukiwanie raportów</h2>
        {/* Widoczne Ostrzeżenie */}
        <p style={{ color: 'red', fontSize: '0.9em', marginBottom: '15px' }}>
          *Uwaga: Wymaga modyfikacji backendu, aby wyszukiwać po Imieniu/Nazwisku/Stanowisku. Obecnie zwróci tylko Twoje raporty.
        </p>


        <form onSubmit={handleSearch} className="form-content">
          <label>
            Imię:
            <input
              type="text"
              placeholder="Imię pracownika"
              value={searchFirstName}
              onChange={(e) => setSearchFirstName(e.target.value)}
              className="form-input"
            />
          </label>

          <label>
            Nazwisko:
            <input
              type="text"
              placeholder="Nazwisko pracownika"
              value={searchLastName}
              onChange={(e) => setSearchLastName(e.target.value)}
              className="form-input"
            />
          </label>

          <label>
            Stanowisko:
            <input
              type="text"
              placeholder="Stanowisko pracownika"
              value={searchPosition}
              onChange={(e) => setSearchPosition(e.target.value)}
              className="form-input"
            />
          </label>

          <button type="submit" className="search-button">
            🔎 Wyszukaj
          </button>
        </form>

        {searchStatus && <p className="status-message">{searchStatus}</p>}

        {/* Sekcja Wyświetlania Wyników */}
        {searchResults.length > 0 && (
            <div style={{ marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '10px' }}>
                <h4 style={{ marginBottom: '10px' }}>Wyniki ({searchResults.length}):</h4>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                    {searchResults.map((report) => (
                        <li key={report.id} style={{ marginBottom: '10px', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}>
                            <p style={{ margin: 0 }}><strong>Projekt:</strong> {report.project}</p>
                            <p style={{ margin: 0 }}><strong>Status:</strong> {formatDuration(report.work_start, report.work_end)}</p>
                        </li>
                    ))}
                </ul>
            </div>
        )}
      </div>
    </div>
  );
}