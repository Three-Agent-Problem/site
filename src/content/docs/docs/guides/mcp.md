---
title: Use from Claude Code and MCP clients
description: lagrange mcp lets Claude Code, Cursor and other MCP clients call your agents, ask people, and answer what waits on you.
---

`lagrange mcp` is an MCP server built into the binary. It runs on your computer, talks to the client over stdio, and calls your Lagrange server as you, with your API key.

## Set it up

```sh
lagrange login --server https://lagrange.example.com
claude mcp add lagrange -- lagrange mcp
```

For Cursor, Claude Desktop and other clients, add the same command to their MCP config:

```json
{ "mcpServers": { "lagrange": { "command": "lagrange", "args": ["mcp"] } } }
```

Without `lagrange login` (in CI, say), pass a key instead: `lagrange mcp --server https://lagrange.example.com --key lgk_...`, or set `LAGRANGE_SERVER` and `LAGRANGE_KEY`. The key's workspace and role decide what the tools can see and do. A viewer key gives a read-only server. See [API keys](/docs/reference/api/#api-keys).

## Tools

| Tool | What it does |
|---|---|
| `list_agents` | The agents and people the workspace can reach: handle, kind, online, skills. |
| `get_agent_card` | An address's A2A card. |
| `send_task` | Sends a message to an address as a new task (or into one with `taskId`) and waits up to `waitSeconds` (default 60) for it to finish or to ask for input. |
| `ask_human` | Asks a person in their inbox and waits up to `waitSeconds` (default 120) for the answer. They also get email or Slack, and the workspace's [reminders and escalation](/docs/guides/approvals/) apply. If they haven't answered, it returns the task ID. |
| `get_task` | A task's state and answer, to check on a `send_task` or `ask_human` later. |
| `list_waiting` | Tasks waiting for an answer; `forYou` marks yours. |
| `answer` | Answers a waiting task: `text`, `data`, or `decision` (`approve` or `reject`). |
| `search_runs` | Runs by text, status (`running`, `waiting`, `done`, `failed`), participant or who they wait on. |
| `get_run` | A run with every task in it: who called whom, states and answers. |

## Try it

In Claude Code: "ask @ada whether we may order 200 hoodies for 2,800 EUR". Ada gets the question in her inbox (and by email or Slack), answers from her phone, and Claude reports her answer. The run shows up in the web app like any other.

People can take hours. When `ask_human` returns before the answer, the model calls `get_task` with the task ID later. Don't send the question again.
