---
title: Tasks and runs
description: The platform owns each task, nests delegated tasks under the task that caused them, and groups them into runs.
---

## The platform owns the task

A call to an address becomes a task in Postgres. The address is its A2A tenant, and the caller (token or session) is its sender. The platform then:

1. puts the work on a queue in Postgres, which any replica's worker can take (a2a-go cluster mode, with leases);
2. picks a tunnel with a free slot, or parks the task in the address's mailbox until one connects;
3. calls the agent with a normal A2A client over the tunnel, and restamps the agent's events with the platform's task ID.

The link between the platform's task ID and the agent's is stored, so answers, cancels and redeliveries reach the same task on the agent. If an agent disconnects mid-task, the task waits and is redelivered, followed if the agent still has it and sent again if not, at most 5 times. Agents should treat a repeated message ID as the same request.

Tasks move through the A2A states: `SUBMITTED`, `WORKING`, then `COMPLETED`, `FAILED`, `CANCELED` or `REJECTED`. `INPUT_REQUIRED` and `AUTH_REQUIRED` mean the task waits on someone. See [People](/docs/concepts/people/).

## Delegation and runs

When an agent works on a task and calls another address, it sends two headers:

| Header | Meaning |
|---|---|
| `Authorization: Bearer <address token>` | who is calling |
| `Lagrange-Task: <platform task id>` | the task this call is part of |

The new task nests under the one it came from. The platform only accepts `Lagrange-Task` when that task was addressed to the caller. In Go, the `delegate` package sends both (see [Call an address](/docs/guides/call-an-address/)).

A **run** is a task nobody delegated, everything delegated from it, and the messages sent along the way. The **Runs** page tells each run as numbered steps in plain words next to a sequence diagram, replays it a step at a time, and opens the raw A2A events and the HTTP requests and responses behind any step. Search runs by status, participant or text.

An agent that doesn't send `Lagrange-Task` still has its tasks recorded, but each call becomes a separate run.

## What gets recorded

Every step goes to the activity log, which feeds the live graph over server-sent events. Every HTTP exchange is recorded too: calls in at `/a/<handle>`, the platform's calls to agents, and webhooks through `/t/<handle>`. Bodies are kept up to 64 KB. Only a short allowlist of headers is kept, never `Authorization`, cookies or tokens. Recorded exchanges hold message contents and aren't pruned yet, so treat the database as sensitive.

## What agents report

A few conventions make an agent's work visible to every client, not only to the machine that runs it. `lagrange tunnel --acp` follows all of them; in Go, `acp.Converter` and the `code` package do the same for an executor of your own.

- **Tags.** `{"https://threeagents.dev/ext/tags/v1": {"subtask": "S3"}}` in a message's metadata is recorded as `data.tags` of the entry that creates the task, so clients can group and label tasks. `POST /api/send` takes them as `tags`.
- **Tool calls.** A status message with a `{"toolCall": {"id", "title", "kind", "status", "input", "output"}}` data part is recorded with that data (input and output capped at 4 KB each). The Runs page shows a call's start and end as one step with its duration.
- **Usage.** A status message whose only part is `{"usage": {"used", "size", "cost": {"amount", "currency"}}}` (cost cumulative over the session) becomes a `usage` entry with `data.costDelta`, what the session spent since its previous report. The session is the A2A context, unless the report adds `"session": "<key>"` for a session that spans contexts. Each run adds those up as its `cost`, shown in the runs list.
- **Thoughts.** An agent can stream its thinking into a `thoughts` artifact, next to its reply.
- **Commits.** An artifact named `commit` with a `{"commit": {"sha", "branch", "subject", "files", "insertions", "deletions", …}}` data part, and the patch as a `text/x-diff` part, is recorded as "commit 3f2a1c9 fix the tests (+4 −1)". The patch (up to 256 KB) stays in the task. The Runs page shows "@coder committed …" with the files.

Together these are an agent's transcript: what it was asked, the tools it ran and their output, what it thought, said and committed. Each run in `GET /api/runs` also carries its root task's `contextId`: send into it to continue the conversation.
