import { useMemo } from 'react';
import MapGL, { Source, Layer, Marker } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { LayerProps } from 'react-map-gl/maplibre';
import type { Feature, FeatureCollection, LineString } from 'geojson';
import type { Customer, Depot, TrafficSegment } from '../types';
import { MAP_CENTER, MAP_ZOOM, MAP_STYLE, VEHICLE_COLORS } from '../lib/mapHelpers';
import CustomerMarker from './CustomerMarker';

interface Props {
  customers: Customer[];
  depot: Depot;
  routes: Map<string, string[]>; // vehicleId -> ordered customerIds
  activeVehicleId: string;
  trafficSegments: TrafficSegment[];
  onCustomerClick: (customerId: string) => void;
}

export default function GameMap({ customers, depot, routes, activeVehicleId, trafficSegments, onCustomerClick }: Props) {
  const customerMap = new globalThis.Map(customers.map(c => [c.id, c]));
  const allAssigned = new Set([...routes.values()].flat());
  const vehicleIds = [...routes.keys()];

  // Build GeoJSON for route polylines
  const routeGeoJson: FeatureCollection<LineString> = useMemo(() => {
    const features: Feature<LineString>[] = [];
    vehicleIds.forEach((vid, idx) => {
      const ids = routes.get(vid) ?? [];
      if (ids.length === 0) return;
      const coordinates: [number, number][] = [
        [depot.lon, depot.lat],
        ...ids.map(id => {
          const c = customerMap.get(id)!;
          return [c.lon, c.lat] as [number, number];
        }),
        [depot.lon, depot.lat],
      ];
      features.push({
        type: 'Feature',
        properties: {
          vehicleId: vid,
          color: VEHICLE_COLORS[idx % VEHICLE_COLORS.length],
          isActive: vid === activeVehicleId,
          lineWidth: vid === activeVehicleId ? 4 : 2,
        },
        geometry: {
          type: 'LineString',
          coordinates,
        },
      });
    });

    return { type: 'FeatureCollection', features };
  }, [vehicleIds, routes, depot, activeVehicleId, customerMap]);

  // Build GeoJSON for traffic segments
  const trafficGeoJson: FeatureCollection<LineString> = useMemo(() => {
    const features: Feature<LineString>[] = [];
    trafficSegments.forEach(seg => {
      const from = customerMap.get(seg.fromId);
      const to = customerMap.get(seg.toId);
      if (!from || !to) return;
      features.push({
        type: 'Feature',
        properties: { id: `${seg.fromId}-${seg.toId}` },
        geometry: {
          type: 'LineString',
          coordinates: [
            [from.lon, from.lat],
            [to.lon, to.lat],
          ],
        },
      });
    });

    return { type: 'FeatureCollection', features };
  }, [trafficSegments, customerMap]);

  // Layer styles for active routes (solid, thick)
  const activeRouteLayer: LayerProps = {
    id: 'routes-active',
    type: 'line',
    filter: ['==', ['get', 'isActive'], true],
    paint: {
      'line-color': ['get', 'color'],
      'line-width': 4,
      'line-opacity': 1,
    },
  };

  // Layer styles for inactive routes (dashed, thin)
  const inactiveRouteLayer: LayerProps = {
    id: 'routes-inactive',
    type: 'line',
    filter: ['==', ['get', 'isActive'], false],
    paint: {
      'line-color': ['get', 'color'],
      'line-width': 2,
      'line-opacity': 0.5,
      'line-dasharray': [2, 1],
    },
  };

  // Layer style for traffic segments (red dashed)
  const trafficLayer: LayerProps = {
    id: 'traffic-segments',
    type: 'line',
    paint: {
      'line-color': '#ef4444',
      'line-width': 6,
      'line-opacity': 0.6,
      'line-dasharray': [3, 2],
    },
  };

  return (
    <MapGL
      initialViewState={{
        longitude: MAP_CENTER.longitude,
        latitude: MAP_CENTER.latitude,
        zoom: MAP_ZOOM,
      }}
      style={{ width: '100%', height: '100%', borderRadius: '0.5rem', background: '#0f172a' }}
      mapStyle={MAP_STYLE}
    >
      {/* Route polylines */}
      <Source id="routes" type="geojson" data={routeGeoJson}>
        <Layer {...activeRouteLayer} />
        <Layer {...inactiveRouteLayer} />
      </Source>

      {/* Traffic segments */}
      <Source id="traffic" type="geojson" data={trafficGeoJson}>
        <Layer {...trafficLayer} />
      </Source>

      {/* Depot marker */}
      <Marker longitude={depot.lon} latitude={depot.lat} anchor="center">
        <div
          style={{
            background: '#22c55e',
            border: '2px solid #16a34a',
            borderRadius: 4,
            width: 40,
            height: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontFamily: 'monospace',
            fontWeight: 700,
            fontSize: 18,
          }}
        >
          {'\u{1F3ED}'}
        </div>
      </Marker>

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
    </MapGL>
  );
}
