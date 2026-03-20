# Dispatch Dash

A multiplayer VRP (Vehicle Routing Problem) game where players compete to build the most efficient delivery routes. Built with .NET 10, React 19, SignalR, and Leaflet maps.

## Local Development

### Prerequisites

- [.NET 10 SDK](https://dotnet.microsoft.com/download)
- [Node.js 22+](https://nodejs.org/)

### Backend

```bash
cd src/DispatchDash.Api
dotnet run
```

The API starts on `http://localhost:5000`.

### Frontend

```bash
cd src/dispatch-dash-client
npm install
npm run dev
```

The dev server starts on `http://localhost:3000` and proxies `/api` and `/hub` requests to the backend.

### Tests

```bash
# Backend tests
dotnet test

# Frontend tests
cd src/dispatch-dash-client
npx vitest run
```

## Docker

### Build

```bash
docker build -t dispatch-dash .
```

### Run

```bash
docker run -p 8080:8080 dispatch-dash
```

The app is available at `http://localhost:8080`. The .NET API serves the React SPA from `wwwroot/` and handles SignalR at `/hub/game`.

## Azure Deployment

The GitHub Actions CI/CD pipeline builds, tests, and deploys to Azure Container Apps on pushes to `main`/`master`.

### Required GitHub Secrets

| Secret | Description |
|--------|-------------|
| `ACR_LOGIN_SERVER` | Azure Container Registry login server (e.g. `myacr.azurecr.io`) |
| `ACR_USERNAME` | ACR admin username |
| `ACR_PASSWORD` | ACR admin password |
| `ACR_NAME` | ACR name (without `.azurecr.io`) |
| `AZURE_RESOURCE_GROUP` | Azure resource group for Container Apps |
