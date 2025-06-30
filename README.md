# Hospoda in Your Calendar

Automatically add the next episode of **Hospoda** on TV Nova to your Google Calendar as a public event.

This Google Apps Script:

* Fetches the TV Nova schedule for tomorrow and the following 7 days.
* Finds the first airing of **Hospoda** each day (including episode number).
* Creates a single public calendar event per day for that episode, with:

  * **Title:** Episode name (e.g., `Hospoda (2)`)
  * **Start time:** show start
  * **End time:** start of the next program (or 23:59)
  * **Description:** direct link to the show page plus a credit line

---

## Prerequisites

1. A Google account with Calendar access.
2. Basic familiarity with Google Apps Script.
3. (Optional) A GitHub account to fork or clone this repository.

---

## Installation & Setup

1. **Fork or clone** this repository to your GitHub account.
2. In the repository, open `Code.gs`.
3. Go to [Google Apps Script](https://script.google.com/) and create a new project.
4. Replace the existing `Code.gs` in the editor with the contents of this file.
5. Save the project (e.g., **Hospoda Calendar Bot**).

---

## Configuration

1. **Authorize** the script:

   * In Apps Script editor, choose **Run > checkHospoda**.
   * Grant the required Calendar and URL Fetch permissions.
2. **Install the daily trigger:**

   * In Apps Script editor, choose **Run > createDailyTrigger**.
   * This sets up `checkHospoda()` to run at **06:00 Europe/Prague** every day.

> To change the trigger time or timezone, modify the `createDailyTrigger` function.

---

## How It Works

1. Every day at 06:00, the script fetches TV Nova’s schedule for the next 7 days.
2. It parses and finds the first “Hospoda” episode each day.
3. Creates one public event per day in your default calendar with:

   * **Title:** Episode name
   * **Time:** Start to next show’s start (or 23:59)
   * **Description:** `https://tv.seznam.cz` link plus credit:

     ```
     Created with Hospoda in your Calendar
     https://github.com/databy-michal/hospoda-in-your-calendar
     ```

Once set up, no further action is needed—you’ll see new events daily!

---

## Customization

* **Change calendar:** Use `CalendarApp.getCalendarById('your-calendar-id')`.
* **Event visibility:** Switch `ev.setVisibility(...)` to `PRIVATE` if preferred.
* **Window size:** Adjust `offset` bounds in `checkHospoda()` to cover more or fewer days.

---

## Contributing

We welcome contributions:

1. Fork the repository.
2. Create a feature or bugfix branch.
3. Submit a pull request describing your changes.

---

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.
