export type TimeWindow = 'none' | 'morning' | 'afternoon';

export interface Customer {
  id: string;
  name: string;
  lat: number;
  lon: number;
  demand: number;
  timeWindow: TimeWindow;
  isRushOrder: boolean;
}

export interface Depot {
  name: string;
  lat: number;
  lon: number;
}

export interface Vehicle {
  id: string;
  capacity: number;
  preloadedUnits: number;
}

export interface TrafficSegment {
  fromId: string;
  toId: string;
  multiplier: number;
}

export interface RoundConfig {
  roundNumber: number;
  title: string;
  description: string;
  customers: Customer[];
  vehicles: Vehicle[];
  depot: Depot;
  timerSeconds: number;
  introSeconds: number;
  trafficSegments: TrafficSegment[];
}

export interface RouteSubmission {
  vehicleId: string;
  customerIds: string[];
}

export interface ScoreResult {
  distanceScore: number;
  penaltyScore: number;
  totalScore: number;
  rawDistanceKm: number;
  capacityPenalty: number;
  timeWindowPenalty: number;
  unvisitedPenalty: number;
}

export interface LeaderboardEntry {
  playerId: string;
  playerName: string;
  totalScore: number;
  rank: number;
}

export interface FeasibilityResult {
  isFeasible: boolean;
  totalDemand: number;
  totalCapacity: number;
  capacityShortfall: number;
  theoreticalMinPenalty: number;
  explanation: string;
}

export type GamePhase = 'waitingForPlayers' | 'playing' | 'showingResults' | 'gameOver';
