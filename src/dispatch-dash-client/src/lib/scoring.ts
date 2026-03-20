const ROAD_FACTOR = 1.3;
const DISTANCE_SCALE = 10;

export function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function calculateRouteDistance(
  depot: { lat: number; lon: number },
  stops: { lat: number; lon: number }[],
): number {
  if (stops.length === 0) return 0;
  const points = [depot, ...stops, depot];
  let total = 0;
  for (let i = 0; i < points.length - 1; i++) {
    total += haversineKm(points[i].lat, points[i].lon, points[i + 1].lat, points[i + 1].lon);
  }
  return Math.round(total * ROAD_FACTOR * DISTANCE_SCALE * 10) / 10;
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}
