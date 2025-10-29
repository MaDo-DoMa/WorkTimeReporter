# 📊 System Raportowania Czasu Pracy

Aplikacja webowa do zarządzania czasem pracy z systemem rejestracji, weryfikacji emaila i raportowaniem projektów.

![Python](https://img.shields.io/badge/Python-3.13-blue)
![Flask](https://img.shields.io/badge/Flask-3.0-green)
![React](https://img.shields.io/badge/React-19.1-61DAFB)
![Vite](https://img.shields.io/badge/Vite-7.1-646CFF)

---


## ✨ Funkcjonalności

### Autentykacja i autoryzacja
- ✅ Rejestracja użytkowników z walidacją danych
- ✅ Weryfikacja emaila poprzez token
- ✅ Logowanie oparte na sesjach (cookies)
- ✅ Wysyłanie emaili weryfikacyjnych
- ✅ Resend tokena weryfikacyjnego
- ✅ Bezpieczne hashowanie haseł (bcrypt)

### Zarządzanie raportami
- ✅ Tworzenie raportów czasu pracy
- ✅ Śledzenie czasu rozpoczęcia i zakończenia
- ✅ Przypisywanie do projektów (max 3 projekty na użytkownika)
- ✅ Edycja i usuwanie raportów
- ✅ Filtrowanie raportów po dacie i projekcie
- ✅ Statystyki i podsumowania czasu pracy

### Interfejs użytkownika
- ✅ Responsywny design
- ✅ Animacje i płynne przejścia
- ✅ Komunikaty sukcesu/błędu
- ✅ Formularz rejestracji i logowania
- ✅ Panel raportowania z wizualizacją danych
- ✅ Strona weryfikacji emaila

---

## 🛠️ Technologie

### Backend
- **Flask 3.0** - Framework webowy
- **SQLAlchemy** - ORM do zarządzania bazą danych
- **SQLite** - Baza danych (development)
- **Flask-CORS** - Obsługa Cross-Origin Resource Sharing
- **MailHog** - Wysyłanie emaili - działa na porcie :8025
- **bcrypt** - Hashowanie haseł

### Frontend
- **React 19.1** - Biblioteka UI
- **React Router DOM 7.9** - Routing
- **Vite 7.1** - Build tool i dev server
- **CSS3** - Styling z animacjami

---

## 🏗️ Architektura

### Backend (Flask)
```
backend/
├── app/
│   ├── __init__.py          # Inicjalizacja aplikacji, CORS
│   └── routes/
│       ├── auth.py          # Autentykacja (register, login, verify)
│       ├── reports.py       # CRUD raportów
│       └── main.py          # Główna strona
├── config.py                # Konfiguracja (DB, Mail, Session)
├── models.py                # Modele User i Reports
└── run.py                   # Entry point
```

### Frontend (React + Vite)
```
frontend/login-app/src/
├── components/
│   ├── LoginForm.jsx        # Formularz logowania
│   ├── RegistrationForm.jsx # Formularz rejestracji
│   ├── EmailVerification.jsx # Weryfikacja emaila
│   └── ReportPage.jsx       # Panel raportowania
├── styles/                  # CSS dla komponentów
├── App.jsx                  # Główny komponent z routingiem
└── main.jsx                 # Entry point
```

### Przepływ danych
```
[Frontend] ←→ [CORS] ←→ [Flask Backend] ←→ [SQLite DB]
                ↓
          [Session Cookies]
                ↓
          [Flask-Mail] → [SMTP Server]
```

---

## 📦 Instalacja

### Wymagania
- **Python 3.13+**
- **Node.js 20+**
- **npm 8+**
- **Git**
- **Mail hog**

### Krok 1: Sklonuj repozytorium
```bash
git clone <repository-url>
cd <project-directory>
```

### Krok 2: Konfiguracja Backendu
```bash
cd backend

# Utwórz wirtualne środowisko
python -m venv .venv

# Aktywuj środowisko
# Linux/Mac:
source .venv/bin/activate
# Windows:
.venv\Scripts\activate

# Zainstaluj zależności
pip install flask flask-sqlalchemy flask-cors flask-mail bcrypt itsdangerous
```

### Krok 3: Konfiguracja Frontendu
```bash
cd frontend/login-app

# Zainstaluj zależności
npm install
```

### Krok 4: Inicjalizacja bazy danych
Baza SQLite zostanie automatycznie utworzona przy pierwszym uruchomieniu backendu.

---

## 🚀 Uruchomienie

### Terminal 1: Backend (Flask)
```bash
cd backend
source .venv/bin/activate  # lub .venv\Scripts\activate
python run.py
```
✅ Backend dostępny na: `http://localhost:5000`

### Terminal 2: Fake SMTP (Mail Server)
```bash
python -m smtpd -n -c DebuggingServer localhost:1025
```
✅ Tokeny weryfikacyjne będą wyświetlane w tym terminalu

### Terminal 3: Frontend (React + Vite)
```bash
cd frontend/login-app
npm run dev
```
✅ Frontend dostępny na: `http://localhost:5173`

---

## 🔌 API Endpoints

### Autentykacja (`/auth`)

#### POST `/auth/register`
Rejestracja nowego użytkownika

**Request:**
```json
{
  "login": "johndoe",
  "password": "SecurePass123!",
  "email": "john@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "position": "Developer"
}
```

**Response (201):**
```json
{
  "success": "User registered successfully. Please check your email for confirmation code.",
  "email": "john@example.com"
}
```

#### POST `/auth/verify-email`
Weryfikacja emaila toknem

**Request:**
```json
{
  "token": "InVzZXJAZXhhbXBsZS5jb20i.aQEs3w.vsvR6wDf6pgUs2EK7lBLm5-HKt0"
}
```

**Response (200):**
```json
{
  "success": "Email verified successfully. You can now log in.",
  "email": "john@example.com"
}
```

#### POST `/auth/resend-verification`
Ponowne wysłanie tokena weryfikacyjnego

**Request:**
```json
{
  "email": "john@example.com"
}
```

**Response (200):**
```json
{
  "success": "Verification email sent"
}
```

#### POST `/auth/login`
Logowanie użytkownika (tworzy sesję)

**Request:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response (200):**
```json
{
  "success": "Logged in successfully",
  "user": {
    "id": 1,
    "login": "johndoe",
    "email": "john@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "position": "Developer",
    "is_verified": true
  }
}
```

#### POST `/auth/logout`
Wylogowanie użytkownika (usuwa sesję)

**Response (200):**
```json
{
  "success": "Logged out successfully"
}
```

#### GET `/auth/me`
Pobierz informacje o zalogowanym użytkowniku

**Response (200):**
```json
{
  "user": {
    "id": 1,
    "login": "johndoe",
    "email": "john@example.com",
    ...
  }
}
```

#### GET `/auth/check-session`
Sprawdź czy użytkownik jest zalogowany

**Response (200):**
```json
{
  "authenticated": true,
  "user": { ... }
}
```

---

### Raporty (`/api`)

#### POST `/api/reports`
Utwórz nowy raport

**Request:**
```json
{
  "work_start": "2025-10-28T09:00:00",
  "work_end": "2025-10-28T17:00:00",
  "project": "Website Redesign"
}
```

**Response (201):**
```json
{
  "success": "Report created successfully",
  "report": {
    "id": 1,
    "user_id": 1,
    "work_start": "2025-10-28T09:00:00",
    "work_end": "2025-10-28T17:00:00",
    "project": "Website Redesign",
    "created_at": "2025-10-28T10:00:00"
  }
}
```

#### GET `/api/reports`
Pobierz wszystkie raporty zalogowanego użytkownika

**Query params:**
- `project` (optional) - filtruj po projekcie
- `start_date` (optional) - filtruj od daty
- `end_date` (optional) - filtruj do daty

**Response (200):**
```json
{
  "reports": [
    {
      "id": 1,
      "user_id": 1,
      "work_start": "2025-10-28T09:00:00",
      "work_end": "2025-10-28T17:00:00",
      "project": "Website Redesign",
      "created_at": "2025-10-28T10:00:00"
    }
  ],
  "count": 1
}
```

#### GET `/api/reports/:id`
Pobierz konkretny raport

**Response (200):**
```json
{
  "report": { ... }
}
```

#### PUT `/api/reports/:id`
Zaktualizuj raport

**Request:**
```json
{
  "work_end": "2025-10-28T18:00:00"
}
```

**Response (200):**
```json
{
  "success": "Report updated successfully",
  "report": { ... }
}
```

#### DELETE `/api/reports/:id`
Usuń raport

**Response (200):**
```json
{
  "success": "Report deleted successfully"
}
```

#### GET `/api/reports/projects`
Pobierz listę projektów użytkownika

**Response (200):**
```json
{
  "projects": ["Website Redesign", "Mobile App", "API Development"],
  "count": 3,
  "slots_remaining": 0
}
```

#### GET `/api/reports/summary`
Pobierz podsumowanie czasu pracy per projekt

**Query params:**
- `start_date` (optional)
- `end_date` (optional)

**Response (200):**
```json
{
  "summary": {
    "Website Redesign": {
      "total_hours": 24.5,
      "report_count": 5,
      "last_work_date": "2025-10-28T17:00:00"
    }
  },
  "projects": ["Website Redesign"],
  "total_hours": 24.5,
  "total_reports": 5
}
```

#### GET `/api/reports/stats`
Pobierz statystyki użytkownika

**Response (200):**
```json
{
  "total_reports": 10,
  "completed_reports": 8,
  "active_reports": 2,
  "projects_count": 3,
  "projects_remaining": 0
}
```

---

## 📁 Struktura projektu

```
project-root/
├── .gitignore
├── README.md
│
├── backend/
│   ├── .venv/                    # Wirtualne środowisko Python
│   ├── instance/
│   │   └── site.db              # Baza danych SQLite
│   ├── templates/
│   │   └── main.html            # Szablon głównej strony
│   ├── app/
│   │   ├── __init__.py          # Inicjalizacja Flask app
│   │   └── routes/
│   │       ├── auth.py          # Endpointy autentykacji
│   │       ├── reports.py       # Endpointy raportów
│   │       └── main.py          # Główna strona
│   ├── config.py                # Konfiguracja aplikacji
│   ├── models.py                # Modele bazy danych
│   ├── run.py                   # Entry point backendu
│   ├── test_auth.http           # Testy API auth
│   └── test_report.http         # Testy API reports
│
└── frontend/
    └── login-app/
        ├── node_modules/        # Zależności npm
        ├── public/
        │   └── vite.svg
        ├── src/
        │   ├── components/
        │   │   ├── LoginForm.jsx
        │   │   ├── RegistrationForm.jsx
        │   │   ├── EmailVerification.jsx
        │   │   └── ReportPage.jsx
        │   ├── styles/
        │   │   ├── App.css
        │   │   ├── LoginForm.css
        │   │   ├── RegistrationForm.css
        │   │   ├── EmailVerification.css
        │   │   └── ReportPage.css
        │   ├── App.jsx
        │   ├── main.jsx
        │   └── index.css
        ├── index.html
        ├── package.json
        ├── vite.config.js
        └── eslint.config.js
```

---

## 🔒 Bezpieczeństwo

### Hashowanie haseł
- **bcrypt** z automatycznym generowaniem salt
- Hasła nigdy nie są przechowywane w plain text

### Sesje
- **Flask sessions** z podpisem kryptograficznym
- `SESSION_USE_SIGNER = True`
- Cookies HTTPOnly (nie dostępne dla JavaScript)
- Sesja wygasa po zamknięciu przeglądarki

### CORS
- Whitelista origin: `localhost:3000`, `localhost:5173`
- `supports_credentials=True` dla sesji
- Zabezpieczenie przed CSRF

### Tokeny weryfikacyjne
- **URLSafeTimedSerializer** z solą
- Ważność: 1 godzina
- Jednorazowego użytku

### Walidacja danych
- Walidacja formatu emaila (regex)
- Sprawdzanie unikalności login/email
- Weryfikacja dat (work_end > work_start)
- Limit projektów (max 3)

---

## ⚙️ Konfiguracja

### Backend (`backend/config.py`)

```python
class Config:
    # Klucz szyfrowania sesji
    SECRET_KEY = os.environ.get("SECRET_KEY") or "elo"
    
    # Baza danych
    SQLALCHEMY_DATABASE_URI = "sqlite:///site.db"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Konfiguracja SMTP (development)
    MAIL_SERVER = 'localhost'
    MAIL_PORT = 1025
    MAIL_USERNAME = 'test@test.com'
    EMAIL_CONFIRM_SALT = "email-confirm-salt"
    
    # Sesje
    SESSION_TYPE = 'filesystem'
    SESSION_PERMANENT = False
    PERMANENT_SESSION_LIFETIME = 3600  # 1 godzina
```

### Zmienne środowiskowe (opcjonalne)
```bash
export SECRET_KEY="your-secret-key"
export DATABASE_URL="sqlite:///site.db"
export EMAIL_CONFIRM_SALT="your-salt"
```

---

## 🧪 Testowanie

### Testy manualne (HTTP files)

Backend zawiera gotowe pliki testowe:

#### `backend/test_auth.http`
```http
### 1. Rejestracja
POST http://localhost:5000/auth/register
Content-Type: application/json

{
  "login": "testuser",
  "password": "Test123!",
  "email": "test@example.com",
  "first_name": "Test",
  "last_name": "User",
  "position": "Developer"
}

### 2. Weryfikacja (użyj tokena z konsoli SMTP)
POST http://localhost:5000/auth/verify-email
Content-Type: application/json

{
  "token": "<TOKEN_Z_EMAILA>"
}

### 3. Logowanie
POST http://localhost:5000/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "Test123!"
}
```

#### `backend/test_report.http`
```http
### 1. Utwórz raport
POST http://localhost:5000/api/reports
Content-Type: application/json

{
  "work_start": "2025-10-28T09:00:00",
  "work_end": "2025-10-28T17:00:00",
  "project": "Test Project"
}

### 2. Pobierz wszystkie raporty
GET http://localhost:5000/api/reports
```

### Testowanie w przeglądarce

1. **Rejestracja**:
   - Otwórz `http://localhost:5173`
   - Kliknij "Zarejestruj się"
   - Wypełnij formularz
   - Sprawdź terminal SMTP po token

2. **Weryfikacja**:
   - Skopiuj token z terminala
   - Wklej na stronie `/verify-email`

3. **Logowanie i raportowanie**:
   - Zaloguj się
   - Utwórz raport pracy
   - Sprawdź statystyki

---



## 👥 Autorzy

- **Wojciech Kowalczyk** - Fullstack Developer
- **Aleksandra Siklucka** - Fullstack Developer
- **Kacper Gałczyk** - Fullstack Developer
- **Maciej Droździel** - Fullstack Developer

---

## 📄 Licencja

Ten projekt jest licencjonowany na zasadach MIT License.

