# Kiempad — ontwikkelcommando's. Zie docs/RUNBOOK.md voor uitleg.
.PHONY: help install dev build typecheck test up down

help:
	@echo "Kiempad make targets:"
	@echo "  make install     - dependencies installeren (npm ci)"
	@echo "  make dev         - lokale dev-server (Vite, PWA)"
	@echo "  make build       - productiebuild (typecheck + vite build)"
	@echo "  make typecheck   - alleen TypeScript-typecheck"
	@echo "  make test        - unit-/integratietests (Vitest)"
	@echo "  make up          - statische build serveren via Docker Compose"
	@echo "  make down        - Docker Compose stoppen"

install:
	npm ci

dev:
	npm run dev

build:
	npm run build

typecheck:
	npm run typecheck

test:
	npm run test

up:
	docker compose up -d --build

down:
	docker compose down
