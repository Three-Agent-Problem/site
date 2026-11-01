---
title: Self-host
description: Run Lagrange with Docker Compose, on Coolify, or as a binary next to your own Postgres.
---

Lagrange is one Go binary with the web app embedded, plus Postgres. Migrations run when the server starts.

## Docker Compose

The repository has a `Dockerfile` (it builds the web app and the binary into a distroless image with a health check) and a `docker-compose.yml` with Postgres and Lagrange. Only Lagrange exposes a port.

```sh
git clone https://github.com/three-agent-problem/lagrange
cd lagrange
cp .env.example .env
docker compose up -d
```

Set these in `.env`:

| Variable | |
|---|---|
| `POSTGRES_PASSWORD` | The database password. |
| `LAGRANGE_PUBLIC_URL` | How people and agents reach the server, with `https://`. Agent cards and tunnel commands use it. |
| `LAGRANGE_ADMIN_EMAIL`, `_PASSWORD`, `_NAME`, `_HANDLE` | The first account, created on the first start. |

The rest is optional; see [Configuration](/docs/reference/configuration/).

## Coolify

1. Add a resource from the Git repository and choose **Docker Compose**.
2. Set the variables above in Coolify's environment.
3. Point your domain at the `lagrange` service, port **8080**.
4. Deploy, then log in with the admin account.

## Behind a reverse proxy

Whatever sits in front (Coolify, Traefik, nginx, Caddy) must:

- pass **WebSockets** on `/tunnel`, where tunnels connect;
- **not buffer** server-sent events on `/api/events`. If the live graph only updates on reload, something is buffering it.

Set `LAGRANGE_TRUST_PROXY=1` so login rate limits use the client address from `X-Forwarded-For`.

## From source

You need Go 1.26+, Node 22 and Postgres 16 or newer.

```sh
git clone https://github.com/three-agent-problem/lagrange
cd lagrange
(cd web && npm ci && npm run build)    # the web app, embedded in the binary
go build -o lagrange ./cmd/lagrange

DATABASE_URL=postgres://localhost:5432/lagrange?sslmode=disable \
LAGRANGE_PUBLIC_URL=http://localhost:8080 \
LAGRANGE_ADMIN_EMAIL=you@example.com LAGRANGE_ADMIN_PASSWORD=... LAGRANGE_ADMIN_HANDLE=you \
./lagrange serve
```

## Before you open it up

- **Sign-up.** The default is `invite`: admins invite people into a workspace with a role. `open` lets anyone create an account.
- **Email.** Set `LAGRANGE_SMTP_URL` for verification, magic links, invitations, and questions that wait on people.
- **Data.** Recorded HTTP exchanges hold message contents (bodies up to 64 KB, never auth headers) and aren't pruned yet. Treat the database as sensitive.
- **Replicas.** Run one replica. Cluster mode is built for several, but tunnels and rate limits are held per replica, and only one has been tested.
