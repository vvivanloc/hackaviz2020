// import {renderGraph} from './renderGraph';
import {
  ValueToDisplay,
  loadEventsAndNuitées,
  setCurrentDep,
  renderCalendar
} from './renderCalendar';

/** current département number*/
const currentDep = '09';
/** display variation or value */
let currentValueType: ValueToDisplay = 'val';

function renderGraphAndCalendar(depNumber: string, valueType: string) {
  // renderGraph(depNumber);
  //'var'
  setCurrentDep(depNumber);
  renderCalendar(depNumber, valueType);
}

loadEventsAndNuitées(currentDep, currentValueType);

const selectElement: HTMLSelectElement = document.querySelector('#depSelector');
selectElement.addEventListener('change', event => {
  const selectedDep = (event.target as any).value;
  renderGraphAndCalendar(selectedDep, currentValueType);
});

const valButtonElement: HTMLButtonElement = document.querySelector('#val');
valButtonElement.addEventListener('click', _event => {
  currentValueType = 'val';
  renderGraphAndCalendar(selectElement.value, currentValueType);
});

const varButtonElement: HTMLButtonElement = document.querySelector('#var');
varButtonElement.addEventListener('click', _event => {
  currentValueType = 'var';
  renderGraphAndCalendar(selectElement.value, currentValueType);
});
