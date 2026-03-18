# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A personal Surge (iOS/macOS proxy app) module repository. Contains JavaScript panel scripts, Surge module definitions (`.sgmodule`), and routing rule lists (`.list`). All content is served to Surge clients via GitHub Raw URLs.

## Repository Structure

- `scripts/` — JavaScript scripts that run inside Surge's built-in JS runtime
- `rules/` — Surge routing rule lists (DOMAIN, DOMAIN-SUFFIX, DOMAIN-KEYWORD entries)
- `tasks/` — Development logs and lessons learned (not deployed)
- `*.sgmodule` — Surge module definitions that wire scripts, rules, and panels together
- `*.list` — Top-level rule lists (some duplicated into `rules/`)

## Surge JS Runtime

Scripts run in Surge's proprietary JavaScript environment, **not Node.js**. Available globals:

- `$httpClient.get/head/post(request, callback)` — HTTP requests
- `$done(result)` — Return result to Surge (must be called to finish execution)
- `$argument` — URL-encoded parameter string passed from the module definition

There is no `require`, `import`, or access to Node.js APIs. When verifying scripts locally, use `node` + `vm` module to simulate these globals.

## Key Script: subscription_panel.js

Fetches proxy subscription info via the `subscription-userinfo` HTTP response header and displays remaining traffic, reset day, and expiry in a Surge panel widget.

**Reset day priority** (important — this was refined across multiple iterations):
1. `info.resetday === 0` → display "今天" (reset is today)
2. `info.resetday > 0` (from subscription-userinfo header) → display as days remaining directly
3. `args["reset_day"]` then `args.resetday` (from module arguments) → calculate days remaining via `getRmainingDays()`

The header `resetday` means "days left until reset." The argument `reset_day` means "day of month when reset occurs." These have different semantics and must not be conflated.

## Module Files (.sgmodule)

Module arguments use Surge's `{{{ARG_NAME}}}` triple-brace template syntax. Script paths point to GitHub Raw URLs on the `main` branch:
```
https://raw.githubusercontent.com/bearkevin/surge_module/main/scripts/...
```

After modifying any script, the changes only take effect once pushed to `main` (Surge fetches from the remote URL).

## Rule Lists (.list)

Each line follows Surge rule syntax: `DOMAIN,example.com` / `DOMAIN-SUFFIX,example.com` / `DOMAIN-KEYWORD,example`. No trailing action (e.g., DIRECT/PROXY) — the action is specified by the module or Surge config that imports the list.

## Validation

No CI, linter, or test framework. Scripts are verified locally using `node` with a `vm` sandbox that stubs Surge globals (`$httpClient`, `$done`, `$argument`). See `tasks/todo.md` for examples of past verification scenarios.

## Language

UI strings and panel output are in Chinese (Simplified). Task logs and lessons are also in Chinese.
