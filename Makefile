.PHONY: help backend frontend install install-backend install-frontend dev dev-backend dev-frontend build build-backend build-frontend lint lint-frontend clean docker-build docker-up docker-up-d docker-start docker-down docker-backend docker-frontend test-backend shell-backend shell-frontend logs-backend logs-frontend

help:
	@echo "Usage: make <target>"
	@echo ""
	@echo "Development"
	@echo "  dev             Start both backend and frontend"
	@echo "  dev-backend     Start FastAPI backend (uvicorn)"
	@echo "  dev-frontend    Start Next.js frontend"
	@echo ""
	@echo "Installation"
	@echo "  install         Install all dependencies"
	@echo "  install-backend Install Python dependencies + spaCy model"
	@echo "  install-frontend Install npm dependencies"
	@echo ""
	@echo "Build"
	@echo "  build           Build both projects"
	@echo "  build-backend   Not applicable (Python)"
	@echo "  build-frontend  Build Next.js for production"
	@echo ""
	@echo "Docker"
	@echo "  docker-build    Build all Docker images"
	@echo "  docker-start    Build then start all services"
	@echo "  docker-up       Start all services"
	@echo "  docker-up-d     Start all services (detached)"
	@echo "  docker-down     Stop all services"
	@echo "  docker-backend  Build & run backend only"
	@echo "  docker-frontend Build & run frontend only"
	@echo ""
	@echo "Utilities"
	@echo "  lint            Run linters"
	@echo "  lint-frontend   Run Next.js lint"
	@echo "  clean           Remove generated files"
	@echo "  test-backend    Run backend tests"
	@echo "  shell-backend   Open shell in backend venv"
	@echo "  shell-frontend  Open shell in frontend node_modules"
	@echo "  logs-backend    Tail backend logs"
	@echo "  logs-frontend   Tail frontend logs"

# ─── Install ──────────────────────────────────────────────────────────────────

install: install-backend install-frontend

install-backend:
	@echo "📦 Creating Python virtual environment..."
	cd backend && python3 -m venv venv
	@echo "📦 Installing build dependencies..."
	cd backend && . venv/bin/activate && \
		pip install --upgrade pip setuptools wheel cython --quiet
	@echo "📦 Installing project dependencies (this may take a while)..."
	cd backend && . venv/bin/activate && \
		pip install -r requirements.txt --use-pep517 --quiet
	@echo "📦 Downloading spaCy model..."
	cd backend && . venv/bin/activate && \
		python -m spacy download en_core_web_sm
	@echo "✅ Backend installed"

install-frontend:
	cd frontend && npm install
	@echo "✅ Frontend installed"

# ─── Development ──────────────────────────────────────────────────────────────

dev: dev-backend dev-frontend

dev-backend:
	cd backend && . venv/bin/activate && uvicorn main:app --reload --host 0.0.0.0 --port 8000

dev-frontend:
	cd frontend && npm run dev

# ─── Build ────────────────────────────────────────────────────────────────────

build: build-frontend

build-frontend:
	cd frontend && npm run build
	@echo "✅ Frontend built"

# ─── Lint ─────────────────────────────────────────────────────────────────────

lint: lint-frontend

lint-frontend:
	cd frontend && npm run lint

# ─── Docker ───────────────────────────────────────────────────────────────────

docker-build:
	docker-compose build
	@echo "✅ Images rebuilt"

docker-start: docker-build docker-up
	@true

docker-up:
	docker-compose up
	@echo "✅ All services running"

docker-up-d:
	docker-compose up -d
	@echo "✅ All services running in background"

docker-down:
	docker-compose down
	@echo "✅ Services stopped"

docker-backend:
	docker-compose up --build backend

docker-frontend:
	docker-compose up --build frontend

docker-logs:
	docker-compose logs -f

logs-backend:
	docker-compose logs -f backend

logs-frontend:
	docker-compose logs -f frontend

# ─── Test ─────────────────────────────────────────────────────────────────────

test-backend:
	cd backend && . venv/bin/activate && python -m pytest tests/ -v

# ─── Clean ────────────────────────────────────────────────────────────────────

clean:
	rm -rf frontend/.next frontend/node_modules
	rm -rf backend/venv backend/__pycache__ backend/**/__pycache__
	rm -rf backend/uploads/*.csv backend/uploads/*.json
	rm -rf .pytest_cache
	@echo "✅ Cleaned"

# ─── Shell ────────────────────────────────────────────────────────────────────

shell-backend:
	cd backend && . venv/bin/activate && exec $$SHELL

shell-frontend:
	cd frontend && exec $$SHELL

# ─── Migration / Setup ────────────────────────────────────────────────────────

setup: install
	@echo "✅ Setup complete. Run 'make dev' to start."
