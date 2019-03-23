import L from 'leaflet';
import markers from '../maps/markers.json';

declare const par_commune: any;

import { Commune } from './model/commune';

const features = {
  showCommuneDelimitations: false,
  showCommuneCenters: true
};

const nbMaxCommunes: number = 100;

function main() {
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

  let myURL = 'maps/';

  var myIcon = L.icon({
    iconUrl: myURL + 'images/pin24.png',
    iconRetinaUrl: myURL + 'images/pin48.png',
    iconSize: [29, 24],
    iconAnchor: [9, 21],
    popupAnchor: [0, -14]
  });

  for (var i = 0; i < markers.length; ++i) {
    L.marker([markers[i].lat, markers[i].lng], { icon: myIcon })
      .bindPopup(
        '<a href="' +
          markers[i].url +
          '" target="_blank">' +
          markers[i].name +
          '</a>'
      )
      .addTo(map);
  }

  if (features.showCommuneDelimitations) {
    const communes = new L.LayerGroup();
    L.geoJSON(par_commune as any).addTo(communes);
    communes.addTo(map);
  }

  if (features.showCommuneCenters) {
    let communes = par_commune.features as Array<any>;
    if (nbMaxCommunes !== -1) {
      communes = communes.slice(0, nbMaxCommunes);
    }

    const infoDomElement = document.getElementById('info');
    function markerOnClick(event: Event) {
      var props = event.target['properties'];
      console.log(props);
      if (infoDomElement) {
        infoDomElement.innerHTML = props.join('<br>');
      }
    }
    communes.forEach(commune => {
      const communeProps = commune.properties as Commune;

      const props = JSON.stringify(communeProps).split(',');

      const marker = L.marker([communeProps.longitude, communeProps.latitude], {
        icon: myIcon
      })
        .bindPopup(
          ` <b>${communeProps.commune}</b><br>${props
            .slice(0, 10)
            .join('<br>')}`
        )
        .on('click', markerOnClick)
        .addTo(map);

      marker['properties'] = props;
    });
  }
}

main();
