import { useState } from "react";
// Pamiętaj, aby ścieżka do CSS była poprawna (jak ustaliliśmy: '../styles/ReportPage.css')
import "../styles/ReportPage.css";

export default function ReportPage() {
  // === STANY DLA FORMULARZA RAPORTOWANIA (POST) ===
  const [workStart, setWorkStart] = useState("");
  const [workEnd, setWorkEnd] = useState("");
  const [project, setProject] = useState("");
  const [reportStatus, setReportStatus] = useState("");

  // === STANY DLA FORMULARZA WYSZUKIWANIA (GET) ===
  // Pola zmienione, aby pasowały do endpointu /reports (project, start_date, end_date)
  const [searchProject, setSearchProject] = useState("");
  const [searchStartDate, setSearchStartDate] = useState("");
  const [searchEndDate, setSearchEndDate] = useState("");
  const [searchStatus, setSearchStatus] = useState("");
  const [searchResults, setSearchResults] = useState([]);


  // Funkcja pomocnicza do pobierania tokena (dla JWT)
  const getAuthHeaders = () => {
    // Zakładamy, że token jest przechowywany w localStorage
    const token = localStorage.getItem('access_token');

    // Jeśli używasz wyłącznie sesji, ten nagłówek nie jest potrzebny.
    // Wtedy możesz pominąć 'Authorization' i użyć tylko 'credentials: 'include''
    return {
        "Content-Type": "application/json",
        // Zastąp "Bearer" odpowiednim prefiksem, jeśli używasz innego (np. 'JWT')
        ...(token && { "Authorization": `Bearer ${token}` }),
    };
  };


  // === OBSŁUGA RAPORTOWANIA (POST) ===
  const handleSubmit = async (e) => {
    e.preventDefault();
    setReportStatus(""); // Resetowanie statusu

    if (!workStart || !project) {
      setReportStatus("⚠️ Wypełnij czas rozpoczęcia i projekt!");
      return;
    }

    // Backend oczekuje work_start, work_end, project.
    const data = {
        work_start: workStart,
        work_end: workEnd,
        project: project
    };

    try {
      // Endpoint to /reports (jak w reports.py)
      const res = await fetch("http://localhost:5000/reports", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
        // Dodaj 'credentials: include' jeśli opierasz się na ciasteczkach sesyjnych
        // credentials: 'include'
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

    // Dodawanie pól zgodnych z backendem (project, start_date, end_date)
    if (searchProject) params.append('project', searchProject);

    // Daty muszą być w formacie ISO 8601, aby pasowały do datetime.fromisoformat()
    if (searchStartDate) params.append('start_date', searchStartDate);
    if (searchEndDate) params.append('end_date', searchEndDate);

    try {
        // Endpoint to /reports (GET) (jak w reports.py)
        const res = await fetch(`http://localhost:5000/reports?${params.toString()}`, {
            method: 'GET',
            headers: getAuthHeaders(),
            // credentials: 'include'
        });

        if (res.ok) {
            const data = await res.json();
            setSearchResults(data.reports);
            setSearchStatus(`✅ Znaleziono ${data.count} raportów.`);
        } else if (res.status === 401) {
            setSearchStatus("❌ Błąd: Musisz być zalogowany.");
        }
        else {
             const errorData = await res.json();
             setSearchStatus(`❌ Błąd: ${errorData.error || res.statusText}`);
        }

    } catch (e) {
        setSearchStatus("🚫 Brak połączenia z serwerem!");
    }
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
              // Nazwa pola zmieniona: workStart
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
              // Nazwa pola zmieniona: workEnd
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

      {/* Karta Wyszukiwania */}
      <div className="form-card search-card">
        <h2 className="card-header">Wyszukiwanie raportów</h2>

        <form onSubmit={handleSearch} className="form-content">
          <label>
            Projekt:
            <input
              type="text"
              placeholder="Nazwa projektu"
              value={searchProject}
              onChange={(e) => setSearchProject(e.target.value)}
              className="form-input"
            />
          </label>

          <label>
            Data początkowa:
            <input
              type="date"
              value={searchStartDate}
              onChange={(e) => setSearchStartDate(e.target.value)}
              className="form-input"
            />
          </label>

          <label>
            Data końcowa:
            <input
              type="date"
              value={searchEndDate}
              onChange={(e) => setSearchEndDate(e.target.value)}
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
                <h4 style={{ marginBottom: '10px' }}>Wyniki:</h4>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                    {searchResults.map((report, index) => (
                        <li key={index} style={{ marginBottom: '8px', padding: '5px', borderBottom: '1px dotted #ccc' }}>
                            <strong>{report.project}</strong>: {new Date(report.work_start).toLocaleDateString()} - {new Date(report.work_end).toLocaleDateString() || 'W Trakcie'}
                        </li>
                    ))}
                </ul>
            </div>
        )}
      </div>
    </div>
  );
}