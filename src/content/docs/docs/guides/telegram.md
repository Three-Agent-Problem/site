---
title: Telegram
description: Answer what waits on you and follow your runs from your phone, through your own bot that can only press buttons.
---


Each person can connect their own Telegram bot in **Settings → Telegram** (or from [Halo](https://github.com/three-agent-problem/halo) with `halo connections`). It's one bot per person, made in two minutes with @BotFather, and it long-polls, so the server needs no public URL.

1. In @BotFather, `/newbot`, then paste the token in Settings. The server checks it with Telegram and never shows it again.
2. Tap **Open @your_bot** and **Start**. The link carries a one-time pairing code (10 minutes, five wrong guesses kill it), which binds the bot to your private chat and your Telegram account.

From then on, what waits on you arrives there too, next to email and Slack, with reminders and escalations:

| The task asks | In Telegram |
|---|---|
| to approve (an `ask.ApprovalKey` message, or a structured form whose only required field is a boolean) | **Approve** (it asks again: "Yes, approve") or **Reject** |
| multiple-choice questions ([`ask`](https://github.com/three-agent-problem/lagrange/blob/main/ask/ask.go)) | the options as buttons (✓ toggles for multi-select), then **Send answers** |
| anything else (free text, a larger form, an account to connect) | the question, and a pointer to the inbox |

When the task is answered anywhere else, the message says so and its buttons go away. With the level at *milestones* (the default), the bot also sends report notices and a card when a run you started finishes: its report, cost and time. `/status`, `/waiting`, `/runs`, `/mute 2h` and `/unmute` read things back.

What it can't do is the point. The bot listens to one private chat and one Telegram user. It answers only tasks that wait on you, and only with buttons; it never starts, cancels or messages anything, and typed text goes nowhere (it gets a fixed reply). Buttons carry random tokens that name a row on the server, never a task. An answer goes through the same checks as the inbox, and only the press that closes the message counts, so a double tap answers once. Everything the bot can reach is [`telegram.Deps`](https://github.com/three-agent-problem/lagrange/blob/main/telegram/service.go): one answer function and three reads. Messages hold questions, run titles and reports, never diffs or tool output. The token only goes to `api.telegram.org` and is kept out of errors and logs. Like Slack webhooks, it is stored in the database as is.


## Run reports

An agent can keep a situation report on a run: an artifact named `report` with a `https://threeagents.dev/ext/report` data part (`headline`, `status`, `progress`, `built`, `stats`, `outcome`, `notice`). Each one replaces the last. The Runs page shows it as a card with a **Copy** button (Markdown), a report with a `notice` is forwarded to whoever started the run, and a final one (with `outcome`) sends them the finished-run card. In Go: `report.Report{...}.Event(ec)`.

## API

`GET`/`PUT`/`DELETE /api/settings/telegram` (`PUT {"token"}` connects), `POST /api/settings/telegram/pair` (a new pairing link), `PUT /api/settings/telegram/level` (`questions` or `milestones`) and `POST /api/settings/telegram/test`. The token is never returned.
