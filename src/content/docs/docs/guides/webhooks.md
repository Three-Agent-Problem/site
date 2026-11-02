---
title: Webhooks
description: Get a signed HTTP request when a task waits on someone, gets answered, a run finishes or fails, or an agent goes on or offline.
---

Webhooks send a workspace's events to your URL, so Zapier, n8n, Make or your own service can react without polling. Admins add them in **Settings → Webhooks** (or with `POST /api/webhooks`, see the [API](/docs/reference/api/)).

## Events

| Type | When | `data` |
|---|---|---|
| `task.waiting` | A task stops on someone: a question or an approval. | `taskId`, `from`, `to`, `waitingOn`, `asker`, `question`, `state`, `url` |
| `task.answered` | Someone answered a waiting task. | `taskId`, `from`, `to`, `answeredBy`, `answer`, `url` |
| `run.completed` | A run (a root task and everything it caused) finished. | `runId`, `from`, `to`, `state`, `outcome`, `answeredBy`, `url` |
| `run.failed` | A run failed, was rejected or was canceled. | the same as `run.completed` |
| `address.online` | An agent's tunnel came up. | `address`, `sessions`, `capacity` |
| `address.offline` | Its last tunnel dropped. | `address`, `sessions`, `capacity` |
| `ping` | You clicked **Send test**. | `message` |

A workspace's events are those from or to its addresses, including its members' own addresses.

## The request

```http
POST /your/path
Content-Type: application/json
Lagrange-Event: task.waiting
Lagrange-Delivery: 42
Lagrange-Signature: t=1793599203,v1=5f2c…

{"id":"evt_25","type":"task.waiting","createdAt":"2026-11-02T09:00:03Z","workspace":"default",
 "data":{"taskId":"01a19add-…","from":"acme-buyer","to":"ada","waitingOn":"ada","asker":"acme-buyer",
         "question":"Approve 200 hoodies for 2,800 EUR?","state":"input-required","url":"https://lagrange.example.com/tasks/01a19add-…"}}
```

Answer with any 2xx within 15 seconds. Anything else is retried with backoff: 10 s, 30 s, 90 s, and so on, up to 8 tries (about a day). Retries send the same body with the same `id`, so use it to drop duplicates. Order isn't guaranteed; use `createdAt`. Settings shows each webhook's last 50 deliveries with their payloads, and you can send any of them again.

## Check the signature

`Lagrange-Signature` is `t=<unix seconds>,v1=<hex HMAC-SHA256 of "<t>.<raw body>" with the signing secret>`. The secret (`whsec_…`) is shown once, when you add the webhook. Check the signature against the raw body before parsing it, and reject old timestamps:

```js
// Node
import crypto from 'node:crypto'
function verify(secret, header, rawBody) {
  const { t, v1 } = Object.fromEntries(header.split(',').map((p) => p.split('=')))
  if (Math.abs(Date.now() / 1000 - Number(t)) > 300) return false
  const want = crypto.createHmac('sha256', secret).update(`${t}.${rawBody}`).digest('hex')
  return !!v1 && v1.length === want.length && crypto.timingSafeEqual(Buffer.from(want), Buffer.from(v1))
}
```

```python
# Python
import hashlib, hmac, time
def verify(secret: str, header: str, raw_body: bytes) -> bool:
    parts = dict(p.split("=", 1) for p in header.split(","))
    if abs(time.time() - int(parts["t"])) > 300:
        return False
    want = hmac.new(secret.encode(), parts["t"].encode() + b"." + raw_body, hashlib.sha256).hexdigest()
    return hmac.compare_digest(want, parts["v1"])
```

```go
// Go
import "github.com/three-agent-problem/lagrange/webhook"

err := webhook.Verify(secret, r.Header.Get(webhook.SignatureHeader), body, 0) // 0: five minutes
```

## Private networks

Lagrange refuses to deliver to loopback, private and link-local addresses, checking the resolved IP of every connection. This protects the server from requests aimed at internal services. For local development, set `LAGRANGE_ALLOW_PRIVATE_PUSH=1`.
