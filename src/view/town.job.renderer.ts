import L from 'leaflet';
import { Commune } from '../model/commune';
import { nbJobsToRadius, incomeToHeight } from './marker.converters';

function extendSemiCircle() {
  // from Leaflet semi-circle plugin
  // https://github.com/jieter/Leaflet-semicircle
  var DEG_TO_RAD = Math.PI / 180;

  // make sure 0 degrees is up (North) and convert to radians.
  function fixAngle(angle) {
    return (angle - 90) * DEG_TO_RAD;
  }

  // rotate point [x + r, y+r] around [x, y] by `angle` radians.
  function rotated(p, angle, r) {
    return p.add(L.point(Math.cos(angle), Math.sin(angle)).multiplyBy(r));
  }

  (L.Point.prototype as any).rotated = function(angle, r) {
    return rotated(this, angle, r);
  };

  var semicircle = {
    options: {
      startAngle: 0,
      stopAngle: 359.9999
    },

    startAngle: function() {
      if (this.options.startAngle < this.options.stopAngle) {
        return fixAngle(this.options.startAngle);
      } else {
        return fixAngle(this.options.stopAngle);
      }
    },

    stopAngle: function() {
      if (this.options.startAngle < this.options.stopAngle) {
        return fixAngle(this.options.stopAngle);
      } else {
        return fixAngle(this.options.startAngle);
      }
    },

    setStartAngle: function(angle) {
      this.options.startAngle = angle;
      return this.redraw();
    },

    setStopAngle: function(angle) {
      this.options.stopAngle = angle;
      return this.redraw();
    },

    setDirection: function(direction, degrees) {
      if (degrees === undefined) {
        degrees = 10;
      }
      this.options.startAngle = direction - degrees / 2;
      this.options.stopAngle = direction + degrees / 2;

      return this.redraw();
    },
    getDirection: function() {
      return this.stopAngle() - (this.stopAngle() - this.startAngle()) / 2;
    },

    isSemicircle: function() {
      var startAngle = this.options.startAngle,
        stopAngle = this.options.stopAngle;

      return (
        !(startAngle === 0 && stopAngle > 359) && !(startAngle === stopAngle)
      );
    },
    _containsPoint: function(p) {
      function normalize(angle) {
        while (angle <= -Math.PI) {
          angle += 2.0 * Math.PI;
        }
        while (angle > Math.PI) {
          angle -= 2.0 * Math.PI;
        }
        return angle;
      }
      var angle = Math.atan2(p.y - this._point.y, p.x - this._point.x);
      var nStart = normalize(this.startAngle());
      var nStop = normalize(this.stopAngle());
      if (nStop <= nStart) {
        nStop += 2.0 * Math.PI;
      }
      if (angle <= nStart) {
        angle += 2.0 * Math.PI;
      }
      return (
        nStart < angle &&
        angle <= nStop &&
        p.distanceTo(this._point) <= this._radius + this._clickTolerance()
      );
    }
  };

  (L as any).SemiCircle = L.Circle.extend(semicircle);
  (L as any).SemiCircleMarker = L.CircleMarker.extend(semicircle);

  (L as any).semiCircle = function(latlng, options) {
    return new (L as any).SemiCircle(latlng, options);
  };
  (L as any).semiCircleMarker = function(latlng, options) {
    return new (L as any).SemiCircleMarker(latlng, options);
  };

  var _updateCircleSVG = (L.SVG.prototype as any)._updateCircle;
  var _updateCircleCanvas = (L.Canvas.prototype as any)._updateCircle;

  L.SVG.include({
    _updateCircle: function(layer) {
      // If we want a circle, we use the original function
      if (
        !(
          layer instanceof (L as any).SemiCircle ||
          layer instanceof (L as any).SemiCircleMarker
        ) ||
        !layer.isSemicircle()
      ) {
        return _updateCircleSVG.call(this, layer);
      }
      if (layer._empty()) {
        return this._setPath(layer, 'M0 0');
      }

      var p = layer._map.latLngToLayerPoint(layer._latlng),
        r = layer._radius,
        r2 = Math.round(layer._radiusY || r),
        start = p.rotated(layer.startAngle(), r),
        end = p.rotated(layer.stopAngle(), r);

      var largeArc =
        layer.options.stopAngle - layer.options.startAngle >= 180 ? '1' : '0';

      var d =
        'M' +
        p.x +
        ',' +
        p.y +
        // line to first start point
        'L' +
        start.x +
        ',' +
        start.y +
        'A ' +
        r +
        ',' +
        r2 +
        ',0,' +
        largeArc +
        ',1,' +
        end.x +
        ',' +
        end.y +
        ' z';

      this._setPath(layer, d);
    }
  });

  L.Canvas.include({
    _updateCircle: function(layer) {
      // If we want a circle, we use the original function
      if (
        !(
          layer instanceof (L as any).SemiCircle ||
          layer instanceof (L as any).SemiCircleMarker
        ) ||
        !layer.isSemicircle()
      ) {
        return _updateCircleCanvas.call(this, layer);
      }

      if (!this._drawing || layer._empty()) {
        return;
      }

      var p = layer._point,
        ctx = this._ctx,
        r = layer._radius,
        s = (layer._radiusY || r) / r,
        start = p.rotated(layer.startAngle(), r);

      this._drawnLayers[layer._leaflet_id] = layer;

      if (s !== 1) {
        ctx.save();
        ctx.scale(1, s);
      }

      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(start.x, start.y);
      ctx.arc(p.x, p.y, r, layer.startAngle(), layer.stopAngle());
      ctx.lineTo(p.x, p.y);

      if (s !== 1) {
        ctx.restore();
      }

      this._fillStroke(ctx, layer);
    }
  });
}

