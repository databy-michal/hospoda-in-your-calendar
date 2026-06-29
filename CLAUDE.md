# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A single-file Google Apps Script (`Code.gs`) that reads the TV Nova schedule from Seznam's public TV API and creates a Google Calendar event for each upcoming airing of the show **Hospoda**. There is no build system, package manager, or local test runner — the code runs inside Google's Apps Script environment against the user's primary calendar.

## Running / testing

There is no CLI or local execution. To run or change behavior:

1. Open the project at [script.google.com](https://script.google.com) and paste `Code.gs`.
2. Run `checkHospoda()` manually from the editor to test a single execution (output goes to `Logger.log`, viewable in the execution log).
3. Run `createDailyTrigger()` **once** to install the time-based trigger (daily 06:00 Europe/Prague). It first deletes any existing `checkHospoda` triggers, so it is safe to re-run.

The Apps Script global APIs in use (`CalendarApp`, `UrlFetchApp`, `ScriptApp`, `Logger`) only exist in that runtime — they will not resolve locally.

## Architecture notes

- **`checkHospoda()`** is the whole pipeline: it loops over today + the next 6 days, and for each day:
  1. Calls `https://tv.seznam.cz/api/schedules?channel_ids=3&timestamp_from=<unix>&timestamp_to=<unix>` for a midnight-to-midnight window (Nova = channel id `3`).
  2. Reads programmes from `data._embedded['tv:schedule']._embedded['tv:programme']` (with a single channel `tv:schedule` is an object, not an array — the code handles both).
  3. Finds the first programme whose `name` contains `Hospoda`.
  4. Creates a **public** calendar event using the API's `time_from` / `time_to` Unix-second timestamps and `short_description`.
- **Idempotency** relies on `calendar.getEventsForDay(date, { search: name })` returning nothing before creating — that is the only guard against duplicate events.

## Fragility to be aware of

The script depends on the shape of Seznam's `/api/schedules` JSON: the `tv:schedule` → `tv:programme` embedding path, and the `name` / `short_description` / `time_from` / `time_to` / `slug` / `id` fields. If Seznam changes the API, events stop appearing — inspect a live API response (the same JSON is also embedded in the page under the `ima-revival-cache` script tag) before touching the parser. Channel id `3` is Nova; other channels can be found in that JSON too.
