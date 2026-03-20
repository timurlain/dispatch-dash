import type { LatLngExpression } from 'leaflet';
import type { Customer, Depot } from '../types';

export const VEHICLE_COLORS = ['#FF6B35', '#00B4D8', '#22c55e', '#a855f7'];

export function toLatLng(point: { lat: number; lon: number }): LatLngExpression {
  return [point.lat, point.lon];
}

export function getRoutePolyline(depot: Depot, customers: Customer[]): LatLngExpression[] {
  return [toLatLng(depot), ...customers.map(toLatLng), toLatLng(depot)];
}

export const MAP_CENTER: LatLngExpression = [49.35, 17.85];
export const MAP_ZOOM = 10;
