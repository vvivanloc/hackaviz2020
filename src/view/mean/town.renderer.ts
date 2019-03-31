import L from 'leaflet';
import { Commune } from '../../model/commune';
import { nbPeopleToRadius } from '../../model/value.mappers';

const popupAttributes = [
  '2015_1',
  '2015_sansvoiture',
  '2015_inter_voiture',
  '2015_extra_voiture'
];

const popupLabelAttributes = [
  'nb de personne actives',
  ' sans voiture',
  ' avec voiture, résidents',
  " avec voiture, vers l'extérieur"
];

const popupLabelUnits = ['personnes', 'personnes', 'personnes', 'personnes'];

export function renderMeanTransportationMarkerPerCommune(
  markerLayer: L.LayerGroup,
  commune: Commune,
  markerOnClick: (event: Event) => void
) {
  addTownMarker(markerLayer, commune, popupAttributes, markerOnClick);
}

function addTownMarker(
  markerLayer: L.LayerGroup,
  commune: Commune,
  popupAttributes: Array<string>,
  markerOnClick: (event: Event) => void
) {
  const sumPeople = commune[popupAttributes[0]];
  const radius = nbPeopleToRadius(commune[popupAttributes[0]]);
  let popupLabel = popupAttributes
    .map(
      (popupAttribute, i) =>
        popupLabelAttributes[i] +
        ': ' +
        Number(commune[popupAttribute]).toLocaleString('fr-FR') +
        ' ' +
        popupLabelUnits[i]
    )
    .join('<br>');

  const marker = L.circle([commune.longitude, commune.latitude], {
    radius: radius,
    color: `gray`,
    fillColor: `gray`,
    fillOpacity: 0.5
  })
    // HACK add popup to eat click event
    .bindTooltip(` <b>${commune.commune}</b><br>${popupLabel}`)
    .bindPopup(` <b>${commune.commune}</b><br>${popupLabel}`)
    .on('click', markerOnClick)
    .addTo(markerLayer);
  const props = JSON.stringify(commune).split(',');
  marker['properties'] = props;
  marker['INSEE_COM'] = commune.INSEE_COM;

  const colors: string[] = ['120', '60', '30'];

  if (sumPeople !== 0) {
    let angleStart = 0;
    let angleEnd = 0;

    for (let i = 0; i < 3; i++) {
      angleEnd =
        angleStart + (commune[popupAttributes[1 + i]] / sumPeople) * 360;

      const segment = (L as any)
        .semiCircle([commune.longitude, commune.latitude], {
          radius: radius * 0.9,
          startAngle: angleStart,
          stopAngle: angleEnd,
          color: `hsl(${colors[i]}, 100%, 25%)`,
          fillColor: `hsl(${colors[i]}, 100%, 75%)`,
          fillOpacity: 0.5
        })
        .bindPopup(` <b>${commune.commune}</b><br>${popupLabel}`)
        .bindTooltip(
          ` <b>${commune.commune}</b><br>${
            popupLabelAttributes[i + 1]
          }: ${Number(commune[popupAttributes[1 + i]]).toLocaleString('fr-FR') +
            ' ' +
            popupLabelUnits[i + 1]}`,
          { sticky: true }
        );

      segment['csp_index'] = i + 1;
      segment['properties'] = props;
      segment['INSEE_COM'] = commune.INSEE_COM;
      segment.on('click', markerOnClick).addTo(markerLayer);

      angleStart = angleEnd;
    }
  }
}
