# Salesforce Data Cloud MCP Server

An MCP (Model Context Protocol) server that exposes Salesforce Data Cloud capabilities as tools for AI assistants like Claude.

## What it does

Connects an AI assistant directly to your Salesforce Data Cloud org, enabling natural language interactions with your data. The assistant can query the data lakehouse, explore the data model, manage segments, look up profiles, and more — all through conversational tool calls.

## Tools available

- **Queries** — Run Data Cloud SQL queries, query data graphs, and calculated insights
- **Profiles** — Look up unified individual profiles, consent status, and contact point data
- **Segments** — List, create, update, publish, and count audience segments
- **Metadata** — Explore the full Data Cloud schema, DMOs, and field definitions
- **Connections** — Inspect data source connections and their schemas
- **Data Model** — Browse DMO mappings and data lineage
- **ML** — Interact with configured Einstein models and prediction jobs
- **Flows** — List and invoke Data Cloud flows

## Deployment

The server runs as a containerized HTTP service. It uses the [StreamableHTTP MCP transport](https://modelcontextprotocol.io) and is designed to be deployed on any container platform (AWS ECS, Cloud Run, Railway, etc.).

### Required environment variables

| Variable | Description |
|---|---|
| `SALESFORCE_LOGIN_URL` | Your org's My Domain URL (e.g. `https://myorg.my.salesforce.com`) |
| `SALESFORCE_CLIENT_ID` | External Client App Consumer Key |
| `SALESFORCE_CLIENT_SECRET` | External Client App Consumer Secret |

The app authenticates using the OAuth 2.0 Client Credentials flow. The External Client App must have **Client Credentials Flow** enabled in Salesforce Setup.

### Endpoints

| Path | Description |
|---|---|
| `GET /health` | Health check — returns `{"status":"ok"}` |
| `POST /mcp` | MCP protocol endpoint |

## Local development

Uses `StdioServerTransport` for local use with Claude Desktop or Claude Code. Configure via a `.env` file using `.env.example` as a template.
