import { useState, useCallback, useMemo } from 'react';
import type { RoundConfig, RouteSubmission } from '../types';
import { calculateRouteDistance } from '../lib/scoring';

export function useGameState(round: RoundConfig) {
  const [routes, setRoutes] = useState<Map<string, string[]>>(
    () => new Map(round.vehicles.map(v => [v.id, []]))
  );
  const [activeVehicleId, setActiveVehicleId] = useState(round.vehicles[0].id);

  const customerMap = useMemo(
    () => new Map(round.customers.map(c => [c.id, c])),
    [round.customers],
  );

  const toggleCustomer = useCallback((customerId: string) => {
    setRoutes(prev => {
      const next = new Map(prev);
      const activeRoute = [...(next.get(activeVehicleId) ?? [])];
      const idx = activeRoute.indexOf(customerId);
      if (idx >= 0) {
        activeRoute.splice(idx, 1);
        next.set(activeVehicleId, activeRoute);
        return next;
      }
      // Remove from other vehicles first
      for (const [vid, route] of next) {
        const i = route.indexOf(customerId);
        if (i >= 0) {
          const updated = [...route];
          updated.splice(i, 1);
          next.set(vid, updated);
          break;
        }
      }
      next.set(activeVehicleId, [...(next.get(activeVehicleId) ?? []), customerId]);
      return next;
    });
  }, [activeVehicleId]);

  const getVehicleLoad = useCallback((vehicleId: string) => {
    const ids = routes.get(vehicleId) ?? [];
    return ids.reduce((sum, id) => sum + (customerMap.get(id)?.demand ?? 0), 0);
  }, [routes, customerMap]);

  const getVehicleDistance = useCallback((vehicleId: string) => {
    const ids = routes.get(vehicleId) ?? [];
    const stops = ids.map(id => customerMap.get(id)!).filter(Boolean);
    return calculateRouteDistance(round.depot, stops);
  }, [routes, customerMap, round.depot]);

  const totalVisited = useMemo(
    () => new Set([...routes.values()].flat()).size,
    [routes],
  );

  const toSubmission = useCallback((): RouteSubmission[] => {
    return [...routes.entries()]
      .filter(([, ids]) => ids.length > 0)
      .map(([vehicleId, customerIds]) => ({ vehicleId, customerIds }));
  }, [routes]);

  const reset = useCallback(() => {
    setRoutes(new Map(round.vehicles.map(v => [v.id, []])));
    setActiveVehicleId(round.vehicles[0].id);
  }, [round.vehicles]);

  return {
    routes, activeVehicleId, setActiveVehicleId,
    toggleCustomer, getVehicleLoad, getVehicleDistance,
    totalVisited, toSubmission, reset,
  };
}
