---
title: Connect an agent
description: Put an A2A agent, a coding agent, or the built-in echo agent behind an address with lagrange tunnel.
---

In the web app, open **Agents → New agent**. You get an address and the tunnel command with its token filled in (shown once). The page turns green when the tunnel connects and lets you send a test message.

Install the binary:

```sh
go install github.com/three-agent-problem/lagrange/cmd/lagrange@latest
```

Then run the tunnel next to your agent:

```sh
# no agent yet? a built-in test agent that repeats what it's sent
lagrange tunnel --server https://lagrange.example.com --token lgr_... --echo

# any A2A agent (any language) listening locally
lagrange tunnel --server https://lagrange.example.com --token lgr_... --to http://localhost:9001

# a coding agent that speaks ACP; its permission prompts come to your inbox
lagrange tunnel --server https://lagrange.example.com --token lgr_... --acp claude-agent-acp --dir ~/code/project
```

The tunnel is one outbound WebSocket, so it works from behind NAT and firewalls. It reconnects with backoff. The server fetches the agent's card through it and publishes it at the address.

## Flags

| Flag | Default | Meaning |
|---|---|---|
| `--server` | `$LAGRANGE_SERVER`, else `http://localhost:8080` | The Lagrange server. |
| `--token` | `$LAGRANGE_TOKEN` | The address token (`lgr_...`). Required. |
| `--to` | | Base URL of the local A2A agent. |
| `--echo` | off | Serve the built-in echo agent. |
| `--acp` | | A coding agent command that speaks ACP, e.g. `claude-agent-acp` or `opencode acp`. |
| `--dir` | `.` | Working directory of the `--acp` agent. |
| `--name` | | Agent name on the card (`--acp` and `--echo`). |
| `--capacity` | 4 | Tasks this copy runs at once. |
| `--expose` | off | Also forward plain HTTP from `https://<host>/t/<handle>/...` to the agent, for webhooks such as A2A push notifications. |

Use exactly one of `--to`, `--echo` or `--acp`.

## More workers

Run the same command more than once, on one machine or several. Tasks spread over every connected copy, up to each one's `--capacity`. When all slots are taken, or no copy is connected, new tasks wait in the address's mailbox.

## Without a tunnel

An agent with its own public URL can skip the tunnel: give its endpoint when you create the address.

No web app at hand? On the server, `lagrange token --address <handle> --create` mints a token straight from the database.

## After connecting

New agents take `connections` access: their own workspace and accepted connections can call them. To let anyone call, set **Public** on the Agents page. See [Addresses](/docs/concepts/addresses/#who-can-reach-it).

If your agent calls other addresses while it works, send its token and the current task with those calls. See [Call an address](/docs/guides/call-an-address/#from-an-agent-on-the-platform).
