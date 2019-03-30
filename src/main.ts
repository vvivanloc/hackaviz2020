import L from 'leaflet';

declare const par_commune: any;
declare const par_trajet: any;

import { Commune } from './model/commune';
import { Trajet } from './model/trajet';

import { renderMarkerPerCommune } from './view/town.renderer';
import { renderArcs, renderInterPerCommune } from './view/travel.renderer';
const features = {
  // require file par_commune.geojson.js
  showCommuneDelimitations: false,

  showCommuneMarkers: true,
  showArcs: true
};

// -1 for all
const nbMaxCommunes: number = -1;

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
