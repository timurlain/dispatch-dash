import { useMemo, useCallback } from 'react';
import { Map, Source, Layer, Marker } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { Feature, FeatureCollection, LineString } from 'geojson';
import type { Customer, Depot, TrafficSegment } from '../types';
import { MAP_CENTER, MAP_ZOOM, MAP_STYLE, VEHICLE_COLORS } from '../lib/mapHelpers';

interface Props {
  customers: Customer[];
  depot: Depot;
  routes: globalThis.Map<string, string[]>;
  activeVehicleId: string;
  trafficSegments: TrafficSegment[];
  onCustomerClick: (customerId: string) => void;
}

export default function GameMap({ customers, depot, routes, activeVehicleId, trafficSegments, onCustomerClick }: Props) {
  const customerMap = useMemo(
    () => new globalThis.Map(customers.map(c => [c.id, c])),
    [customers],
  );
  const allAssigned = useMemo(
    () => new Set([...routes.values()].flat()),
    [routes],
  );
  const vehicleIds = useMemo(() => [...routes.keys()], [routes]);
  const activeRoute = useMemo(() => routes.get(activeVehicleId) ?? [], [routes, activeVehicleId]);

  // Build GeoJSON for route polylines
  const routeGeoJson = useMemo((): FeatureCollection<LineString> => {
    const features: Feature<LineString>[] = [];
    vehicleIds.forEach((vid, idx) => {
      const ids = routes.get(vid) ?? [];
      if (ids.length === 0) return;
      const coordinates: [number, number][] = [
        [depot.lon, depot.lat],
        ...ids.map(id => {
          const c = customerMap.get(id);
          return c ? [c.lon, c.lat] as [number, number] : [depot.lon, depot.lat] as [number, number];
        }),
        [depot.lon, depot.lat],
      ];
      features.push({
        type: 'Feature',
        properties: {
          color: VEHICLE_COLORS[idx % VEHICLE_COLORS.length],
          isActive: vid === activeVehicleId ? 'true' : 'false',
        },
        geometry: { type: 'LineString', coordinates },
      });
    });
    return { type: 'FeatureCollection', features };
  }, [vehicleIds, routes, depot, activeVehicleId, customerMap]);

  // Build GeoJSON for traffic segments
  const trafficGeoJson = useMemo((): FeatureCollection<LineString> => {
    const features: Feature<LineString>[] = [];
    trafficSegments.forEach(seg => {
      const from = customerMap.get(seg.fromId);
      const to = customerMap.get(seg.toId);
      if (!from || !to) return;
      features.push({
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: [[from.lon, from.lat], [to.lon, to.lat]],
        },
      });
    });
    return { type: 'FeatureCollection', features };
  }, [trafficSegments, customerMap]);

  const handleMarkerClick = useCallback((e: React.MouseEvent, customerId: string) => {
    e.stopPropagation();
    onCustomerClick(customerId);
  }, [onCustomerClick]);

  return (
    <Map
      initialViewState={{
        longitude: MAP_CENTER.longitude,
        latitude: MAP_CENTER.latitude,
        zoom: MAP_ZOOM,
      }}
      style={{ width: '100%', height: '100%' }}
      mapStyle={MAP_STYLE}
    >
      {/* Route polylines - active */}
      <Source id="routes" type="geojson" data={routeGeoJson}>
        <Layer
          id="routes-active"
          type="line"
          filter={['==', ['get', 'isActive'], 'true']}
          paint={{
            'line-color': ['get', 'color'],
            'line-width': 4,
            'line-opacity': 1,
          }}
        />
        <Layer
          id="routes-inactive"
          type="line"
          filter={['==', ['get', 'isActive'], 'false']}
          paint={{
            'line-color': ['get', 'color'],
            'line-width': 2,
            'line-opacity': 0.5,
            'line-dasharray': [2, 1],
          }}
        />
      </Source>

      {/* Traffic segments */}
      {trafficGeoJson.features.length > 0 && (
        <Source id="traffic" type="geojson" data={trafficGeoJson}>
          <Layer
            id="traffic-segments"
            type="line"
            paint={{
              'line-color': '#ef4444',
              'line-width': 6,
              'line-opacity': 0.6,
              'line-dasharray': [3, 2],
            }}
          />
        </Source>
      )}

      {/* Depot marker */}
      <Marker longitude={depot.lon} latitude={depot.lat} anchor="center">
        <div style={{
          background: '#22c55e', border: '2px solid #16a34a', borderRadius: 4,
          width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'white', fontFamily: 'monospace', fontWeight: 700, fontSize: 18,
        }}>
          🏭
        </div>
      </Marker>

      {/* Customer markers */}
      {customers.map(c => {
        const isSelected = allAssigned.has(c.id);
        const orderIndex = activeRoute.indexOf(c.id);
        const bg = isSelected ? '#FF6B35' : '#1e293b';
        const border = isSelected ? '#FF6B35' : '#64748b';
        const label = orderIndex >= 0 ? `${orderIndex + 1}` : c.id;
        const twIcon = c.timeWindow === 'morning' ? '🌅' : c.timeWindow === 'afternoon' ? '🌙' : '';
        const rushIcon = c.isRushOrder ? '🆘' : '';

        return (
          <Marker key={c.id} longitude={c.lon} latitude={c.lat} anchor="center">
            <div
              onClick={(e) => handleMarkerClick(e, c.id)}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                cursor: 'pointer', position: 'relative',
              }}
            >
              <div style={{
                background: bg, border: `2px solid ${border}`, borderRadius: '50%',
                width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#e2e8f0', fontFamily: 'monospace', fontWeight: 700, fontSize: 14,
                position: 'relative',
              }}>
                {label}
                {(twIcon || rushIcon) && (
                  <span style={{ position: 'absolute', top: -10, right: -10, fontSize: 16 }}>
                    {twIcon}{rushIcon}
                  </span>
                )}
              </div>
              {c.demand > 0 && (
                <span style={{
                  fontSize: 10, color: '#94a3b8', fontFamily: 'monospace', fontWeight: 600,
                  marginTop: 1, background: '#0f172aCC', borderRadius: 3, padding: '0 3px',
                }}>
                  {c.demand}j
                </span>
              )}
            </div>
          </Marker>
        );
      })}
    </Map>
  );
}
