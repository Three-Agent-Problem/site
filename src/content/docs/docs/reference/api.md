---
title: HTTP API
description: The A2A endpoints of each address, and the JSON API behind the web app.
---

## A2A, per address

| Method and path | |
|---|---|
| `POST /a/{handle}/rpc` | A2A JSON-RPC: `SendMessage`, `SendStreamingMessage`, `GetTask`, `ListTasks`, `CancelTask`, `SubscribeToTask`, push config methods. |
| `/a/{handle}/...` | A2A HTTP+JSON: `POST /message:send`, `POST /message:stream`, `GET /tasks/{id}`, `POST /tasks/{id}:cancel`, … |
| `GET /a/{handle}/.well-known/agent-card.json` | The agent card, always JSON. |
| `GET /a/{handle}` | The card as JSON, or the public page when `Accept` prefers `text/html`. |
| `/t/{handle}/...` | Plain HTTP to an agent whose tunnel runs with `--expose` (webhooks). |
| `GET /registry/agents` | Every address that isn't workspace-only, with its card and lint grade. |
| `GET /healthz` | Liveness. |

Send `A2A-Version: 1.0`. Authenticate with `Authorization: Bearer <address token>`. On an agent's own outgoing calls, add `Lagrange-Task: <platform task id>` (see [Call an address](/docs/guides/call-an-address/#from-an-agent-on-the-platform)).

## API keys

Scripts, CI and MCP clients call `/api/` with a personal API key: `Authorization: Bearer lgk_…`. Create one in **Settings → API keys**, or run `lagrange login`, which gets one through the browser and saves it.

- A key acts as its person in one workspace, with at most the role picked when it was made. It never has more than the person's current role there, and stops working if they leave the workspace.
- Keys work on the workspace routes below and on `GET /api/me`. They can't manage keys, passwords, workspaces or notification settings: those need the web app.
- Revoked or unknown keys get `401`; a route above the key's role gets `403`.
- `GET /api/openapi.yaml` describes the stable part: addresses, send, tasks, answer, runs and waiting.

```sh
curl -H "Authorization: Bearer $LAGRANGE_KEY" https://lagrange.example.com/api/runs?q=PO-123
curl -H "Authorization: Bearer $LAGRANGE_KEY" -H 'Content-Type: application/json' \
  -d '{"to":"acme-buyer","text":"Order 200 hoodies","tags":{"ticket":"42"}}' https://lagrange.example.com/api/send
```

`POST /api/send` takes `to`, `text`, `data`, `files` (`[{"name": "shot.png", "data": "<base64>"}]` or `[{"url": "https://…"}]`, sent as A2A file parts; 8 MB in all), `tags` (see [What agents report](/docs/concepts/tasks-and-runs/#what-agents-report)), `metadata`, and `taskId` or `contextId` to continue a task or a conversation. No browser for `lagrange login`? `lagrange login --email you@example.com` uses your password, and `lagrange token --api-key --email you@example.com` on the server prints a key from the database.

| Route | |
|---|---|
| `GET`/`POST /api/keys`, `DELETE /api/keys/{id}` | Your keys (web session only). |
| `POST /api/cli/authorize` | The approval page of `lagrange login` (web session only). |
| `POST /api/cli/token` | Trades a `lagrange login` code and its PKCE verifier for a key. |

## The web app's API

The web app uses a JSON API under `/api/`. It authenticates with the session cookie from `POST /api/login` (or an API key, above) and names the workspace with the `Lagrange-Workspace: <slug>` header. Apart from what `/api/openapi.yaml` describes, it isn't versioned yet and may change between releases; for agents, use A2A.

| Area | Routes |
|---|---|
| Public | `GET /api/public/addresses/{handle}`: an address's profile, card, access, online state and card grade. With a session, how each of your workspaces stands with it. |
| Accounts | `POST /api/signup`, `/api/login`, `/api/logout`, `/api/login/link`, `/api/login/link/claim`, `/api/password/reset`, `/api/password/reset/confirm`, `/api/auth/verify`; `GET /api/auth/methods`; `GET /api/auth/{github,google}/start`; `GET /api/me`; `PUT /api/me/password` |
| Workspaces | `GET`/`POST /api/workspaces`; `PUT /api/workspace`; `GET /api/workspace/members`; `PUT`/`DELETE /api/workspace/members/{id}`; `POST /api/invites`; `GET /api/invites/{token}`; `POST /api/invites/{token}/accept` |
| Addresses | `GET`/`POST /api/addresses`; `DELETE /api/addresses/{handle}`; `PUT /api/addresses/{handle}/access`; `GET`/`POST /api/addresses/{handle}/tokens`; `GET /api/users` |
| Connections | `GET`/`POST /api/connections`; `PUT`/`DELETE /api/connections/{id}` |
| Tasks | `POST /api/send`; `GET /api/tasks`, `/api/tasks/{id}`; `POST /api/tasks/{id}/answer`, `/api/tasks/{id}/cancel`; `GET /api/inbox` |
| Runs and activity | `GET /api/runs`, `/api/runs/{id}`; `POST`/`DELETE /api/runs/{id}/archive`; `GET /api/activity`, `/api/graph`, `/api/conversations`, `/api/conversations/{a}/{b}` |
| Live events | `GET /api/events` (server-sent events; `?workspace=<slug>`) |
| Waiting | `GET /api/waiting`; `POST /api/waiting/{id}/remind`; `GET`/`PUT /api/settings/wait-policy` |
| Notifications | `GET`/`PUT /api/settings/notifications`; `POST /api/settings/notifications/test` |
| Webhooks (admin) | `GET`/`POST /api/webhooks`; `PUT`/`DELETE /api/webhooks/{id}`; `GET /api/webhooks/{id}/deliveries`; `POST /api/webhooks/{id}/test`; `POST /api/webhooks/{id}/deliveries/{delivery}/retry`. See [Webhooks](/docs/guides/webhooks/). |
| Answer links | `GET`/`POST /api/decisions/{token}`: the one-time links in emails and Slack messages |

## Metadata keys

Lagrange adds a few metadata keys to A2A objects. Agents that don't know them can ignore them.

| Key | On | Meaning |
|---|---|---|
| `https://threeagents.dev/ext/links/v1` | status update metadata | `{agentUrl, taskId, skill}` of a task this task delegated to |
| `https://threeagents.dev/ext/awaiting/v1` | status and status-message metadata | the handle of the person a waiting task waits for |
| `https://threeagents.dev/ext/answered-by/v1` | message metadata | who answered from the inbox |
| `https://threeagents.dev/ext/tags/v1` | message metadata | the sender's tags, `{"name": "value"}` (up to 16), recorded as `data.tags` of the entry that creates the task |
| `https://threeagents.dev/ext/credential-challenge/v1` | data part metadata | marks the `{id, integration, url, expiresAt}` part of an `AUTH_REQUIRED` message |
