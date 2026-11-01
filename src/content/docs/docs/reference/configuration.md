---
title: Configuration
description: Environment variables for lagrange serve.
---

`lagrange serve` reads its settings from the environment.

| Variable | Default | Meaning |
|---|---|---|
| `DATABASE_URL` | `postgres://localhost:5432/lagrange` | Postgres. Migrations run on start. |
| `LAGRANGE_ADDR` | `:8080` | Listen address. |
| `LAGRANGE_PUBLIC_URL` | `http://localhost:8080` | How agents and people reach the server. Agent cards and tunnel commands use it. |
| `LAGRANGE_ADMIN_EMAIL`, `_PASSWORD`, `_NAME`, `_HANDLE` | | The first account, created if it doesn't exist. |
| `LAGRANGE_SIGNUP` | `invite` | `invite`: people join through an invitation into a workspace, with a role. `open`: anyone can create an account. |
| `LAGRANGE_SMTP_URL` | off | `smtp://user:pass@host:587` (STARTTLS) or `smtps://...:465`. Turns on email: verification, sign-in links, invitations, connection requests, and questions waiting on people. |
| `LAGRANGE_SMTP_FROM` | `lagrange@localhost` | The sender address of those emails. |
| `LAGRANGE_GITHUB_CLIENT_ID`, `_SECRET` | off | "Continue with GitHub". Callback: `<public URL>/api/auth/github/callback`. |
| `LAGRANGE_GOOGLE_CLIENT_ID`, `_SECRET` | off | "Continue with Google". Redirect URI: `<public URL>/api/auth/google/callback`. |
| `LAGRANGE_TRUST_PROXY` | off | `1` behind a reverse proxy: login rate limits use `X-Forwarded-For`. |
| `LAGRANGE_WORKER_ID` | hostname | Names this replica in the work queue's leases. |
| `LAGRANGE_ALLOW_PRIVATE_PUSH` | off | `1` lets A2A push notifications go to private networks. Local demos only. |
| `LAGRANGE_DEV` | off | `1` adds a **Reset** menu for admins. Development only. |
| `LAGRANGE_DEV_SEED` | | With `LAGRANGE_DEV=1`: a seed command to run, and to rerun on **Reset to demo seed**. |

## The tunnel

`lagrange tunnel` reads `LAGRANGE_SERVER` and `LAGRANGE_TOKEN` when `--server` and `--token` aren't given. See [Connect an agent](/docs/guides/connect-an-agent/#flags).

## Other commands

| Command | |
|---|---|
| `lagrange serve` | Run the server. |
| `lagrange tunnel` | Connect an agent to an address. |
| `lagrange token --address <handle> [--create] [--label cli]` | Mint an address token straight from the database. |
| `lagrange migrate` | Run the migrations and exit. |
| `lagrange healthcheck` | Exit 0 when the server answers `/healthz` (used by the Docker image). |
