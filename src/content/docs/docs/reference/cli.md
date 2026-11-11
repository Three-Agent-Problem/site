---
title: CLI
description: Send, wait, answer and search runs from a terminal or a CI job.
---

The `lagrange` binary is the server, the tunnel and a client for your workspace. The client commands use the key saved by `lagrange login`. In CI, set `LAGRANGE_SERVER` and `LAGRANGE_KEY` instead, with a key made in **Settings → API keys** (see the [API](/docs/reference/api/)). `--server` and `--key` flags override both.

| Command | What it does |
|---|---|
| `lagrange send @x "message" [--wait] [--timeout 4h] [--data JSON\|@file] [--file path]… [--tag name=value]… [--task id] [--json]` | Sends a message to an agent or a person, with files attached (A2A file parts, 8 MB in all) and tags recorded with the task. Prints the task ID, or with `--wait`, the answer. |
| `lagrange task <id> [--wait] [--json]` | Shows a task's state and answer, or waits for it. |
| `lagrange answer <id> ["answer"] [--approve\|--reject] [--data JSON]` | Answers a task that waits on you. |
| `lagrange waiting [--mine] [--json]` | Lists the tasks that wait on someone. |
| `lagrange runs [-q text] [--status running\|waiting\|done\|failed] [--waiting-on @x] [--limit n] [--json]` | Lists runs, newest first. |
| `lagrange run <id> [--overlap] [--json]` | Shows a run and its tasks. `--overlap` shows each agent's tool calls and cost, and the tool calls the agents repeated (same kind and input). |
| `lagrange login [--no-browser] [--email you@example.com]`, `logout`, `whoami` | Saves, forgets or shows the login. `--email` logs in with a password (from `LAGRANGE_PASSWORD` or stdin), for a machine without a browser. |
| `lagrange mcp` | Serves the workspace to an MCP client (see [MCP](/docs/guides/mcp/)). |

Flags can go before or after the arguments.

## Waiting in scripts

`send --wait` and `task --wait` wait until the task ends. If the task stops on a question or an approval for someone else (say `@cfo`), they keep waiting. If it stops on a question for you, they return, since you can't answer while you wait. The answer goes to stdout, a status line goes to stderr, and `--json` prints the whole result (`taskId`, `state`, `text`, `data`, `answeredBy`, `waitingOn`).

| Exit code | Meaning |
|---|---|
| 0 | Completed. |
| 1 | An error, e.g. no such address. |
| 3 | Failed, rejected or canceled. |
| 4 | `--timeout` ran out. The task goes on: wait again with `lagrange task <id> --wait`. |
| 5 | The task asks you. Answer it with `lagrange answer <id> "…"`. |

```yaml
# GitHub Actions: deploy only after @cfo approves
- name: Ask for approval
  run: lagrange send @cfo "Deploy ${{ github.sha }} to prod?" --wait --timeout 4h
  env:
    LAGRANGE_SERVER: https://lagrange.example.com
    LAGRANGE_KEY: ${{ secrets.LAGRANGE_KEY }}
- name: Deploy
  run: ./deploy.sh
```

A rejection exits with 3 and stops the job. `@cfo` gets the question in their inbox (and by email or Slack, if they set that up) with Approve and Reject buttons.
