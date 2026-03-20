import { MapContainer, TileLayer, Polyline, Marker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Customer, Depot, TrafficSegment } from '../types';
import { MAP_CENTER, MAP_ZOOM, VEHICLE_COLORS } from '../lib/mapHelpers';
import CustomerMarker from './CustomerMarker';

interface Props {
  customers: Customer[];
  depot: Depot;
  routes: Map<string, string[]>; // vehicleId -> ordered customerIds
  activeVehicleId: string;
  trafficSegments: TrafficSegment[];
  onCustomerClick: (customerId: string) => void;
}

const depotIcon = L.divIcon({
  className: '',
  html: `<div style="
    background:#22c55e; border:2px solid #16a34a; border-radius:4px;
    width:40px; height:40px; display:flex; align-items:center; justify-content:center;
    color:white; font-family:monospace; font-weight:700; font-size:18px;
  ">\u{1F3ED}</div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

export default function GameMap({ customers, depot, routes, activeVehicleId, trafficSegments, onCustomerClick }: Props) {
  const customerMap = new Map(customers.map(c => [c.id, c]));
  const allAssigned = new Set([...routes.values()].flat());
  const vehicleIds = [...routes.keys()];

  return (
    <MapContainer center={MAP_CENTER} zoom={MAP_ZOOM} className="h-full w-full rounded-lg"
      style={{ background: '#0f172a' }}>
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://carto.com/">CARTO</a>'
      />

      {/* Depot marker */}
      <Marker position={[depot.lat, depot.lon]} icon={depotIcon} />

      {/* Customer markers */}
      {customers.map(c => {
        const activeRoute = routes.get(activeVehicleId) ?? [];
        const orderIndex = activeRoute.indexOf(c.id);
        return (
          <CustomerMarker
            key={c.id}
            customer={c}
            isSelected={allAssigned.has(c.id)}
            orderIndex={orderIndex >= 0 ? orderIndex : undefined}
            onClick={() => onCustomerClick(c.id)}
          />
        );
      })}

      {/* Route polylines */}
      {vehicleIds.map((vid, idx) => {
        const ids = routes.get(vid) ?? [];
        if (ids.length === 0) return null;
        const points: [number, number][] = [
          [depot.lat, depot.lon],
          ...ids.map(id => {
            const c = customerMap.get(id)!;
            return [c.lat, c.lon] as [number, number];
          }),
          [depot.lat, depot.lon],
        ];
        return (
          <Polyline
            key={vid}
            positions={points}
            color={VEHICLE_COLORS[idx % VEHICLE_COLORS.length]}
            weight={vid === activeVehicleId ? 4 : 2}
            opacity={vid === activeVehicleId ? 1 : 0.5}
            dashArray={vid === activeVehicleId ? undefined : '8 4'}
          />
        );
      })}

      {/* Traffic segments */}
      {trafficSegments.map(seg => {
        const from = customerMap.get(seg.fromId);
        const to = customerMap.get(seg.toId);
        if (!from || !to) return null;
        return (
          <Polyline
            key={`traffic-${seg.fromId}-${seg.toId}`}
            positions={[[from.lat, from.lon], [to.lat, to.lon]]}
            color="#ef4444"
            weight={6}
            opacity={0.6}
            dashArray="12 8"
          />
        );
      })}
    </MapContainer>
  );
}
