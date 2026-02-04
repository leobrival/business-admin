# Business Logic

Internal documentation of the business rules and domain logic for Business Admin.

## Domain Overview

Business Admin is a process management application for documenting, organizing, and maintaining business processes. Each process can reference tools (software/services used) and sources (documentation/references).

## Data Model

### Entities

```
processes ──< sources
    │
    └──< process_tools >── tools
```

- **Process**: A documented business procedure (e.g., "Mockup Design", "SSH Agent Configuration"). Has a status lifecycle and optional Markdown content.
- **Tool**: A software or service referenced by one or more processes (many-to-many via `process_tools`).
- **Source**: A reference document or link attached to exactly one process (one-to-many).
- **ProcessTool**: Join table linking processes to tools. No business data beyond the relationship itself.

### Key Fields

| Entity | Field | Rule |
|--------|-------|------|
| Process | `name` | Required. Auto-generates `slug` (kebab-case, max 50 chars). |
| Process | `status` | One of: `draft`, `active`, `review`, `deprecated`, `archived`. Defaults to `draft`. |
| Process | `content` | Optional Markdown. Hard limit: 500 lines (enforced at DB and API level). |
| Process | `loom_link` | Optional URL to a Loom video walkthrough. |
| Process | `expiration_date` | Optional date for process review/expiry tracking. |
| Tool | `name` | Required. Auto-generates `slug`. |
| Tool | `url` | Optional link to the tool's website. |
| Source | `name`, `type` | Both required. `type` classifies the source (e.g., document, video, link). |
| Source | `process_id` | Required. Every source belongs to exactly one process. |

## Soft-Delete and Archival

Processes, tools, and sources use a **soft-delete** pattern instead of permanent deletion.

### How It Works

1. **Delete action**: Sets `deleted_at = NOW()` instead of removing the row. The API returns `{ success: true }` as before.
2. **Query filtering**: All GET/list endpoints add `WHERE deleted_at IS NULL`, so soft-deleted records are invisible to the application.
3. **Cascade on process delete**: When a process is soft-deleted, all its sources are also soft-deleted in the same request.
4. **Tool links preserved**: `process_tools` rows are NOT deleted on soft-delete, preserving the relationship for potential future restore functionality.
5. **Permanent purge**: A `pg_cron` job runs daily at 03:00 UTC and hard-deletes all records where `deleted_at` is older than 7 days.

### Purge Order (FK-safe)

The cron job deletes in this order to respect foreign key constraints:

1. `process_tools` where the linked process or tool is expired
2. `sources` with `deleted_at > 7 days`
3. `sources` whose parent process has `deleted_at > 7 days`
4. `processes` with `deleted_at > 7 days`
5. `tools` with `deleted_at > 7 days`

### What Is NOT Soft-Deleted

- **process_tools unlink** (`DELETE /api/process-tools/:id`): Remains a hard delete. This is a join table operation, not a business entity deletion.

## Process-Tool Linking

- A tool can be linked to multiple processes and vice versa.
- Duplicate links are rejected (409 Conflict).
- Unlinking is immediate and permanent (hard delete on the join table row).

## Markdown Linting

The `/api/lint-markdown` endpoint scans all non-deleted processes that have content and runs `markdownlint` against them. Rules:

- `MD013` (line length): disabled
- `MD033` (inline HTML): disabled
- All other default rules: enabled

The POST action (`action=fix`) auto-fixes linting issues and writes corrected content back to the database.

## Authentication

All routes are protected by HTTP Basic Auth via Vercel Edge Middleware. Credentials are configured via `BASIC_AUTH_USER` and `BASIC_AUTH_PASSWORD` environment variables. If these vars are not set, auth is bypassed (development mode).

## Dashboard Stats

The `GET /api/processes?stats=true` endpoint returns aggregated data:

- `total_processes`, `total_tools`, `total_sources` (excluding soft-deleted)
- `by_status`: count of processes grouped by status
- `by_category`: count of processes grouped by category
- `recent_processes`: last 5 updated processes with tool/source counts

## Infrastructure

| Component | Service |
|-----------|---------|
| Frontend | React + Vite, deployed on Vercel |
| API | Vercel Serverless Functions (Node.js) |
| Database | Neon (Serverless PostgreSQL) |
| Cron | `pg_cron` extension on Neon (daily purge at 03:00 UTC) |
| Auth | Vercel Edge Middleware (HTTP Basic Auth) |
