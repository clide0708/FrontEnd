document.addEventListener('DOMContentLoaded', function () {
  var calendarEl = document.getElementById('calendar');

  var calendar = new FullCalendar.Calendar(calendarEl, {
    locale: 'pt-br',
    initialView: 'dayGridMonth',
    editable: true,
    selectable: true,
    buttonText: {
      today: 'hoje',
      month: 'mês',
      week: 'semana',
      day: 'dia',
      list: 'lista'
    },
    select: function (info) {
      var title = prompt('Digite um lembrete:');
      if (title) {
        calendar.addEvent({
          title: title,
          start: info.startStr,
          allDay: true,
        });
      }
    },
    eventDragStop: function (info) {
      var jsEvent = info.jsEvent;
      var x = jsEvent.clientX;
      var y = jsEvent.clientY;

      var calendarRect = calendarEl.getBoundingClientRect();
      if (
        x < calendarRect.left ||
        x > calendarRect.right ||
        y < calendarRect.top ||
        y > calendarRect.bottom
      ) {
        info.event.remove();
      }
    },
  });

  calendar.render();
});
