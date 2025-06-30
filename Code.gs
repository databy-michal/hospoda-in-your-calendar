// Code.gs

/**
 * Fetches today's through the next 6 days' TV Nova schedules,
 * finds the first "Hospoda" entry per day, and adds it as a public event.
 */
function checkHospoda() {
  var calendar = CalendarApp.getDefaultCalendar();
  var baseUrl = 'https://tv.seznam.cz/program/tv-nova';
  
  // From today (offset=0) through next 6 days (offset=6)
  for (var offset = 0; offset <= 6; offset++) {
    var date = new Date();
    date.setDate(date.getDate() + offset);
    var year  = date.getFullYear();
    var month = date.getMonth() + 1;  // 1–12
    var day   = date.getDate();       // 1–31
    
    // For today, use base URL; for others, append date path
    var url = (offset === 0)
      ? baseUrl
      : baseUrl + '/' + year + '/' + month + '/' + day;
    
    var html = UrlFetchApp.fetch(url).getContentText();
    
    // Extract all schedule blocks
    var blockRe = /<div class="flex flex-row [^"]*?relative">([\s\S]*?)<\/div>/g;
    var shows = [], m;
    while ((m = blockRe.exec(html)) !== null) {
      var block = m[1];
      var tMatch     = /<p class="[^"]*?opacity-40[^"]*?">([^<]+)<\/p>/.exec(block);
      var titleMatch = /<p class="[^"]*?font-bold[^"]*?">([^<]+)<\/p>/.exec(block);
      var hrefMatch  = /<a class="[^"]*?" href="([^"]+)"/.exec(block);
      if (tMatch && titleMatch && hrefMatch) {
        shows.push({
          time:  tMatch[1].trim(),
          title: titleMatch[1].trim(),
          href:  hrefMatch[1]
        });
      }
    }
    
    // Find first "Hospoda" in today's lineup
    for (var i = 0; i < shows.length; i++) {
      var show = shows[i];
      if (show.title.indexOf('Hospoda') !== -1) {
        // Parse start time
        var partsStart = show.time.split(':').map(Number);
        var start = new Date(year, month - 1, day, partsStart[0], partsStart[1]);
        
        // Determine end time (next show's start or 23:59)
        var nextTime = (i < shows.length - 1) ? shows[i+1].time : '23:59';
        var partsEnd = nextTime.split(':').map(Number);
        var end = new Date(year, month - 1, day, partsEnd[0], partsEnd[1]);
        
        // Only one event per day: skip if already exists
        var existing = calendar.getEventsForDay(date, { search: show.title });
        if (existing.length === 0) {
          var ev = calendar.createEvent(
            show.title,
            start,
            end,
            {
              description:
                baseUrl + show.href +
                '\n\nCreated with Hospoda in your Calendar ' +
                'https://github.com/databy-michal/hospoda-in-your-calendar'
            }
          );
          ev.setVisibility(CalendarApp.Visibility.PUBLIC);
          Logger.log('Created: %s on %s', show.title, start);
        }
        break;
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
