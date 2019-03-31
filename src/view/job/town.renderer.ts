import L from 'leaflet';
import { Commune } from '../../model/commune';
import { nbJobsToRadius, incomeToHeight } from '../../model/value.mappers';
import { extendSemiCircle } from '../extendSemiCircle';
extendSemiCircle();

const popupAttributes = ['somme_csp', 'revenu_median', 'csp1', 'csp2', 'csp3'];
const popupLabelAttributes = [
  'Actifs',
  'Revenu médian',
  'CSP1',
  'CSP2',
  'CSP3'
];

const popupLabelUnits = [
  'personnes',
  '€',
  'personnes',
  'personnes',
  'personnes'
];

export function renderJobMarkerPerCommune(
  jobLayer: L.LayerGroup,
  smallIncomeLayer: L.LayerGroup,
  bigIncomeLayer: L.LayerGroup,
  commune: Commune
) {
  addJobPool(commune, jobLayer);

  const bigWidth = 30;
  const bigHeights = [20, 20, 40, 70, 90, 110];
  const smallWidth = bigWidth / 2;
  const smallHeights = bigHeights.map(h => h / 2);

  const heightIndex = incomeToHeight(commune[popupAttributes[1]]);

  addIncome(
    heightIndex,
    bigWidth,
    bigHeights,
    commune,
    bigIncomeLayer,
    'bigBuildingIcon'
  );
  addIncome(
    heightIndex,
    smallWidth,
    smallHeights,
    commune,
    smallIncomeLayer,
    'smallBuildingIcon'
  );
}

function markerOnHoverIn(_event: Event) {
  const infoDomElement = document.querySelector(`#mapJob .leaflet-marker-pane`);

  if (infoDomElement) {
    (infoDomElement as HTMLElement).style.opacity = '0.5';
  }
}

function markerOnHoverOut(_event: Event) {
  const infoDomElement = document.querySelector(`#mapJob .leaflet-marker-pane`);

  if (infoDomElement) {
    (infoDomElement as HTMLElement).style.opacity = '';
  }
}

function addJobPool(commune: Commune, jobLayer: L.LayerGroup<any>) {
  const sumCsp =
    commune['2015_inter_csp1'] +
    commune['2015_inter_csp2'] +
    commune['2015_inter_csp3'] +
    commune['2015_extra_csp1'] +
    commune['2015_extra_csp2'] +
    commune['2015_extra_csp3'];

  const radius = nbJobsToRadius(sumCsp);
  let popupLabelArray = [];
  popupLabelArray.push(
    popupLabelAttributes[0] +
      ': ' +
      Number(sumCsp).toLocaleString('fr-FR') +
      ' ' +
      popupLabelUnits[0]
  );
  popupLabelArray.push(
    popupLabelAttributes[1] +
      ': ' +
      Number(commune[popupAttributes[1]]).toLocaleString('fr-FR') +
      ' ' +
      popupLabelUnits[1]
  );
  const cspNumbers = [];

  for (let i = 0; i < 3; i++) {
    const csp =
      commune[`2015_inter_csp${i + 1}`] + commune[`2015_extra_csp${i + 1}`];
    cspNumbers.push(csp);
    popupLabelArray.push(
      popupLabelAttributes[i + 2] +
        ': ' +
        Number(csp).toLocaleString('fr-FR') +
        ' ' +
        popupLabelUnits[i + 2]
    );
  }
  let popupLabel = popupLabelArray.join('<br>');

  L.circle([commune.longitude, commune.latitude], {
    radius: radius,
    color: `gray`,
    fillColor: `gray`,
    fillOpacity: 0.5
  })
  
    .bindTooltip(` <b>${commune.commune}</b><br>${popupLabel}`)
    .addTo(jobLayer);

  const colors: string[] = ['236', '86', '26'];

  if (sumCsp !== 0) {
    let angleStart = 0;
    let angleEnd = 0;

    for (let i = 0; i < 3; i++) {
      angleEnd = angleStart + (cspNumbers[i] / sumCsp) * 360;

      const segment = (L as any)
        .semiCircle([commune.longitude, commune.latitude], {
          radius: radius * 0.9,
          startAngle: angleStart,
          stopAngle: angleEnd,
          color: `hsl(${colors[i]}, 100%, 25%)`,
          fillColor: `hsl(${colors[i]}, 100%, 75%)`,
          fillOpacity: 0.5
        })
        .bindTooltip(
          ` <b>${commune.commune}</b><br>Actifs résidents CSP ${i +
            1}: ${Number(commune[`2015_inter_csp${i + 1}`]).toLocaleString(
            'fr-FR'
          ) + ' personnes'}` +
            ` <br>Actifs travaillant à l'extérieur CSP ${i + 1}: ${Number(
              commune[`2015_extra_csp${i + 1}`]
            ).toLocaleString('fr-FR') + ' personnes'}`
        );

      segment['csp_index'] = i + 1;
      segment.on('mouseover', markerOnHoverIn);
      segment.on('mouseout', markerOnHoverOut);
      segment.addTo(jobLayer);
      
      angleStart = angleEnd;
    }

    
  }
}

export function toggleLayerVisibility(zoomLevel: number) {
  const elementsBig = document.querySelectorAll('#mapJob .bigBuildingIcon');
  for (var i = 0; i < elementsBig.length; i++) {
    const element = elementsBig.item(i) as HTMLElement;
    if (zoomLevel < 10) {
      (element as HTMLElement).style.display = 'none';
    } else {
      (element as HTMLElement).style.display = '';
    }
  }
  const elementsSmall = document.querySelectorAll('#mapJob .smallBuildingIcon');
  for (var i = 0; i < elementsSmall.length; i++) {
    const element = elementsSmall.item(i) as HTMLElement;
    if (zoomLevel < 10) {
      (element as HTMLElement).style.display = '';
    } else {
      (element as HTMLElement).style.display = 'none';
    }
  }
}

function addIncome(
  heightIndex: number,
  width: number,
  heights: number[],
  commune: Commune,
  incomeLayer: L.LayerGroup<any>,
  className: string
) {
  const height =
    heights[heightIndex] +
    (heightIndex === 5
      ? (Math.max(1, commune.revenu_median - 2000) / 2000) *
        2.5 *
        heights[heightIndex]
      : 0);
  var icon = L.icon({
    iconUrl: `maps/images/building_${heightIndex}.png`,
    iconSize: [width, height],
    iconAnchor: [width / 2, height - 10],
    className: className
  });
  const markerIncome = L.marker([commune.longitude, commune.latitude], {
    icon: icon
  }).bindTooltip(
    ` <b>${commune.commune}</b><br>Revenu mensuel median : ${Number(
      commune[popupAttributes[1]]
    ).toLocaleString('fr-FR') + ' €'}`
  );
  markerIncome.addTo(incomeLayer);
}
