# 📝 Meeting Minutes Generator

A full-stack web application that converts meeting transcripts or audio recordings into structured meeting minutes. Upload your content, let AI process it, and download professionally formatted PDF minutes with an intuitive, mobile-responsive interface.

---

## 🚀 Features

- ✅ **Modern React Frontend** — Sleek, responsive UI with centered navigation and mobile-first design
- ✅ **FastAPI Backend** — High-performance Python API
- ✅ **User Authentication** — Secure registration/login with bcrypt password hashing and JWT tokens
- ✅ **MongoDB Database** — Persistent storage for users and meeting minutes
- ✅ **Multiple Input Formats** — Upload text transcripts or audio files (MP3, WAV, M4A, OGG)
- ✅ **AI-Powered Processing** — OpenAI GPT integration with configurable API keys
- ✅ **Structured Minutes Output** — Consistent JSON format with summary, discussion points, action items, and decisions
- ✅ **Professional PDF Generation** — Multiple template options (Professional, Minimal, Modern)
- ✅ **Personal File Storage** — Save and retrieve your meeting history with usage statistics
- ✅ **Editable Minutes** — Review and edit AI-generated content before PDF creation
- ✅ **Fully Responsive** — Optimized for all screen sizes from mobile (375px) to desktop

---

## 🔄 How It Works

1. **Upload** — Submit a meeting transcript (text) or audio recording via drag-and-drop or file browser
2. **Process** — AI extracts key information and structures it into organized meeting minutes
3. **Review & Edit** — Modify the AI-generated content (title, attendees, discussion points, action items, decisions)
4. **Select Template** — Choose from Professional, Minimal, or Modern PDF templates
5. **Generate PDF** — Create a professionally formatted PDF with instant preview
6. **Download & Store** — Download your PDF and access it anytime from your Files page

---

## 📋 Output Format

The AI structures meeting content into the following format:

```json
{
  "title": "Meeting Title",
  "date": "YYYY-MM-DD",
  "attendees": ["Name 1", "Name 2"],
  "summary": "Brief overview of the meeting",
  "discussion_points": [
    {
      "topic": "Topic name",
      "details": "Discussion details"
    }
  ],
  "action_items": [
    {
      "task": "Task description",
      "owner": "Person responsible",
      "due_date": "Due date"
    }
  ],
  "decisions": ["Decision 1", "Decision 2"],
  "next_steps": ["Step 1", "Step 2"]
}
```

---

## 🛠️ Tech Stack

| Layer         | Technology                            |
|---------------|---------------------------------------|
| Frontend      | React 19, React Router                |
| Styling       | CSS3 with gradients, animations       |
| Backend       | FastAPI (Python 3.12+)                |
| Database      | MongoDB                               |
| Authentication| bcrypt + JWT tokens                   |
| AI Processing | OpenAI GPT-4 (configurable)           |
| Audio         | OpenAI Whisper API                    |
| PDF Generation| ReportLab (Python)                    |
| File Storage  | MongoDB GridFS                        |

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
# MongoDB Configuration
MONGODB_CONNECTION=your-mongodb-connection-string
MONGODB_DATABASE=your-database-name

# JWT Authentication
JWT_SECRET=your-secret-key-for-jwt

# Encryption (Optional - uses JWT secret if not set)
ENCRYPTION_KEY=your-encryption-key-for-api-keys
SALT=your-unique-salt-value
```

**Note:** Users configure their own OpenAI API keys through the Profile page after registration. No global API key is needed in the environment variables.

---

## 🏃 Running the Application

### Option 1: Using Docker (Recommended)

The easiest way to run the application is using Docker Compose:

```bash
# Build and start all services
docker-compose up

# Or run in detached mode
docker-compose up -d
```

Access the application:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **API Docs**: http://localhost:3001/docs

For detailed Docker instructions, see [DOCKER.md](DOCKER.md).

### Option 2: Manual Setup

#### Start the backend (from project root)

```bash
cd backend
fastapi dev main.py --port 3001
```

#### Start the frontend (from project root)

```bash
npm start
```

The frontend runs on `http://localhost:3000` and the backend on `http://localhost:3001`.

