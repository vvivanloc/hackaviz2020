import L from 'leaflet';

declare const par_commune: any;
declare const par_trajet: any;

import { Commune } from './model/commune';
import { Trajet } from './model/trajet';

import {
  hideInfoCSP,
  renderJobMarkerPerCommune,
  toggleLayerVisibility
} from './view/town.job.renderer';
import { renderCarTrafficMarkerPerCommune } from './view/town.car.traffic.renderer';

import {
  renderArcs,
  renderInterPerCommune
} from './view/travel.car.traffic.renderer';

import {
renderMeanTransportationMarkerPerCommune
} from './view/town.mean.renderer';
// -1 for all
const nbMaxCommunes: number = -1;

export type CommuneLatLongs = { [key: string]: { lon: number; lat: number } };
const communeLatLongs: CommuneLatLongs = {};
let communes = par_commune as Array<Commune>;
let trajets = par_trajet as Array<Trajet>;
const processData = (communes: Array<Commune>) => {
  if (nbMaxCommunes !== -1) {
    communes = communes.slice(0, nbMaxCommunes);
  }
  communes.forEach(commune => {
    communeLatLongs[commune.INSEE_COM] = {
      lat: commune.latitude,
      lon: commune.longitude
    };
  });
};

function createOpenStreetMapLayer(mapDivId: string): L.Map {
  var map = L.map(mapDivId, {
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

function buildIncomeMap() {

  hideInfoCSP();
  const map = createOpenStreetMapLayer('mapJob');
  let jobLayer = L.layerGroup();
  jobLayer.addTo(map);
  let smallIncomeLayer = L.layerGroup([]);
  smallIncomeLayer.addTo(map);
  let bigIncomeLayer = L.layerGroup();
  bigIncomeLayer.addTo(map);

  communes.forEach(commune => {
    renderJobMarkerPerCommune(
      jobLayer,
      smallIncomeLayer,
      bigIncomeLayer,
      commune
    );
  });


  toggleLayerVisibility(map.getZoom());
  map.on('zoomend', function() {
    toggleLayerVisibility(map.getZoom());
  });
}

function buildTransportationMeanMap() {
  const map = createOpenStreetMapLayer('mapTransportationMean');
  let transportLayer = L.layerGroup();
  communes.forEach(commune => {
    renderMeanTransportationMarkerPerCommune(map,transportLayer, commune);
  })
}
function buildCarTrafficMap() {
  const map = createOpenStreetMapLayer('mapCarTraffic');

  // manage overlays in groups to ease superposition order
  let lineOutlines = L.layerGroup();
  let lineInlines = L.layerGroup();
  let lineArcs = L.layerGroup();
  let markerLayer = L.layerGroup();
  markerLayer.addTo(map);
  map.on('click', layerOnClick)
 
  function layerOnClick(_event: Event) {
    
    if (lineOutlines) {
      map.removeLayer(lineOutlines);
      map.removeLayer(lineInlines);
      map.removeLayer(lineArcs);
    }
  }
  const infoDomElement = document.getElementById('info');
 
  function markerOnClick(event: Event) {
    var props = event.target['properties'];
    if (infoDomElement) {
      infoDomElement.innerHTML = props.join('<br>');
    }

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
      const commune: Commune = communes.find(
        commune => commune.INSEE_COM === trajet.travail_insee
      );
      renderInterPerCommune(
        lineOutlines,
        lineInlines,
        lineArcs,
        commune,
        'lightblue'
      );
    });
    const commune: Commune = communes.find(
      commune => commune.INSEE_COM === codeInseeFilter
    );
    renderInterPerCommune(lineOutlines, lineInlines, lineArcs, commune, 'blue');
  }
  communes.forEach(commune => {
    renderCarTrafficMarkerPerCommune(markerLayer, commune, markerOnClick);
  });
  
}


function main() {
  processData(communes);
  buildIncomeMap();
  buildTransportationMeanMap();
  buildCarTrafficMap();
}

main();
