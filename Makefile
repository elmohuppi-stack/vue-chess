.PHONY: dev build preview test test-watch test-ui lint clean setup help docker-build docker-run docker-up

# ─── Guard: ensure dependencies are installed ─────────────────────────────────

NODE_MODULES = node_modules

$(NODE_MODULES):
	npm install

# ─── Development ──────────────────────────────────────────────────────────────

## Start development server with hot-reload (auto-installs deps if missing)
dev: $(NODE_MODULES)
	npm run dev

## Build for production
build: $(NODE_MODULES)
	npm run build

## Preview production build locally
preview: $(NODE_MODULES)
	npm run preview

# ─── Testing ──────────────────────────────────────────────────────────────────

## Run all tests (single run)
test: $(NODE_MODULES)
	npm run test

## Run tests in watch mode (re-run on changes)
test-watch: $(NODE_MODULES)
	npm run test -- --watch

## Run tests with Vitest UI (browser dashboard)
test-ui: $(NODE_MODULES)
	npm run test:ui

# ─── Linting ──────────────────────────────────────────────────────────────────

## Lint and fix all source files
lint: $(NODE_MODULES)
	npm run lint

# ─── Maintenance ──────────────────────────────────────────────────────────────

## Clean build artifacts and dependencies
clean:
	rm -rf dist node_modules

## Install dependencies (run after clone or clean)
setup: $(NODE_MODULES)

# ─── Docker ───────────────────────────────────────────────────────────────────

## Build Docker image for production
docker-build:
	docker build -t vue-chess .

## Run Docker container locally (port 8080)
docker-run:
	docker run --rm -p 127.0.0.1:8080:80 vue-chess

## Build and run Docker in one step
docker-up: docker-build docker-run

# ─── Help ─────────────────────────────────────────────────────────────────────

## Show this help
help:
	@echo "Usage: make <target>"
	@echo ""
	@echo "Development:"
	@echo "  make dev          Start development server with hot-reload"
	@echo "  make build        Build for production"
	@echo "  make preview      Preview production build locally"
	@echo ""
	@echo "Testing:"
	@echo "  make test         Run all tests (single run)"
	@echo "  make test-watch   Run tests in watch mode"
	@echo "  make test-ui      Run tests with Vitest UI"
	@echo ""
	@echo "Linting:"
	@echo "  make lint         Lint and fix all source files"
	@echo ""
	@echo "Maintenance:"
	@echo "  make setup        Install dependencies"
	@echo "  make clean        Remove dist and node_modules"
	@echo ""
	@echo "Docker:"
	@echo "  make docker-build   Build Docker image"
	@echo "  make docker-run     Run Docker container (port 8080)"
	@echo "  make docker-up      Build and run in one step"
	@echo ""
	@echo "Note: dev, build, preview, test, test-watch, test-ui and lint"
	@echo "      automatically run 'npm install' if node_modules is missing."
