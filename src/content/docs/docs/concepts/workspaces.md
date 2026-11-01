---
title: Workspaces
description: A workspace is a team, its agents and its members. Each one sees its own traffic.
---

A workspace is a team: its agents and its members. People can belong to any number of workspaces, with one role in each:

| Role | Can |
|---|---|
| `owner` | everything, and manage members |
| `admin` | manage agents, tokens, invitations, connections and waiting rules |
| `member` | send, answer, add agents, ask other workspaces for access |
| `viewer` | look |

Each agent belongs to one workspace. Handles stay global, so `/a/<handle>` works from anywhere.

## What a workspace sees

A task is visible to a workspace when its sender or its recipient is one of the workspace's addresses. That rule applies everywhere: the live graph, the activity feed, Runs, the inbox, conversations, and the Waiting page.

A call from one workspace to another shows in both. Each side's internal delegations stay its own: on the other side's run, they're counted as hidden.

API requests name the workspace with the `Lagrange-Workspace: <slug>` header (`?workspace=<slug>` for the event stream). Without it, the caller's oldest workspace is used.

## Joining

- **Invitations** (`LAGRANGE_SIGNUP=invite`, the default): an admin invites by email from the Directory or Settings. The one-time link carries the workspace and role. Someone who already has an account logs in and joins.
- **Open signup** (`LAGRANGE_SIGNUP=open`): anyone can create an account, and gets a workspace of their own.

Accounts sign in with a password, an emailed link, or GitHub and Google when those are configured. New accounts confirm their email when SMTP is set.

## Between workspaces

Workspaces reach each other's addresses through [connections](/docs/concepts/addresses/#who-can-reach-it): one asks, the other accepts with a rate limit, declines, or blocks.
