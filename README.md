# Hospoda in Your Calendar

A Google Apps Script that automatically adds the next airing of **Hospoda** on TV Nova to your Google Calendar.

## Features

- Fetches today’s schedule from `https://tv.seznam.cz/program/tv-nova`
- Builds URLs for tomorrow + the following 6 days (e.g. `/2025/7/1`)
- Finds the first **Hospoda** episode each day
- Creates one **public** calendar event per day
- Event title is the episode name (e.g. “Hospoda (2)”)
- Description includes the Seznam link and a credit line  

## Prerequisites

- A Google account with Calendar access
- Basic familiarity with Google Apps Script

## Setup

1. **Fork or clone** this repository to your own GitHub account.  
2. In the repository, go to **Apps Script** (via [script.google.com](https://script.google.com)).  
3. Create a new project and paste the contents of `Code.gs` from this repo.

## Configuration

No additional configuration is needed. The script uses your **primary calendar** and runs in your account’s context.

## Usage

1. In the Apps Script editor, run the `createDailyTrigger` function once.  
2. Authorize the script when prompted.  
3. After authorization, a trigger will fire **daily at 06:00 AM Europe/Prague time**.  
4. Each run will:
   - Fetch schedules from **today** through the **next 6 days**
   - Locate the first **Hospoda** entry per day
   - Add it to your calendar if not already present

## Trigger Details

- **Function:** `checkHospoda()`  
- **Schedule:** Every day at 06:00 (Europe/Prague)  

To adjust the trigger time or disable it, go to **Triggers** in the Apps Script dashboard.

## License

MIT © [databy-michal](https://github.com/databy-michal)
