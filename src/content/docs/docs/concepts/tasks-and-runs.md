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
