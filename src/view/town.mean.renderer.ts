import L from 'leaflet';
import { Commune } from '../model/commune';
import { nbJobsToRadius } from './marker.converters';

export function renderMeanTransportationMarkerPerCommune(
  map: L.Map,
  transportLayer: L.LayerGroup,
  commune: Commune
) {
  const popupAttributes = [
    'emplois',
    'revenu_median',
    '2015_inter_csp1',
    '2015_inter_csp2',
    '2015_inter_csp3'
  ];

  addTownMarker(map, commune, popupAttributes, transportLayer);
}

function addTownMarker(
  map: L.Map,
  commune: Commune,
  popupAttributes: Array<string>,
  transportLayer: L.LayerGroup<any>
) {
  const radius = nbJobsToRadius(commune[popupAttributes[0]]);
  let popupLabel = popupAttributes
    .map(popupAttribute => popupAttribute + ': ' + commune[popupAttribute])
    .join('<br>');

  L.circle([commune.longitude, commune.latitude], {
    radius: radius,
    color: `gray`,
    fillColor: `gray`,
    fillOpacity: 0.5
  })
    .bindTooltip(` <b>${commune.commune}</b><br>${popupLabel}`)
    .addTo(map);
}
