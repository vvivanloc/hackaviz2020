export function hoursToHue(nbHours: number) {
  let hue = 0;
  if (nbHours < 0.25) {
    hue = 200;
  }
  else if (nbHours < 0.5) {
    hue = 120;
  }
  else if (nbHours < 1) {
    hue = 40;
  }
  else if (nbHours < 2) {
    hue = 20;
  }
  else
    hue = 0;
  return hue;
}
export function nbJobsToRadius(nbJobs: number) {
  let radius = 1;
  if (nbJobs < 1000) {
    radius = 1;
  }
  else if (nbJobs < 5000) {
    radius = 3;
  }
  else if (nbJobs < 10000) {
    radius = 5;
  }
  else if (nbJobs < 50000) {
    radius = 6;
  }
  else {
    radius = 9;
  }
  return 500 * radius;
}
export function nbPeopleToStrokeWeight(nbPeople: number) {
  let weight = 1;
  if (nbPeople < 1000) {
    weight = 1;
  }
  else if (nbPeople < 5000) {
    weight = 5;
  }
  else if (nbPeople < 10000) {
    weight = 10;
  }
  else if (nbPeople < 50000) {
    weight = 15;
  }
  else {
    weight = 20;
  }
  return weight;
}
