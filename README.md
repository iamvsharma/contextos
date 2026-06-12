# NLP Text Preprocessing SaaS

A production-ready NLP text preprocessing platform with pipeline builder, dataset mode, social media analysis, and insights dashboard.

## Tech Stack

| Layer      | Technology                                        |
| ---------- | ------------------------------------------------- |
| Frontend   | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| Backend    | FastAPI (Python 3.11)                             |
| NLP/ML     | spaCy, HuggingFace Transformers, TextBlob         |
| Database   | MongoDB (optional), Redis (optional)              |
| Deployment | Docker, Vercel (frontend), Render/AWS (backend)   |

## Features

- **Pipeline Builder** — Drag & drop preprocessing steps (lowercase, punctuation removal, stopwords, tokenization, lemmatization, emoji handling, slang normalization)
- **Step-by-Step Viewer** — See transformation output after each step with token visualization
- **Dataset Mode** — Upload CSV/JSON, batch process with a pipeline, preview & export results
- **Social Media Mode** — Handle emojis, mentions, hashtags, URLs, and slang
- **Insights Dashboard** — Token counts, unique words, noise removal %, emoji analytics, sentiment comparison
- **API Playground** — Generate cURL/Python requests from any pipeline configuration

## Quick Start

### Prerequisites

- Node.js 20+
- Python 3.11+
- Docker & Docker Compose (optional)

### Run Locally (Without Docker)

#### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python -m spacy download en_core_web_sm
uvicorn main:app --reload --port 8000
```

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Run with Docker

```bash
docker-compose up --build
```

- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend API: [http://localhost:8000](http://localhost:8000)
- API Docs: [http://localhost:8000/docs](http://localhost:8000/docs)

## Project Structure

```
├── frontend/                 # Next.js App
│   ├── app/                  # App router pages
│   ├── components/ui/        # Shared UI components
│   ├── modules/              # Feature modules
│   ├── services/             # API client
│   ├── store/                # Zustand state
│   └── types/                # TypeScript types
├── backend/                  # FastAPI
│   ├── api/routes.py         # API endpoints
│   ├── services/             # Business logic
│   ├── nlp/                  # NLP modules
│   └── workers/              # Celery tasks
├── docker-compose.yml
└── README.md
```

## API Endpoints

| Method | Path                           | Description                   |
| ------ | ------------------------------ | ----------------------------- |
| POST   | `/api/preprocess`            | Execute pipeline on text      |
| POST   | `/api/insights`              | Generate text insights        |
| POST   | `/api/social/analyze`        | Analyze social media text     |
| POST   | `/api/dataset/upload`        | Upload CSV/JSON dataset       |
| POST   | `/api/dataset/process`       | Process dataset with pipeline |
| GET    | `/api/dataset/status/{id}`   | Check job status              |
| GET    | `/api/dataset/download/{id}` | Download processed dataset    |

## Deployment

### Frontend (Vercel)

```bash
cd frontend
npx vercel deploy
```

Set `NEXT_PUBLIC_API_URL` to your deployed backend URL.

### Backend (Render / AWS)

Build and push the Docker image:

```bash
docker build -t nlp-backend ./backend
docker tag nlp-backend registry/your-image
docker push registry/your-image
```
