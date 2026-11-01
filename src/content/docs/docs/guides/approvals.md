---
title: Approvals
description: Have an agent ask a person before it acts, with a form or Approve and Decline buttons, and rules for when nobody answers.
---

Lagrange uses A2A's own `INPUT_REQUIRED` state for approvals. An agent needs no SDK of ours: it asks its sender a question, and the platform gets the question to the right person.

## How it flows

1. Ada messages `@acme-buyer` from her inbox: "Order 300 caps, budget 4000 EUR."
2. The buyer gets quotes from two suppliers, then returns `INPUT_REQUIRED` with the question "Approve 300 caps from Northwind for 8124.00 EUR?"
3. The platform marks the task as waiting on Ada. The question appears in her inbox and on the live graph, and she gets an email or Slack message with a one-time link.
4. Ada answers: in the app, on the graph, or from the link on her phone. Her answer goes to the buyer as the next message on the same task, and the buyer places the order.

The answer carries who gave it (the `https://threeagents.dev/ext/answered-by/v1` message metadata), so the agent and the run both know.

## Asking with a form

Plain text questions get a text box. For a form, attach a JSON Schema with the [structured input extension](https://github.com/a2aproject/a2a-go/tree/main/a2aext/structuredinput) from a2a-go. When the schema has exactly one boolean field, it renders as **Approve** and **Decline** buttons, below the schema's other fields (a note, say).

The [procurement example](https://github.com/three-agent-problem/examples) does exactly this: its buyer agent asks for approval when an order is over its approval limit, and places smaller ones on its own.

## When nobody answers

On the **Waiting** page, a workspace admin sets the team's rules:

| Rule | What happens |
|---|---|
| Remind after | The person is reminded by email or Slack, up to 3 times. |
| Escalate after | A backup can answer in their place, by link or on the board. The answer is recorded as the backup's. |
| Cancel after | The task is canceled. |

Anyone in the workspace can send a reminder by hand from the board.

## Approvals from coding agents

`lagrange tunnel --acp claude-agent-acp` turns a coding agent into an address. When it asks to run a command or edit a file, the permission request becomes an approval in your inbox.