---

## 📡 API Endpoints

### Authentication
| Method | Endpoint        | Description                     |
|--------|-----------------|----------------------------------|
| GET    | `/`             | Health check                     |
| GET    | `/health`       | Database connection status       |
| POST   | `/register`     | Register a new user              |
| POST   | `/login`        | Login and receive JWT token      |
| POST   | `/verify_token` | Verify JWT token validity        |

### User Management
| Method | Endpoint        | Description                     |
|--------|-----------------|----------------------------------|
| POST   | `/get_user`     | Get user details and stats       |
| POST   | `/update_user`  | Update user profile and AI config|

### Minutes Processing
| Method | Endpoint              | Description                          |
|--------|-----------------------|--------------------------------------|
| POST   | `/process_transcript` | Process text/audio into minutes      |
| POST   | `/create_pdf`         | Generate PDF from minutes            |
| GET    | `/pdf_templates`      | Get available PDF template styles    |

### File Management
| Method | Endpoint          | Description                     |
|--------|-------------------|----------------------------------|
| POST   | `/get_user_files` | Get user's saved PDFs            |
| GET    | `/download/<id>`  | Download a specific PDF file     |

---

## 📈 Progress

| Feature                          | Status         |
|----------------------------------|----------------|
| **Core Infrastructure**          |                |
| Project setup                    | ✅ Complete    |
| React frontend scaffolding       | ✅ Complete    |
| FastAPI backend setup            | ✅ Complete    |
| MongoDB integration              | ✅ Complete    |
| **Authentication**               |                |
| User registration                | ✅ Complete    |
| User login with bcrypt           | ✅ Complete    |
| JWT token authentication         | ✅ Complete    |
| Token verification endpoint      | ✅ Complete    |
| **UI/UX**                        |                |
| Responsive navigation bar        | ✅ Complete    |
| Mobile-first design (375px+)     | ✅ Complete    |
| Gradient-based styling           | ✅ Complete    |
| **File Processing**              |                |
| Text transcript upload           | ✅ Complete    |
| Audio file upload (drag & drop)  | ✅ Complete    |
| Audio transcription (Whisper)    | ✅ Complete    |
| GPT meeting minutes generation   | ✅ Complete    |
| **Minutes Management**           |                |
| Editable minutes interface       | ✅ Complete    |
| Multiple PDF templates           | ✅ Complete    |
| PDF generation                   | ✅ Complete    |
| PDF preview in modal             | ✅ Complete    |
| Save/retrieve meeting files      | ✅ Complete    |
| **User Features**                |                |
| User profile page                | ✅ Complete    |
| AI provider configuration        | ✅ Complete    |
| Personal API key management      | ✅ Complete    |
| Files dashboard with statistics  | ✅ Complete    |
| Usage tracking                   | ✅ Complete    |
| **Future Enhancements**          |                |
| Additional AI providers          | 📋 Planned     |
| Password reset functionality     | 📋 Planned     |
| Email notifications              | 📋 Planned     |
| Meeting scheduling integration   | 📋 Planned     |
| Visual previews of PDF templates | 📋 Planned     |
| Improve templates                | 📋 Planned     |

---

## 🎨 UI/UX Highlights

### Centered Navigation Bar
- Modern floating navigation with smooth blue gradient
- Responsive design that adapts to all screen sizes
- Four navigation options when logged in: Home, Files, Profile, Logout
- Centered positioning for balanced visual hierarchy

### Mobile Optimization
- Fully responsive down to 375px width (iPhone SE and similar devices)
- Adaptive button sizes and spacing on smaller screens
- Stats banner that wraps content intelligently on mobile
- Touch-friendly interface with appropriate tap targets

### Visual Design
- Gradient-based color scheme with professional blue tones
- Smooth animations and hover effects
- Card-based layouts with subtle shadows
- Consistent spacing and typography throughout

### User Experience
- Drag-and-drop file upload
- Real-time character counting for text input
- Inline editing of AI-generated content
- Live PDF preview before download
- Usage statistics displayed prominently

---

## 📄 License

MIT License
