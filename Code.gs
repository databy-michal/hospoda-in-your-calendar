/**
 * Main entry point: fetch next 7 days' TV Nova schedules,
 * find the first "Hospoda" entry each day, and add it as a single public event.
 */
function checkHospoda() {
  var calendar = CalendarApp.getDefaultCalendar();
  var baseUrl = 'https://tv.seznam.cz';

  // Loop from tomorrow through the next 7 days
  for (var offset = 1; offset <= 7; offset++) {
    var date = new Date();
    date.setDate(date.getDate() + offset);
    var year  = date.getFullYear();
    var month = date.getMonth() + 1;  // 1–12
    var day   = date.getDate();       // 1–31

    // Build URL for this day's program
    var url = baseUrl + '/program/tv-nova/' + year + '/' + month + '/' + day;
    var html = UrlFetchApp.fetch(url).getContentText();

    // Parse all show blocks
    var blockRe = /<div class="flex flex-row [^\"]*?relative">([\s\S]*?)<\/div>/g;
    var shows = [];
    var m;
    while ((m = blockRe.exec(html)) !== null) {
      var block = m[1];
      var tMatch     = /<p class="[^"]*opacity-40[^"]*">([^<]+)<\/p>/.exec(block);
      var titleMatch = /<p class="[^"]*font-bold[^"]*">([^<]+)<\/p>/.exec(block);
      var hrefMatch  = /<a class="[^"]*" href="([^"]+)"/.exec(block);
      if (tMatch && titleMatch && hrefMatch) {
        shows.push({
          time:  tMatch[1].trim(),
          title: titleMatch[1].trim(),
          href:  hrefMatch[1]
        });
      }
    }

    // Find the first Hospoda show of the day
    var hospodaShow = shows.find(function(s) {
      return s.title.indexOf('Hospoda') !== -1;
    });

    if (hospodaShow) {
      // Compute start time
      var partsStart = hospodaShow.time.split(':').map(Number);
      var start = new Date(year, month - 1, day, partsStart[0], partsStart[1]);

      // Compute end time as next show's start or 23:59 if last
      var idx = shows.indexOf(hospodaShow);
      var nextTime = (idx < shows.length - 1) ? shows[idx + 1].time : '23:59';
      var partsEnd = nextTime.split(':').map(Number);
      var end = new Date(year, month - 1, day, partsEnd[0], partsEnd[1]);

      // Check if this event already exists today
      var events = calendar.getEventsForDay(date);
      var exists = events.some(function(e) {
        return e.getTitle() === hospodaShow.title;
      });

      if (!exists) {
        // Create with custom description
        var description = baseUrl + hospodaShow.href + '\nCreated with Hospoda in your Calendar https://github.com/databy-michal/hospoda-in-your-calendar';
        var ev = calendar.createEvent(
          hospodaShow.title,
          start,
          end,
          { description: description }
        );
        ev.setVisibility(CalendarApp.Visibility.PUBLIC);
        Logger.log('Created: %s on %s', hospodaShow.title, start);
      }
    }
  }
}

/**
 * Run once to set up a daily trigger at 06:00 Europe/Prague time.
 */
function createDailyTrigger() {
  // Remove existing triggers for clarity
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
