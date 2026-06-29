// Code.gs

/**
 * Fetches today's through the next 6 days' TV Nova schedule from the public
 * Seznam TV API, finds the first "Hospoda" entry per day, and adds it as a
 * public calendar event with the description provided by the API.
 *
 * The site used to be HTML-scraped, but tv.seznam.cz now exposes a JSON REST
 * API (the same one its frontend uses), which is far more robust. Nova is
 * channel id 3. Each programme carries exact Unix start/end timestamps
 * (time_from / time_to) and a short_description, so no page scraping is needed.
 */
function checkHospoda() {
  var calendar = CalendarApp.getDefaultCalendar();
  var NOVA_CHANNEL_ID = 3;
  var apiBase    = 'https://tv.seznam.cz/api/schedules';
  var articleBase = 'https://tv.seznam.cz/clanek/';

  // From today (offset=0) through next 6 days (offset=6)
  for (var offset = 0; offset <= 6; offset++) {
    var date = new Date();
    date.setDate(date.getDate() + offset);
    date.setHours(0, 0, 0, 0);  // local midnight of the target day

    // Day window as Unix seconds: [midnight, next midnight)
    var from = Math.floor(date.getTime() / 1000);
    var to   = from + 24 * 60 * 60;

    var url = apiBase +
      '?channel_ids=' + NOVA_CHANNEL_ID +
      '&timestamp_from=' + from +
      '&timestamp_to=' + to;

    var programmes;
    try {
      var resp = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
      if (resp.getResponseCode() !== 200) {
        Logger.log('Schedule fetch failed (%s) for %s', resp.getResponseCode(), url);
        continue;
      }
      var data = JSON.parse(resp.getContentText());
      // With a single channel the API returns an object; with several, an array.
      var schedule = data._embedded && data._embedded['tv:schedule'];
      if (Array.isArray(schedule)) schedule = schedule[0];
      programmes = schedule && schedule._embedded && schedule._embedded['tv:programme'];
    } catch (e) {
      Logger.log('Error fetching/parsing schedule for %s: %s', url, e);
      continue;
    }
    if (!programmes || !programmes.length) continue;

    // Find first "Hospoda" airing on this day
    for (var i = 0; i < programmes.length; i++) {
      var p = programmes[i];
      if (!p.name || p.name.indexOf('Hospoda') === -1) continue;

      var start = new Date(p.time_from * 1000);
      var end   = new Date(p.time_to * 1000);

      // Only one event per day: skip if already exists
      var existing = calendar.getEventsForDay(date, { search: p.name });
      if (existing.length === 0) {
        var detailUrl = articleBase + p.slug + '-' + p.id;
        var description = (p.short_description || detailUrl) +
          '\n\nOriginal listing: ' + detailUrl +
          '\n\nCreated with Hospoda in your Calendar ' +
          'https://github.com/databy-michal/hospoda-in-your-calendar';

        var ev = calendar.createEvent(p.name, start, end, { description: description });
        ev.setVisibility(CalendarApp.Visibility.PUBLIC);
        Logger.log('Created: %s on %s', p.name, start);
      }

      break;  // only the first Hospoda of the day
    }
  }
}

/**
 * (Optional) Run once to set up a daily trigger at 06:00 Europe/Prague time.
 */
function createDailyTrigger() {
  ScriptApp.getProjectTriggers()
    .filter(t => t.getHandlerFunction() === 'checkHospoda')
    .forEach(t => ScriptApp.deleteTrigger(t));

  ScriptApp.newTrigger('checkHospoda')
    .timeBased()
    .everyDays(1)
    .atHour(6)
    .inTimezone('Europe/Prague')
    .create();
}
