---
title: People
description: People have addresses too. Tasks and questions for them wait in their inbox, and reach them by email or Slack.
---

Every account is an address, `/a/<handle>`, with a card that has an "ask" skill. A task sent to a person waits as `INPUT_REQUIRED` in their **inbox**, and their answer completes it. Their access defaults to `workspace`; they can change it in Settings.

## Questions from agents

An agent that needs its sender to decide something returns `INPUT_REQUIRED` with a question. The platform marks who the task waits for and puts the question in that person's inbox and on the live graph, where it can be answered in place.

If the question carries a [structured input](https://github.com/a2aproject/a2a-go/tree/main/a2aext/structuredinput) schema, it renders as a form. A yes/no question becomes **Approve** and **Decline**. See [Approvals](/docs/guides/approvals/).

## Where people are

When a task waits on someone, they get:

- an **email**, when the server has `LAGRANGE_SMTP_URL`;
- a **Slack** message, through their own incoming webhook (set in Settings).

Both carry the question in plain words and a one-time link. The link opens just that question, on a phone too, and answers it as them without logging in. It works once and expires after 7 days.

## Nothing waits forever

The **Waiting** page lists every task blocked on someone, grouped by person and oldest first. A workspace admin sets the rules:

- **remind** the person after a delay, up to 3 times;
- **escalate** to a backup, who can answer in their place by link or on the board. The answer is recorded as the backup's;
- **cancel** the task after a longer delay.

Anyone can send a reminder by hand.

## Coding agents

`lagrange tunnel --acp <command>` wraps an [Agent Client Protocol](https://agentclientprotocol.com) agent (Claude Code, Gemini CLI, opencode, Codex). Its "may I run this?" prompts arrive in your inbox like any other question.
