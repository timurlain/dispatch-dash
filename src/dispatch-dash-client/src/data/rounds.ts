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
  { id: 'I', name: 'Uh. Hradiště',   lat: 49.0698, lon: 17.4597, demand: 3, timeWindow: 'none', isRushOrder: false },
  { id: 'J', name: 'Vizovice',       lat: 49.2222, lon: 17.8531, demand: 2, timeWindow: 'morning', isRushOrder: false },
  { id: 'K', name: 'Luhačovice',     lat: 49.1003, lon: 17.7603, demand: 4, timeWindow: 'none', isRushOrder: false },
  { id: 'L', name: 'Napajedla',      lat: 49.1714, lon: 17.5131, demand: 3, timeWindow: 'afternoon', isRushOrder: false },
  { id: 'M', name: 'Hulín',          lat: 49.3167, lon: 17.4636, demand: 2, timeWindow: 'none', isRushOrder: false },
  { id: 'N', name: 'Slavičín',       lat: 49.0856, lon: 17.8817, demand: 3, timeWindow: 'none', isRushOrder: false },
  { id: 'O', name: 'Kelč',           lat: 49.4364, lon: 17.8264, demand: 2, timeWindow: 'none', isRushOrder: false },
];

const extraCustomers: Customer[] = [
  { id: 'P', name: 'Uherský Brod',    lat: 49.0247, lon: 17.6486, demand: 4, timeWindow: 'morning', isRushOrder: false },
  { id: 'Q', name: 'Bojkovice',       lat: 49.0431, lon: 17.8292, demand: 3, timeWindow: 'none', isRushOrder: false },
  { id: 'R', name: 'Brumov-Bylnice',  lat: 49.0822, lon: 18.0242, demand: 5, timeWindow: 'afternoon', isRushOrder: false },
  { id: 'S', name: 'Val. Klobouky',   lat: 49.1372, lon: 18.0081, demand: 3, timeWindow: 'none', isRushOrder: false },
  { id: 'T', name: 'Staré Město',     lat: 49.0750, lon: 17.4350, demand: 4, timeWindow: 'none', isRushOrder: false },
];

const rushOrders: Customer[] = [
  { id: 'U',  name: 'Frenštát p. R.', lat: 49.5480, lon: 18.2108, demand: 4, timeWindow: 'none', isRushOrder: true },
  { id: 'V',  name: 'Nový Jičín',     lat: 49.5944, lon: 18.0103, demand: 5, timeWindow: 'none', isRushOrder: true },
  { id: 'W',  name: 'Kopřivnice',     lat: 49.5994, lon: 18.1447, demand: 3, timeWindow: 'none', isRushOrder: true },
  { id: 'X',  name: 'Přerov',         lat: 49.4553, lon: 17.4511, demand: 6, timeWindow: 'none', isRushOrder: true },
  { id: 'Y',  name: 'Prostějov',      lat: 49.4722, lon: 17.1117, demand: 4, timeWindow: 'none', isRushOrder: true },
  { id: 'Z',  name: 'Olomouc',        lat: 49.5938, lon: 17.2509, demand: 5, timeWindow: 'none', isRushOrder: true },
  { id: 'AA', name: 'Šternberk',      lat: 49.7306, lon: 17.2989, demand: 3, timeWindow: 'none', isRushOrder: true },
  { id: 'AB', name: 'Hranice',        lat: 49.5478, lon: 17.7347, demand: 4, timeWindow: 'none', isRushOrder: true },
  { id: 'AC', name: 'Lipník n. B.',   lat: 49.5267, lon: 17.5864, demand: 3, timeWindow: 'none', isRushOrder: true },
  { id: 'AD', name: 'Zubří',          lat: 49.4667, lon: 18.0933, demand: 2, timeWindow: 'none', isRushOrder: true },
];

export const rounds: Record<number, RoundConfig> = {
  1: {
    roundNumber: 1,
    title: 'Pohodička',
    description: 'Jeden kamion, žádná omezení. Najdi nejkratší trasu.',
    customers: baseCustomers.map(c => ({ ...c, timeWindow: 'none' as const, demand: 0 })),
    vehicles: [{ id: 'V1', capacity: Infinity, preloadedUnits: 0 }],
    depot,
    timerSeconds: 60,
    trafficSegments: [],
  },
  2: {
    roundNumber: 2,
    title: 'Vítejte v realitě',
    description: '4 kamiony, omezená kapacita, časová okna.',
    customers: [...baseCustomers, ...extraCustomers],
    vehicles: Array.from({ length: 4 }, (_, i): Vehicle => ({
      id: `V${i + 1}`, capacity: 20, preloadedUnits: 0,
    })),
    depot,
    timerSeconds: 90,
    trafficSegments: [],
  },
  3: {
    roundNumber: 3,
    title: 'Typické pondělí',
    description: 'Urgentní objednávky, poruchy, zácpy. Zvládneš obsloužit všechny?',
    customers: [...baseCustomers, ...extraCustomers, ...rushOrders],
    vehicles: [
      { id: 'V1', capacity: 15, preloadedUnits: 0 },
      { id: 'V2', capacity: 20, preloadedUnits: 0 },
      { id: 'V3', capacity: 20, preloadedUnits: 0 },
      { id: 'V4', capacity: 15, preloadedUnits: 0 },
    ],
    depot,
    timerSeconds: 120,
    trafficSegments: [{ fromId: 'G', toId: 'H', multiplier: 2.0 }],
  },
};
