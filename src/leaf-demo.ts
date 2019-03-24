import L from 'leaflet';

declare const par_commune: any;

import { Commune } from './model/commune';
import { MarkerUtils } from './utils/marker.utils';

const features = {
  showCommuneDelimitations: false,
  showCommuneCenters: true
};

// -1 for all
const nbMaxCommunes: number = -1;

function hoursToHue(nbHours: number) {
  let hue = 0;
  if (nbHours < 0.25) {
    hue = 200;
  } else if (nbHours < 0.5) {
    hue = 120;
  } else if (nbHours < 1) {
    hue = 40;
  } else if (nbHours < 2) {
    hue = 20;
  } else hue = 0;
  return hue;
}

function addOpenStreetMapLayer() {
  var map = L.map('map', {
    center: [43.5, 0.5],
    minZoom: 2,
    // minZoom: 5,
    zoom: 7
  });
  L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    subdomains: ['a', 'b', 'c']
  }).addTo(map);
  return map;
}

const processData = (communes: Array<Commune>) => {
  communes = communes.filter(commune => commune['2014_intra_heure'] !== null);
  if (nbMaxCommunes !== -1) {
    communes = communes.slice(0, nbMaxCommunes);
  }

  communes = communes.sort((a, b) => (a['emplois'] > b['emplois'] ? -1 : 1));
};

function buildMarker(
  map: L.Map,
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
  const markerLeft = L.polygon(
    fct([commune.longitude, commune.latitude], radius),
    {
      color: `hsl(${hue}, 100%, 25%)`,
      fillColor: `hsl(${hue}, 100%, 75%)`,
      fillOpacity: 0.5
    }
  )
    .bindPopup(` <b>${commune.commune}</b><br>${popupLabel}`)
    .on('click', markerOnClick)
    .addTo(map);
  markerLeft['properties'] = props;
}

const infoDomElement = document.getElementById('info');
function markerOnClick(event: Event) {
  var props = event.target['properties'];
  if (infoDomElement) {
    infoDomElement.innerHTML = props.join('<br>');
  }
}

function renderMarkerPerCommune(
  map: L.Map,
  commune: Commune,
  nbMaxEmplois: number,
  markerOnClick: (event: Event) => void
) {
  const props = JSON.stringify(commune).split(',');

  const popupAttributes = [
    'emplois',
    '2014_intra_heure',
    '2014_extra_heure',
    '2014_1'
  ];
  const nbIntraHeures = commune[popupAttributes[1]] / commune['2014_1'];
  const nbExtraHeures = commune[popupAttributes[2]] / commune['2014_1'];
  const hueLeft = hoursToHue(nbIntraHeures);
  const hueRight = hoursToHue(nbExtraHeures);
  const radius =
    500 * Math.max(1, (commune[popupAttributes[0]] / nbMaxEmplois) * 30);
  console.log(radius);
  let radiusLeft = radius;
  let radiusRight = radius;
  if (nbIntraHeures || nbExtraHeures) {
    if (nbIntraHeures > nbExtraHeures) {
      radiusRight = radius / (nbIntraHeures / nbExtraHeures) || 1;
    } else if (nbIntraHeures < nbExtraHeures) {
      radiusLeft = radius / (nbExtraHeures / nbIntraHeures) || 1;
    }
  }
  let popupLabel = popupAttributes
    .map(popupAttribute => popupAttribute + ': ' + commune[popupAttribute])
    .join('<br>');
  popupLabel =
    popupLabel +
    '<br>' +
    '2014_intra_heure/2014_1:' +
    commune[popupAttributes[1]] / commune['2014_1'] +
    '<br>' +
    '2014_extra_heure/2014_1:' +
    commune[popupAttributes[2]] / commune['2014_1'];
  buildMarker(
    map,
    commune,
    radiusLeft,
    hueLeft,
    popupLabel,
    markerOnClick,
    props,
    true
  );
  buildMarker(
    map,
    commune,
    radiusRight,
    hueRight,
    popupLabel,
    markerOnClick,
    props,
    false
  );
}

function main() {
  var map = addOpenStreetMapLayer();

  if (features.showCommuneDelimitations) {
    const communeLayer = new L.LayerGroup();
    L.geoJSON(par_commune as any).addTo(communeLayer);
    communeLayer.addTo(map);
  }

  let communes = par_commune.features.map(
    commune => commune.properties
  ) as Array<Commune>;

  if (features.showCommuneCenters) {
    processData(communes);
 
    let nbMaxEmplois = 0;
    communes.forEach(commune => {
      nbMaxEmplois = Math.max(nbMaxEmplois, commune['emplois'] || 0);
    });

    // let nbMaxHeures = 0;
    // communes.forEach(commune => {
    //   nbMaxHeures = Math.max(nbMaxHeures, commune['2014_1'] || 0);
    // });

    communes.forEach(commune => {
      renderMarkerPerCommune(map, commune, nbMaxEmplois, markerOnClick);
    });
  }
}

main();
