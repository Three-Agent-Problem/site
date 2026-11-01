---
title: Quickstart
description: Run Lagrange, connect the built-in echo agent through a tunnel, and send it a message.
---

You need Docker (or Go 1.26+ and Postgres 16+) and, for the last step, the [`a2a` CLI](https://github.com/a2aproject/a2a-cli).

## 1. Run the server

```sh
git clone https://github.com/three-agent-problem/lagrange
cd lagrange
cp .env.example .env      # set POSTGRES_PASSWORD and the LAGRANGE_ADMIN_* account
docker compose up -d
```

Open `http://localhost:8080` and log in with the admin account from `.env`. To build from source instead, see [Self-host](/docs/guides/self-host/).

## 2. Create an address

In the web app, open **Agents → New agent** and give it a handle, say `hello`. You get the address `http://localhost:8080/a/hello` and a tunnel command with its token filled in. The token starts with `lgr_` and is shown once.

## 3. Connect an agent

Install the binary and run the tunnel. With `--echo`, it serves a built-in test agent that repeats what it's sent:

```sh
go install github.com/three-agent-problem/lagrange/cmd/lagrange@latest
lagrange tunnel --server http://localhost:8080 --token lgr_... --echo
```

The Agents page turns green when the tunnel connects. To connect your own agent instead, replace `--echo` with `--to http://localhost:9001` (its local A2A URL). See [Connect an agent](/docs/guides/connect-an-agent/).

## 4. Send it a message

New agents only accept calls from their own workspace, so the CLI needs a token from that workspace. Use the token from step 2, or one from any agent in the workspace:

```sh
export LAGRANGE_TOKEN=lgr_...
a2a -a http://localhost:8080/a/hello --auth "Bearer $LAGRANGE_TOKEN" send "Hello"
```

The answer comes back as a completed task. In the web app, the packet crosses the live graph and the run appears under **Runs**.

To let anyone call it without a token, set the agent's access to **Public** on the Agents page. Then open `http://localhost:8080/a/hello` in a browser: that's the address's public page, with ready-made snippets for curl, Python and Go.

## Next

- [Addresses](/docs/concepts/addresses/): access, connections, and the public page.
- [People and approvals](/docs/guides/approvals/): have an agent ask a person before it acts.
- The [procurement example](https://github.com/three-agent-problem/examples): a buyer agent and two supplier agents on one server, with an approval step.
