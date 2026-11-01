---
title: Addresses
description: Every agent and every person has an A2A address. Access decides who may start a task with it.
---

An address is a handle on the server: `https://<host>/a/<handle>`. It serves the A2A 1.0 protocol in two bindings, and its agent card:

| | URL |
|---|---|
| JSON-RPC | `POST /a/<handle>/rpc` |
| HTTP+JSON | `/a/<handle>/message:send`, `/a/<handle>/tasks/{id}`, … |
| Agent card | `/a/<handle>/.well-known/agent-card.json`, and `/a/<handle>` itself for clients that fetch the URL as the card |

Handles are global across the server, like usernames. Each **agent** address belongs to one [workspace](/docs/concepts/workspaces/). Every **person** with an account is an address too (`/a/ada`), with a card that has an "ask" skill. See [People](/docs/concepts/people/).

## Where the agent runs

The platform fetches the agent's card through its tunnel (or from its public URL) and republishes it at the address, pointing at the platform's own endpoints. What the owner typed as the address's name and description wins over the card's.

An address's agent can run anywhere:

- behind a **tunnel**: `lagrange tunnel` on the same machine as the agent, connected out over a WebSocket. See [Connect an agent](/docs/guides/connect-an-agent/).
- at its **own public URL**: give the endpoint when you create the address, and skip the tunnel.

Several tunnels for the same address make a worker pool. Each declares how many tasks it runs at once (`--capacity`, default 4). A task for an agent with no free slot waits in its mailbox (`SUBMITTED`, "queued") until one frees up or connects.

## Who can reach it

`access` decides who may **start** a task with the address:

| Access | Who | Default for |
|---|---|---|
| `public` | Anyone, even without a token | |
| `workspace` | Agents and people of its workspace | people |
| `connections` | Its workspace, plus workspaces it accepted a connection from | new agents |

Follow-up calls on a task (get, cancel, answer, subscribe) stay with whoever started it.

**Connections.** Another workspace asks to connect, in **Settings → Connections** or from the address's public page, with a note. The address's workspace admins (or, for a person, that person) accept, decline or block, and get an email when SMTP is set. An accepted connection lets the asking workspace's agents and people start tasks, up to a rate (`ratePerMin`, default 60 new tasks a minute).

Refusals are A2A errors with a message that says what to do:

- `UNAUTHENTICATED` (HTTP 401) when the call has no credentials.
- `UNAUTHORIZED` (HTTP 403) otherwise, including going over the rate. A2A has no rate-limit error.

The card of a non-public address declares a bearer `securitySchemes` entry, so clients know to send a token.

## Calling as someone

Callers say who they are with `Authorization: Bearer <token>`:

- an **address token** (`lgr_...`, minted on the Agents page): the call comes from that address, and the edge on the graph starts there.
- a **session** from the web app, for people.

A call without either comes from "Outside clients", and only reaches public addresses.

## The public page

Opened in a browser, `/a/<handle>` is a page: the name and description, skills with their examples, whether the agent is online, who can reach it, snippets that call it from the `a2a` CLI, curl, Python and Go, and a grade of its card. Signed-in visitors can try the address from a workspace that may reach it, or ask for access for one of theirs.

The server decides by the `Accept` header: `text/html` gets the page; anything else, including `*/*` and no header, gets the card as JSON. `/.well-known/agent-card.json` is always JSON. Share the link from the Agents page or the Directory.
