import L from 'leaflet';
import markers from '../maps/markers.json';

function main() {
  var map = L.map('map', {
    center: [43.5, 0.5],
    minZoom: 5,
    zoom: 7
  })

  L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    subdomains: ['a', 'b', 'c']
  }).addTo(map)

  let myURL = 'maps/'

  var myIcon = L.icon({
    iconUrl: myURL + 'images/pin24.png',
    iconRetinaUrl: myURL + 'images/pin48.png',
    iconSize: [29, 24],
    iconAnchor: [9, 21],
    popupAnchor: [0, -14]
  })

  for (var i = 0; i < markers.length; ++i) {
    L.marker([markers[i].lat, markers[i].lng], { icon: myIcon })
      .bindPopup('<a href="' + markers[i].url + '" target="_blank">' + markers[i].name + '</a>')
      .addTo(map);
  }

  /* Hydro */
  // var hydro = new L.LayerGroup();
  // L.geoJson(hydro_s, {style: hydrosStyle}).addTo(hydro);
}

main();