extendSemiCircle();

export function renderJobMarkerPerCommune(
  jobLayer: L.LayerGroup,
  smallIncomeLayer: L.LayerGroup,
  bigIncomeLayer: L.LayerGroup,
  commune: Commune
) {
  const popupAttributes = [
    'emplois',
    'revenu_median',
    '2015_inter_csp1',
    '2015_inter_csp2',
    '2015_inter_csp3'
  ];

  addJobPool(commune, popupAttributes, jobLayer);

  const bigWidth = 30;
  const bigHeights = [10, 20, 50, 70, 100];
  const smallWidth = bigWidth / 2;
  const smallHeights = bigHeights.map(h => h / 2);

  const heightIndex = incomeToHeight(commune[popupAttributes[1]]);

  addIncome(
    heightIndex,
    bigWidth,
    bigHeights,
    commune,
    popupAttributes,
    bigIncomeLayer,
    'bigBuildingIcon'
  );
  addIncome(
    heightIndex,
    smallWidth,
    smallHeights,
    commune,
    popupAttributes,
    smallIncomeLayer,
    'smallBuildingIcon'
  );
}

export function hideInfoCSP() {
  for (let i = 1; i < 4; i++) {
    const infoDomElement = document.querySelector(`#infoCSP #csp${i}`);

    if (infoDomElement) {
      (infoDomElement as HTMLElement).style.display = 'none';
    }
  }
}
function markerOnClick(event: Event) {
  const cspIndex = event.target['csp_index'];

  for (let i = 1; i < 4; i++) {
    const infoDomElement = document.querySelector(`#infoCSP #csp${i}`);

    if (infoDomElement) {
      (infoDomElement as HTMLElement).style.display =
        i === cspIndex ? '' : 'none';
    }
  }
}

function addJobPool(
  commune: Commune,
  popupAttributes: Array<string>,
  jobLayer: L.LayerGroup<any>
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
    .addTo(jobLayer);

  const colors: string[] = ['30', '60', '120'];

  const sumCsp =
    commune['2015_inter_csp1'] +
    commune['2015_inter_csp2'] +
    commune['2015_inter_csp3'];
  if (sumCsp !== 0) {
    let angleStart = 0;
    let angleEnd = 0;
    const markerGroup = [];

    for (let i = 0; i < 3; i++) {
      angleEnd =
        angleStart + (commune[`2015_inter_csp${i + 1}`] / sumCsp) * 360;

      // let arc: Array<[number, number]> =[[commune.longitude, commune.latitude]];
      // arc=arc.concat(MarkerUtils.buildArcCircle(
      //     [commune.longitude, commune.latitude],
      //     radius,
      //     angleStart-epsilon,
      //     angleEnd+epsilon,
      //     20
      //   ))

      const segment = (L as any)
        .semiCircle([commune.longitude, commune.latitude], {
          radius: radius * 0.75,
          startAngle: angleStart,
          stopAngle: angleEnd,
          color: `hsl(${colors[i]}, 100%, 25%)`,
          fillColor: `hsl(${colors[i]}, 100%, 75%)`,
          fillOpacity: 0.5
        })
        .bindTooltip(
          ` <b>${commune.commune}</b><br>Repartition CSP ${i + 1}: ${
            commune[`2015_inter_csp${i + 1}`]
          }`
        );

      segment['csp_index'] = i + 1;
      segment.on('mouseover', markerOnClick);

      markerGroup.push(
        // L.polygon(
        //     arc ,
        //   {
        //     color: `hsl(${colors[i]}, 100%, 25%)`,
        //     fillColor: `hsl(${colors[i]}, 100%, 75%)`,
        //     fillOpacity: 0.5
        //   }
        // )
        segment
      );
      angleStart = angleEnd;
    }

    L.featureGroup(markerGroup).addTo(jobLayer);
  }
}

export function toggleLayerVisibility(zoomLevel: number) {
  const elementsBig = document.querySelectorAll('#mapJob .bigBuildingIcon');
  for (var i = 0; i < elementsBig.length; i++) {
    const element = elementsBig.item(i) as HTMLElement;
    if (zoomLevel < 10) {
      (element as HTMLElement).style.display = 'none';
    } else {
      (element as HTMLElement).style.display = '';
    }
  }
  const elementsSmall = document.querySelectorAll('#mapJob .smallBuildingIcon');
  for (var i = 0; i < elementsSmall.length; i++) {
    const element = elementsSmall.item(i) as HTMLElement;
    if (zoomLevel < 10) {
      (element as HTMLElement).style.display = '';
    } else {
      (element as HTMLElement).style.display = 'none';
    }
  }
}

function addIncome(
  heightIndex: number,
  width: number,
  heights: number[],
  commune: Commune,
  popupAttributes: string[],
  incomeLayer: L.LayerGroup<any>,
  className: string
) {
  var icon = L.icon({
    iconUrl: `maps/images/building_${heightIndex}.png`,
    iconSize: [width, heights[heightIndex]],
    iconAnchor: [width / 2, heights[heightIndex] - 10],
    className: className
  });
  const markerIncome = L.marker([commune.longitude, commune.latitude], {
    icon: icon
  }).bindTooltip(
    ` <b>${commune.commune}</b><br>'revenu_median: '${
      commune[popupAttributes[1]]
    }`
  );
  markerIncome.addTo(incomeLayer);
}
