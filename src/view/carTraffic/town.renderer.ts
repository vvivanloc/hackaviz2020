import L from 'leaflet';
import { Commune } from '../../model/commune';
import { MarkerUtils } from '../marker.builders';
import {
  hoursToHue,
  nbJobsToRadius,
  floatToStr
} from '../../model/value.mappers';

const popupAttributes = ['2014_1', '2014_intra_heure', '2014_extra_heure'];

function buildMarker(
  markerLayer: L.LayerGroup,
  commune: Commune,
  radius: number,
  hue: number,
  popupLabel: string,
  markerOnClick: (event: Event) => void,
  props: string[],
  left: boolean
) {
  let fct = MarkerUtils.buildHalfLeftCircle;
  if (!left) {
    fct = MarkerUtils.buildHalfRightCircle;
  }
  const marker = L.polygon(fct([commune.longitude, commune.latitude], radius), {
    color: `hsl(${hue}, 100%, 25%)`,
    fillColor: `hsl(${hue}, 100%, 75%)`,
    fillOpacity: 0.5
  })
    .bindPopup(` <b>${commune.commune}</b><br>${popupLabel}`)
    .bindTooltip(` <b>${commune.commune}</b><br>${popupLabel}`)
    .on('click', markerOnClick)
    .addTo(markerLayer);
  marker['properties'] = props;
  marker['INSEE_COM'] = commune.INSEE_COM;
}

export function renderCarTrafficMarkerPerCommune(
  markerLayer: L.LayerGroup,
  commune: Commune,
  markerOnClick: (event: Event) => void
) {
  const props = JSON.stringify(commune).split(',');

  const nbIntraHeures = commune[popupAttributes[1]] / commune['2014_1'];
  const nbExtraHeures = commune[popupAttributes[2]] / commune['2014_1'];
  const hueLeft = hoursToHue(nbIntraHeures);
  const hueRight = hoursToHue(nbExtraHeures);
  const radius = nbJobsToRadius(commune[popupAttributes[0]]);
  let radiusLeft = radius;
  let radiusRight = radius;
  if (nbIntraHeures || nbExtraHeures) {
    if (nbIntraHeures > nbExtraHeures) {
      radiusRight = radius / (nbIntraHeures / nbExtraHeures) || 1;
    } else if (nbIntraHeures < nbExtraHeures) {
      radiusLeft = radius / (nbExtraHeures / nbIntraHeures) || 1;
    }
  }
  const popupLabelArray = [];
  popupLabelArray.push(` Actifs: ${commune[popupAttributes[0]]} personnes`);
  popupLabelArray.push(`A/R entrants`);
  popupLabelArray.push(
    ` - Vitesse moyenne : ${floatToStr(
      commune['2014_intra_km'] / commune['2014_intra_heure']
    )} km/h`
  );
  popupLabelArray.push(
    ' -  Temps:' +
      floatToStr((60 * commune[popupAttributes[1]]) / commune['2014_1'], 0) +
      ' mn'
  );
  popupLabelArray.push(`A/R sortants`);
  popupLabelArray.push(
    ` - Vitesse moyenne : ${floatToStr(
      commune['2014_extra_km'] / commune['2014_extra_heure']
    )} km/h`
  );

  popupLabelArray.push(
    ' - Temps :' +
      floatToStr((60 * commune[popupAttributes[2]]) / commune['2014_1'], 0) +
      ' mn'
  );
  const popupLabel = popupLabelArray.join('<br>');

  buildMarker(
    markerLayer,
    commune,
    radiusLeft,
    hueLeft,
    popupLabel,
    markerOnClick,
    props,
    true
  );
  buildMarker(
    markerLayer,
    commune,
    radiusRight,
    hueRight,
    popupLabel,
    markerOnClick,
    props,
    false
  );
}
