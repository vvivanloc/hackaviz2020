import L from 'leaflet';
import { Commune } from '../../model/commune';
import { Trajet } from '../../model/trajet';
import {
  nbPeopleToStrokeWeight,
  timeToHue,
  timeGainToHue
} from '../../model/value.mappers';
import { CommuneLatLongs } from '../../main';
import { speedToHue } from '../../model/value.mappers';

export function renderMeanPerCommune(
  lineOutlines: L.LayerGroup,
  lineInlines: L.LayerGroup,
  lineArcs: L.LayerGroup,
  commune: Commune,
  color: string
) {
  const weight = 5;

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

export function renderMeanBikeCarArcs(
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

  const weight = Math.max(weightDestExtra, weightSrcExtra);
  const segmentWidth = weight + 4;
  const mainLine: L.LatLngExpression[] = [
    [src.lng, src.lat],
    [dest.lng, dest.lat]
  ];

  L.polyline(mainLine, {
    color: '#000',
    weight: segmentWidth + 5,
    opacity: 1
  } as any).addTo(lineOutlines);

  const timeBike = trajet.duree_velo_minutes;
  const speedBike = (trajet.distance_velo_km / trajet.duree_velo_minutes) * 60;
  const timeCar = trajet.duree_auto_minutes;
  const speedCar = (trajet.distance_auto_km / trajet.duree_auto_minutes) * 60;
  const timeGain = timeCar / timeBike;

  let srcArcLabel =
    ` <b>${trajet.commune}->${
      trajet.travail_commune
    }</b><br>timeBike: ${timeBike} mn<br>` +
    `timeCar: ${timeCar} mn` +
    `<br>time gain: ${timeGain} x` +
    `<br>speedBike: ${speedBike} km/h<br>` +
    `speedCar: ${speedCar} km/h`;

  srcArcLabel =
    srcArcLabel +
    ` <br> <b>${trajet.commune}->${
      trajet.travail_commune
    }</b><br>2014_extra_travail_commune: ${
      trajet['2014_extra_travail_commune']
    }`;
  if (reverseArc) {
    srcArcLabel =
      srcArcLabel + 
        ` <br><b>${reverseArc.commune}->${
            reverseArc.travail_commune
          }</b><br>2014_extra_travail_commune: ${
            reverseArc['2014_extra_travail_commune']
          }`
        ;
  }
  L.polyline(mainLine, {
    color: '#fff',
    weight: segmentWidth + 3,
    opacity: 1
  } as any)
    .bindTooltip(srcArcLabel, { sticky: true })
    .addTo(lineInlines);

  const hue = Math.min(
    timeToHue(timeBike),
    Math.max(timeGainToHue(timeGain), speedToHue(speedCar))
  );
  L.polyline(mainLine, {
    color: `hsl(${hue}, 100%, 50%)`,
    weight: weight,
    opacity: 1
  } as any)
    .bindTooltip(srcArcLabel, { sticky: true })
    .addTo(lineArcs);
}
