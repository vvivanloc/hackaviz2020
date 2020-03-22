// declare const Calendar: any;
import Calendar from 'js-year-calendar';
import 'js-year-calendar/locales/js-year-calendar.fr';
declare const $: any;

/** arbitrary sclaing value for nice luma coloring */
const maxVar1000Nuitées = {
  '09': 5,
  '11': 15,
  '12': 7,
  '30': 20,
  '31': 30,
  '32': 5,
  '34': 40,
  '46': 7,
  '48': 4,
  '65': 8,
  '66': 20,
  '81': 7,
  '82': 7
};

// add fiestas
const fiestas = [];
/** display variation or value */
export type ValueToDisplay = 'val' | 'var';

let currentDep: string;

export function setCurrentDep(_currentDep: string) {
  currentDep = _currentDep;
}
export function loadEventsAndNuitées(
  currentDep: string,
  currentValueType: ValueToDisplay
) {
  const onLoadFiestas = () => {
    const dateFrToDate = (dateStr: string) => {
      const dateArr = dateStr.split('/');
      return new Date(
        Number(dateArr[2]),
        Number(dateArr[1]) - 1,
        Number(dateArr[0])
      );
    };

    const csvFile = oReqFiestas.responseText.split('\n');

    for (let i = 1; i < csvFile.length; i++) {
      if (csvFile[i].length > 0) {
        const values = csvFile[i].split(',');
        if (values) {
          fiestas.push({
            dep: values[0],
            startDate: dateFrToDate(values[2]),
            endDate: dateFrToDate(values[3]),
            event: values[1]
          });
        }
      }
    }
    // renderGraphAndCalendar(currentDep, currentValueType);
    setCurrentDep(currentDep);
    renderCalendar(currentDep, currentValueType);
  };
  const oReqFiestas = new XMLHttpRequest();
  oReqFiestas.onload = onLoadFiestas;
  oReqFiestas.onerror = reqError;
  oReqFiestas.open('get', `assets/datasources/complements.csv`, true);
  oReqFiestas.send();
}

function reqError(err: any) {
  console.log('Fetch Error :-S', err);
}

export function renderCalendar(depNumber: string, valueType: string) {
  const renderVariations = valueType === 'var';
  const calendar = new Calendar(document.getElementById('calendar'), {
    minDate: new Date(2018, 0, 1),
    maxDate: new Date(new Date(2019, 0, 1).getTime() - 1),
    startYear: 2018,
    language: 'fr',
    style: 'background',
    displayHeader: false,
    renderEnd: (e: any) => {
      // force flex
      const calendarInner: HTMLElement = document.querySelector(
        '.months-container'
      );
      calendarInner.style.display = 'flex';
      calendarInner.style.flexWrap = 'wrap';
      calendarInner.style.justifyContent = 'space-around';
      calendarInner.style.alignContent = 'space-around';
    },
    loadingTemplate: undefined,
    customDayRenderer: (cellContent: HTMLElement, currentDate: Date) => {
      const filteredFiestas = fiestas.filter(
        fiesta => fiesta.dep === currentDep
      );
      filteredFiestas.forEach(fiesta => {
        if (
          fiesta.startDate.getTime() <= currentDate &&
          currentDate <= fiesta.endDate.getTime()
        ) {
          //cellContent.style.fontWeight = 'bolder';
          cellContent.style.textDecoration = 'underline dotted';
          
        }
      });
    },
    mouseOnDay: (e: { events: any; date: Date; element: HTMLElement }) => {
      if (e.events.length > 0) {
        var content = '';
        let fiestaStr = '';
        const currentDate = new Date(e.date).getTime();
        fiestaStr += '';
        const filteredFiestas = fiestas.filter(
          fiesta => fiesta.dep === currentDep
        );
        filteredFiestas.forEach(fiesta => {
          if (
            fiesta.startDate.getTime() <= currentDate &&
            currentDate <= fiesta.endDate.getTime()
          ) {
            fiestaStr +=
              '<div class="event-name"> ⚬&nbsp;&nbsp;' +
              fiesta.event +
              '</div>';
          }
        });
        for (var i in e.events) {
          content +=
            '<div class="event-tooltip-content">' +
            fiestaStr +
            '<div class="event-value">' +
            e.events[i].value +
            ' nuitées</div>';
        }
        $(e.element).popover({
          placement: 'top',
          trigger: 'manual',
          container: '.calendar',
          html: true,
          content: content
        });
        $(e.element).popover('show');
      }
    },
    mouseOutDay: (e: { events: string | any[]; element: any }) => {
      if (e.events.length > 0) {
        $(e.element).popover('hide');
      }
    }
  });
  const varNuitées = [];
  const dateISOToDate = (dateStr: string) => {
    const dateArr = dateStr.split('-');
    return new Date(
      Number(dateArr[0]),
      Number(dateArr[1]) - 1,
      Number(dateArr[2])
    );
  };
  function varNuitéesToLuminanceHue(nbVar: number, maxVar: number) {
    const frac = Math.min(1, Math.abs(nbVar) / maxVar);
    return 100 - Math.floor(frac * 50) + '%';
  }
  function varNuitéesToColor(varNuitée: { value: number }) {
    return `hsl(${
      varNuitée.value < 0 ? 0 : 124
    },100%,${varNuitéesToLuminanceHue(
      varNuitée.value,
      maxVar1000Nuitées[depNumber] * 1000
    )})`;
  }
  function valAbsNuitéesToColor(
    varNuitée: {
      value: number;
    },
    maxVar: number
  ) {
    const frac = Math.min(1, (Math.abs(varNuitée.value) / maxVar) * 0.75) * 100;
    if (frac < 20) return '#ffffb2';
    if (frac < 40) return '#fecc5c';
    if (frac < 60) return '#fd8d3c';
    if (frac < 80) return '#f03b20';
    if (frac < 100) return '#bd0026';
  }
  function onLoadOrigins() {
    const csvFile = this.responseText.split('\n');
    for (let i = 1; i < csvFile.length; i++) {
      if (csvFile[i].length > 0) {
        const values = csvFile[i].split(',');
        varNuitées.push({
          id: i,
          startDate: dateISOToDate(values[0]),
          endDate: dateISOToDate(values[0]),
          value: Number(values[renderVariations ? 1 : 2])
        });
      }
    }
    let maxVal = 0;
    varNuitées.forEach(
      varNuitée => (maxVal = Math.max(maxVal, varNuitée.value))
    );
    varNuitées.forEach(
      varNuitée =>
        (varNuitée.color = renderVariations
          ? varNuitéesToColor(varNuitée)
          : valAbsNuitéesToColor(varNuitée, maxVal))
    );
    calendar.setDataSource(varNuitées);
  }
  var oReqOrigin = new XMLHttpRequest();
  oReqOrigin.onload = onLoadOrigins;
  oReqOrigin.onerror = reqError;
  oReqOrigin.open(
    'get',
    `assets/datasources/par_origin_agg_${depNumber}.csv`,
    true
  );
  oReqOrigin.send();
}
