export function incomeToHeight(incomeMonthEuros: number) {
  let height = 0;
  if (incomeMonthEuros <= 0) {
    height = 0;
  } else if (incomeMonthEuros < 1400) {
    height = 1;
  } else if (incomeMonthEuros < 1600) {
    height = 2;
  } else if (incomeMonthEuros < 1800) {
    height = 3;
  } else {
    height = 4;
  }
  return height;
}
export function hoursToHue(nbHours: number) {
  let hue = 0;
  if (nbHours < 0.25) {
    hue = 200;
  } else if (nbHours < 0.5) {
    hue = 120;
  } else if (nbHours < 0.75) {
    hue = 50;
  } else if (nbHours < 1) {
    hue = 40;
  } else if (nbHours < 2) {
    hue = 20;
  } else hue = 0;
  return hue;
}
export function nbJobsToRadius(nbJobs: number) {
  let radius = 1;
  if (nbJobs < 1000) {
    radius = 1;
  } else if (nbJobs < 5000) {
    radius = 3;
  } else if (nbJobs < 10000) {
    radius = 5;
  } else if (nbJobs < 50000) {
    radius = 6;
  } else {
    radius = 9;
  }
  return 500 * radius;
}
export function nbPeopleToStrokeWeight(nbPeople: number) {
  let weight = 1;
  if (nbPeople < 1000) {
    weight = 1;
  } else if (nbPeople < 5000) {
    weight = 5;
  } else if (nbPeople < 10000) {
    weight = 10;
  } else if (nbPeople < 50000) {
    weight = 15;
  } else {
    weight = 20;
  }
  return weight;
}

export function speedToHue(speedKmH: number) {
  let hue = 0;
  if (speedKmH < 40) {
    hue = 120;
  } else if (speedKmH < 50) {
    hue = 30;
  } else if (speedKmH < 80) {
    hue = 8;
  } else hue = 0;
  return hue;
}

export function timeToHue(timeMinutes: number) {
  let hue = 0;
  if (timeMinutes < 40) {
    hue = 120;
  } else if (timeMinutes < 60) {
    hue = 30;
  } else hue = 0;
  return hue;
}

export function timeGainToHue(timeGain: number) {
  let hue = 0;
  if (timeGain < 0.25) {
    hue = 0;
  } else if (timeGain < 0.5) {
    hue = 30;
  } else if (timeGain < 0.78) {
    hue = 120;
  } else hue = 120;
  return hue;
}