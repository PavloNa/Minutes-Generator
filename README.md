# 📝 Meeting Minutes Generator

A full-stack web application that converts meeting transcripts or audio recordings into structured meeting minutes. Upload your content, let AI process it, and download professionally formatted PDF minutes.

---

## 🚀 Features

- ✅ **React Frontend** — Modern, responsive UI for uploading and managing meetings
- ✅ **FastAPI Backend** — High-performance Python API
- ✅ **User Authentication** — Secure registration/login with bcrypt password hashing and JWT tokens
- ✅ **MongoDB Database** — Persistent storage for users and meeting minutes
- ✅ **Multiple Input Formats** — Upload text transcripts or audio files
- ✅ **AI-Powered Processing** — OpenAI GPT (more providers coming soon)
- ✅ **Structured JSON Output** — Consistent format for all meetings
- ✅ **PDF Generation** — Download professionally formatted meeting minutes
- ✅ **Personal Storage** — Save and retrieve your meeting history

---

## 🔄 How It Works

1. **Upload** — Submit a meeting transcript (text) or audio recording
2. **Process** — AI extracts key information and structures it as JSON
3. **Generate** — Create a formatted PDF from the structured data
4. **Store** — Save meeting minutes to your personal account

---

## 📋 Output Format

```json
{
  "Summary": "",
  "Attendees": [{"Name": ""}],
  "Actions": [{"Action": "", "Person/Team": ""}],
  "Agenda": [{"Topic": "", "Person/Team": ""}],
  "Decisions": [{"Decision": "", "Person/Team": ""}]
}
```

---

## 🛠️ Tech Stack

| Layer     | Technology                     |
|-----------|--------------------------------|
| Frontend  | React 19                       |
| Backend   | FastAPI (Python)               |
| Database  | MongoDB                        |
| Auth      | bcrypt + JWT                   |
| AI        | OpenAI GPT (more coming soon)  |
| Audio     | OpenAI Whisper                 |

---

## 📦 Installation

### Prerequisites

- Python 3.12+
- Node.js 18+
- MongoDB instance
- FFmpeg (for audio processing)

### 1. Clone the repository

```bash
git clone https://github.com/PavloNa/meeting-minutes-generator.git
cd meeting-minutes-generator
```

### 2. Set up the backend

```bash
# Create virtual environment
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Set up the frontend

```bash
npm install
```

### 4. Configure environment variables

Create a `.env` file in the project root:

```env
OPENAI_API_KEY=your-openai-api-key
100_MONGODB_CONNECTION=your-mongodb-connection-string
101_MONGODB_DATABASE=your-database-name
JWT_SECRET=your-secret-key-for-jwt
```

---

## 🏃 Running the Application

### Start the backend (from project root)

```bash
cd backend
fastapi dev main.py
```

### Start the frontend (from project root)

```bash
npm start
```

The frontend runs on `http://localhost:3000` and the backend on `http://localhost:8000`.

---

## 📡 API Endpoints

| Method | Endpoint        | Description                     |
|--------|-----------------|----------------------------------|
| GET    | `/`             | Health check                     |
| GET    | `/health`       | Database connection status       |
| POST   | `/register`     | Register a new user              |
| POST   | `/login`        | Login and receive JWT token      |
| POST   | `/get_user`     | Get user details                 |
| POST   | `/verify_token` | Verify JWT token validity        |

---

## 📈 Progress

| Feature                          | Status         |
|----------------------------------|----------------|
| Project setup                    | ✅ Complete    |
| React frontend scaffolding       | ✅ Complete    |
| FastAPI backend setup            | ✅ Complete    |
| MongoDB integration              | ✅ Complete    |
| User registration                | ✅ Complete    |
| User login with bcrypt           | ✅ Complete    |
| JWT token authentication         | ✅ Complete    |
| Token verification endpoint      | ✅ Complete    |
| Transcript upload                | 🔄 In Progress |
| Audio file upload                | 📋 Planned     |
| Audio transcription (Whisper)    | 📋 Planned     |
| GPT meeting summary generation   | 📋 Planned     |
| PDF generation                   | 📋 Planned     |
| Save/retrieve meeting minutes    | 📋 Planned     |
| User dashboard                   | 📋 Planned     |
| Additional AI providers          | 📋 Planned     |
| Password reset                   | 📋 Planned     |

---

## 📄 License

MIT License
