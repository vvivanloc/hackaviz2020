import L from 'leaflet';

export class MarkerUtils {
  /** taken from  Leaflet.GeometryUtil
   * http://makinacorpus.github.io/Leaflet.GeometryUtil/index.html
   * MakinaCorpus
   */
  private static destination = (
    latlng: { lng: number; lat: number },
    headingDegrees: number,
    distanceMeter: number
  ) => {
    headingDegrees = (headingDegrees + 360) % 360;
    let rad = Math.PI / 180,
      radInv = 180 / Math.PI,
      R = 6378137, // approximation of Earth's radius
      lon1 = latlng.lng * rad,
      lat1 = latlng.lat * rad,
      rheading = headingDegrees * rad,
      sinLat1 = Math.sin(lat1),
      cosLat1 = Math.cos(lat1),
      cosDistR = Math.cos(distanceMeter / R),
      sinDistR = Math.sin(distanceMeter / R),
      lat2 = Math.asin(
        sinLat1 * cosDistR + cosLat1 * sinDistR * Math.cos(rheading)
      ),
      lon2 =
        lon1 +
        Math.atan2(
          Math.sin(rheading) * sinDistR * cosLat1,
          cosDistR - sinLat1 * Math.sin(lat2)
        );
    lon2 = lon2 * radInv;
    lon2 = lon2 > 180 ? lon2 - 360 : lon2 < -180 ? lon2 + 360 : lon2;
    return L.latLng([lat2 * radInv, lon2]);
  };

  private static buildArcCircle = (
    center: [number, number],
    radiusMeter: number,
    startAngleRad: number,
    endAngleRad: number
  ): Array<[number, number]> => {
    const points: Array<[number, number]> = [];
    const nbSides = 6;
    const arcIncrement = (2 * Math.PI) / nbSides;

    for (
      let angle = startAngleRad;
      angle < endAngleRad;
      angle = angle + arcIncrement
    ) {
      const x = MarkerUtils.destination(
        { lat: center[0], lng: center[1] },
        (angle * 360) / (2 * Math.PI),
        radiusMeter
      );
      points.push([x.lat, x.lng]);
    }
    return points;
  };

  static buildHalfLeftCircle = (
    center: [number, number],
    radiusMeter: number
  ): Array<[number, number]> => {
    return MarkerUtils.buildArcCircle(
      center,
      radiusMeter,
      Math.PI,
      Math.PI * 2
    );
  };

  static buildHalfRightCircle = (
    center: [number, number],
    radiusMeter: number
  ): Array<[number, number]> => {
    return MarkerUtils.buildArcCircle(center, radiusMeter, 0, Math.PI + 0.1);
  };
}
