import L from 'leaflet';
import { Commune } from '../model/commune';
import { Trajet } from '../model/trajet';
import { nbPeopleToStrokeWeight } from './marker.converters';
import { CommuneLatLongs } from '../main';

export function renderInterPerCommune(
  lineOutlines: L.LayerGroup,
  lineInlines: L.LayerGroup,
  lineArcs: L.LayerGroup,
  commune: Commune,
  color: string
) {
  const weight = Math.max(3, nbPeopleToStrokeWeight(commune['2014_inter']));
  // L.circleMarker([commune.longitude, commune.latitude], {
  //   color: `black`,
  //   radius: trajetInterMarkerRadiusPx,
  //   weight: weight + 5,
  //   opacity: 1
  // }).addTo(lineOutlines);
  new L.CircleMarker([commune.longitude, commune.latitude], {
    color: `black`,
    radius: weight + weight / 2 + 3,
    weight: 1,
    opacity: 1
  }).addTo(lineOutlines);
  new L.CircleMarker([commune.longitude, commune.latitude], {
    color: `white`,
    radius: weight + weight / 2 + 2,
    weight: 1,
    opacity: 1,
    fill: true,
    fillOpacity: 1.0,
    fillColor: 'white'
  }).addTo(lineOutlines);

  new L.CircleMarker([commune.longitude, commune.latitude], {
    color: color,
    radius: weight,
    weight: weight,
    opacity: 1,
    fill: false
  })
    .bindTooltip(
      ` <b>${commune.commune}</b><br>2014_inter: ${commune['2014_inter']}`
    )
    .addTo(lineArcs);

  new L.CircleMarker([commune.longitude, commune.latitude], {
    color: `black`,
    radius: weight / 2 - 3,
    weight: 1,
    opacity: 1,
    fill: true,
    fillOpacity: 1.0,
    fillColor: 'white'
  }).addTo(lineInlines);
  new L.CircleMarker([commune.longitude, commune.latitude], {
    color: `white`,
    radius: weight / 2 - 5,
    weight: 1,
    opacity: 1,
    fill: true,
    fillOpacity: 1.0,
    fillColor: 'white'
  }).addTo(lineInlines);
}

export function renderArcs(
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
    .bindTooltip(srcArcLabel + '<br>' + reverseArcLabel, { sticky: true })
    .addTo(lineInlines);

  L.polyline(mainLine, {
    color: 'green',
    weight: weightSrcExtra,
    opacity: 1,
    offset: weightSrcExtra / 2 + 1
  } as any)
    .bindTooltip(srcArcLabel, { sticky: true })
    .addTo(lineArcs);

  if (reverseArc) {
    L.polyline(mainLine, {
      color: 'red',
      weight: weightDestExtra,
      opacity: 1,
      offset: -(weightDestExtra / 2 + 1),
      use: L.polyline
    } as any)
      .bindTooltip(reverseArcLabel, { sticky: true })
      .addTo(lineArcs);
  }
}
