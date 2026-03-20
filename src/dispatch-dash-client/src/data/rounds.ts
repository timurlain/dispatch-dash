import type { Customer, Depot, RoundConfig, Vehicle } from '../types';

const depot: Depot = { name: 'Zašová', lat: 49.4547, lon: 18.0231 };

const baseCustomers: Customer[] = [
  { id: 'A', name: 'Vsetín',         lat: 49.3388, lon: 17.9962, demand: 4, timeWindow: 'none', isRushOrder: false },
  { id: 'B', name: 'Rožnov p. R.',   lat: 49.4583, lon: 18.1431, demand: 3, timeWindow: 'morning', isRushOrder: false },
  { id: 'C', name: 'Val. Meziříčí',  lat: 49.4719, lon: 17.9711, demand: 5, timeWindow: 'none', isRushOrder: false },
  { id: 'D', name: 'Bystřice p. H.', lat: 49.3964, lon: 17.6694, demand: 3, timeWindow: 'afternoon', isRushOrder: false },
  { id: 'E', name: 'Holešov',        lat: 49.3331, lon: 17.5783, demand: 4, timeWindow: 'none', isRushOrder: false },
  { id: 'F', name: 'Kroměříž',       lat: 49.2977, lon: 17.3933, demand: 2, timeWindow: 'morning', isRushOrder: false },
  { id: 'G', name: 'Zlín',           lat: 49.2268, lon: 17.6669, demand: 5, timeWindow: 'afternoon', isRushOrder: false },
  { id: 'H', name: 'Otrokovice',     lat: 49.2094, lon: 17.5315, demand: 4, timeWindow: 'none', isRushOrder: false },
];

const rushOrder: Customer = {
  id: 'R', name: 'Frenštát p. R.', lat: 49.5480, lon: 18.2108,
  demand: 4, timeWindow: 'none', isRushOrder: true,
};

export const rounds: Record<number, RoundConfig> = {
  1: {
    roundNumber: 1,
    title: 'The Easy Life',
    description: 'One truck, no limits. Just find the shortest route.',
    customers: baseCustomers.map(c => ({ ...c, timeWindow: 'none' as const, demand: 0 })),
    vehicles: [{ id: 'V1', capacity: Infinity, preloadedUnits: 0 }],
    depot,
    timerSeconds: 90,
    trafficSegments: [],
  },
  2: {
    roundNumber: 2,
    title: 'Welcome to Reality',
    description: '4 trucks, limited capacity, time windows.',
    customers: [...baseCustomers],
    vehicles: Array.from({ length: 4 }, (_, i): Vehicle => ({
      id: `V${i + 1}`, capacity: 20, preloadedUnits: 0,
    })),
    depot,
    timerSeconds: 90,
    trafficSegments: [],
  },
  3: {
    roundNumber: 3,
    title: 'A Typical Monday',
    description: 'Rush orders, breakdowns, traffic. Can you serve everyone?',
    customers: [...baseCustomers, rushOrder],
    vehicles: [
      { id: 'V1', capacity: 8, preloadedUnits: 0 },
      { id: 'V2', capacity: 5, preloadedUnits: 0 },
      { id: 'V3', capacity: 5, preloadedUnits: 0 },
      { id: 'V4', capacity: 5, preloadedUnits: 0 },
    ],
    depot,
    timerSeconds: 120,
    trafficSegments: [{ fromId: 'G', toId: 'H', multiplier: 2.0 }],
  },
};
