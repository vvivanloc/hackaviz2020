import L from 'leaflet';

declare const par_commune: any;
declare const par_trajet: any;

import { Commune } from './model/commune';
import { Trajet } from './model/trajet';

import { MarkerUtils } from './utils/marker.utils';
const features = {
  // require file par_commune.geojson.js
  showCommuneDelimitations: false,

  showCommuneMarkers: true,
  showArcs: true
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

function nbJobsToRadius(nbJobs: number) {
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

function nbPeopleToStrokeWeight(nbPeople: number) {
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

type CommuneLatLongs = { [key: string]: { lon: number; lat: number } };
const communeLatLongs: CommuneLatLongs = {};
let communes = par_commune as Array<Commune>;
let trajets = par_trajet as Array<Trajet>;
const processData = (communes: Array<Commune>) => {
  // communes = communes.filter(commune => commune['2014_intra_heure'] !== null);
  if (nbMaxCommunes !== -1) {
    communes = communes.slice(0, nbMaxCommunes);
  }
  communes.forEach(commune => {
    communeLatLongs[commune.INSEE_COM] = {
      lat: commune.latitude,
      lon: commune.longitude
    };
  });
  // communes = communes.sort((a, b) => (a['emplois'] > b['emplois'] ? -1 : 1));
};

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
    .on('click', markerOnClick)
    .addTo(markerLayer);
  marker['properties'] = props;
  marker['INSEE_COM'] = commune.INSEE_COM;
}

function renderMarkerPerCommune(
  markerLayer: L.LayerGroup,
  commune: Commune,
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

const trajetInterMarkerRadius = 250;
function renderInterPerCommune(
  lineOutlines: L.LayerGroup,
  lineInlines: L.LayerGroup,
  lineArcs: L.LayerGroup,
  commune: Commune,
  color: string
) {

  
  const weight = nbPeopleToStrokeWeight(commune['2014_inter']);

  L.circle([commune.longitude, commune.latitude], {
    color: `black`,
    radius: trajetInterMarkerRadius,
    weight: weight + 5,
    opacity: 1
  }).addTo(lineOutlines);

  L.circle([commune.longitude, commune.latitude], {
    color: `white`,
    radius: trajetInterMarkerRadius,
    weight: weight + 3,
    opacity: 1,
    fill: true,
    fillOpacity: 1.0,
    fillColor: 'white'
  }).addTo(lineInlines);

  L.circle([commune.longitude, commune.latitude], {
    color: color,
    radius: trajetInterMarkerRadius,
    weight: weight,
    fill: false,
    opacity: 1
  })
    .bindTooltip(
      ` <b>${commune.commune}</b><br>2014_inter: ${commune['2014_inter']}`
    )
    .addTo(lineArcs);

  L.circle([commune.longitude, commune.latitude], {
    color: `black`,
    radius: trajetInterMarkerRadius * 0.9,
    weight: 1,
    opacity: 1,
    fill: false
    // fill: true,
    // fillOpacity: 1.0,
    // fillColor: 'white'
  }).addTo(lineArcs);
}

function renderArcs(
  lineOutlines: L.LayerGroup,
  lineInlines: L.LayerGroup,
  lineArcs: L.LayerGroup,
  trajet: Trajet,
  communeLatLongs: CommuneLatLongs,
  codeInsee: number,
  filteredTravelsDest: Trajet[]
) {
  const _src = communeLatLongs[trajet.insee];
  const _dest = communeLatLongs[trajet.travail_insee];

  const src = new L.LatLng(_src.lat, _src.lon);
  const dest = new L.LatLng(_dest.lat, _dest.lon);

  const weightSrcExtra = nbPeopleToStrokeWeight(
    trajet['2014_extra_travail_commune']
  );

  let weightDestExtra = 0;
  const reverseArc = filteredTravelsDest.find(
    revTrajet =>
      revTrajet.travail_insee === codeInsee &&
      revTrajet.insee === trajet.travail_insee
  );
  if (reverseArc) {
    weightDestExtra = nbPeopleToStrokeWeight(
      reverseArc['2014_extra_travail_commune']
    );
  }

  const segmentWidth = weightDestExtra + weightSrcExtra + 4;

  const mainLine: L.LatLngExpression[] = [
    [src.lng, src.lat],
    [dest.lng, dest.lat]
  ];
  L.polyline(mainLine, {
    color: '#000',
    weight: segmentWidth + 5,
    opacity: 1,
    offset: -(weightDestExtra - weightSrcExtra) / 2
  } as any).addTo(lineOutlines);

  const srcArcLabel = ` <b>${trajet.commune}->${
    trajet.travail_commune
  }</b><br>2014_extra_travail_commune: ${trajet['2014_extra_travail_commune']}`;
  const reverseArcLabel = reverseArc
    ? ` <b>${reverseArc.commune}->${
        reverseArc.travail_commune
      }</b><br>2014_extra_travail_commune: ${
        reverseArc['2014_extra_travail_commune']
      }`
    : '';
  L.polyline(mainLine, {
    color: '#fff',
    weight: segmentWidth + 3,
    opacity: 1,
    offset: -(weightDestExtra - weightSrcExtra) / 2
  } as any)
    .bindTooltip(srcArcLabel + '<br>' + reverseArcLabel)
    .addTo(lineInlines);

  L.polyline(mainLine, {
    color: 'green',
    weight: weightSrcExtra,
    opacity: 0.5,
    offset: weightSrcExtra / 2 + 1
  } as any)
    .bindTooltip(srcArcLabel)
    .addTo(lineArcs);

  if (reverseArc) {
    L.polyline(mainLine, {
      color: 'red',
      weight: weightDestExtra,
      opacity: 0.5,
      offset: -(weightDestExtra / 2 + 1)
    } as any)
      .bindTooltip(reverseArcLabel)
      .addTo(lineArcs);
  }
}
function main() {
  var map = addOpenStreetMapLayer();

  if (features.showCommuneDelimitations) {
    const communeLayer = new L.LayerGroup();
    L.geoJSON(par_commune as any).addTo(communeLayer);
    communeLayer.addTo(map);
  }

  processData(communes);

  // manage overlays in groups to ease superposition order
  let lineOutlines = L.layerGroup();
  let lineInlines = L.layerGroup();
  let lineArcs = L.layerGroup();
  let markerLayer = L.layerGroup();
  markerLayer.addTo(map);
  markerLayer.setZIndex(-9999);

  if (features.showCommuneMarkers) {
    // let nbMaxHeures = 0;
    // communes.forEach(commune => {
    //   nbMaxHeures = Math.max(nbMaxHeures, commune['2014_1'] || 0);
    // });
  
    const infoDomElement = document.getElementById('info');
    function markerOnClick(event: Event) {
      var props = event.target['properties'];
      if (infoDomElement) {
        infoDomElement.innerHTML = props.join('<br>');
      }

      if (features.showArcs) {
        if (lineOutlines) {
          map.removeLayer(lineOutlines);
          map.removeLayer(lineInlines);
          map.removeLayer(lineArcs);

          lineOutlines = L.layerGroup();
          lineInlines = L.layerGroup();
          lineArcs = L.layerGroup();
        }

        const codeInseeFilter = event.target['INSEE_COM'];
        const filteredTravelsDest = trajets.filter(
          trajet => trajet.travail_insee === codeInseeFilter
        );

        const filteredTravelsSrc = trajets.filter(
          trajet => trajet.insee === codeInseeFilter
        );

        filteredTravelsSrc.forEach(trajet => {
          renderArcs(
            lineOutlines,
            lineInlines,
            lineArcs,
            trajet,
            communeLatLongs,
            codeInseeFilter,
            filteredTravelsDest
          );
        });

        lineOutlines.addTo(map);
        lineInlines.addTo(map);
        lineArcs.addTo(map);

        filteredTravelsSrc.forEach(trajet => {
          const commune: Commune = communes.find(commune=>commune.INSEE_COM === trajet.travail_insee)
          renderInterPerCommune(lineOutlines, lineInlines, lineArcs, commune, 'lightblue');
        });

        const commune: Commune = communes.find(commune=>commune.INSEE_COM === codeInseeFilter)
        renderInterPerCommune(lineOutlines, lineInlines, lineArcs, commune, 'blue');
      }
    }
    communes.forEach(commune => {
      renderMarkerPerCommune(markerLayer, commune, markerOnClick);
    });

   
  }
}

main();
