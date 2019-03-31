import L from 'leaflet';
import { Commune } from '../../model/commune';
import { nbJobsToRadius } from '../../model/value.mappers';

export function renderMeanTransportationMarkerPerCommune(
  markerLayer: L.LayerGroup,
  commune: Commune,
  markerOnClick: (event: Event) => void
) {
  const popupAttributes = [
    'emplois',
    'revenu_median',
    '2015_inter_csp1',
    '2015_inter_csp2',
    '2015_inter_csp3'
  ];

  addTownMarker(markerLayer, commune, popupAttributes, markerOnClick);
}

function addTownMarker(
  markerLayer: L.LayerGroup,
  commune: Commune,
  popupAttributes: Array<string>,
  markerOnClick: (event: Event) => void
) {
  const radius = nbJobsToRadius(commune[popupAttributes[0]]);
  let popupLabel = popupAttributes
    .map(popupAttribute => popupAttribute + ': ' + commune[popupAttribute])
    .join('<br>');

  const marker = L.circle([commune.longitude, commune.latitude], {
    radius: radius,
    color: `gray`,
    fillColor: `gray`,
    fillOpacity: 0.5
  })
    .bindTooltip(` <b>${commune.commune}</b><br>${popupLabel}`)
    .on('click', markerOnClick)
    .addTo(markerLayer);
  const props = JSON.stringify(commune).split(',');
  marker['properties'] = props;
  marker['INSEE_COM'] = commune.INSEE_COM;
}
