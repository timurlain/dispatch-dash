import { describe, it, expect } from 'vitest';
import { haversineKm, calculateRouteDistance } from './scoring';

describe('haversineKm', () => {
  it('calculates Zašová to Zlín ≈ 36km', () => {
    const dist = haversineKm(49.4547, 18.0231, 49.2268, 17.6669);
    expect(dist).toBeGreaterThan(33);
    expect(dist).toBeLessThan(40);
  });

  it('same point returns 0', () => {
    expect(haversineKm(49.4547, 18.0231, 49.4547, 18.0231)).toBeCloseTo(0);
  });
});

describe('calculateRouteDistance', () => {
  const depot = { lat: 49.4547, lon: 18.0231 };
  const customers = [
    { lat: 49.3388, lon: 17.9962 }, // A - Vsetín
    { lat: 49.4583, lon: 18.1431 }, // B - Rožnov
  ];

  it('includes return to depot', () => {
    const dist = calculateRouteDistance(depot, customers);
    expect(dist).toBeGreaterThan(0);
  });

  it('empty route returns 0', () => {
    expect(calculateRouteDistance(depot, [])).toBe(0);
  });
});
