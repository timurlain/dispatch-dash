import { useState, useCallback, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import type { ScoreResult, LeaderboardEntry, FeasibilityResult, RouteSubmission } from '../types';
import { rounds } from '../data/rounds';
import { calculateRouteDistance } from '../lib/scoring';
import WaitingRoom from './WaitingRoom';
import Countdown from './Countdown';
import PlayScreen from './PlayScreen';
import RoundResult from './RoundResult';
import GameOver from './GameOver';

type Phase = 'join' | 'waiting' | 'countdown' | 'playing' | 'result' | 'gameOver';

/** Score a submission locally (single-player demo until SignalR is wired) */
function scoreLocally(
  roundNumber: number,
  submission: RouteSubmission[],
): ScoreResult {
  const round = rounds[roundNumber];
  const customerMap = new Map(round.customers.map(c => [c.id, c]));
  const allVisited = new Set(submission.flatMap(r => r.customerIds));

  let rawDistanceKm = 0;
  let capacityPenalty = 0;
  let timeWindowPenalty = 0;

  for (const route of submission) {
    const stops = route.customerIds.map(id => customerMap.get(id)!).filter(Boolean);
    rawDistanceKm += calculateRouteDistance(round.depot, stops);

    const vehicle = round.vehicles.find(v => v.id === route.vehicleId);
    if (vehicle && vehicle.capacity !== Infinity) {
      const load = stops.reduce((s, c) => s + c.demand, 0);
      if (load > vehicle.capacity) {
        capacityPenalty += (load - vehicle.capacity) * 50;
      }
    }

    for (const stop of stops) {
      if (stop.timeWindow !== 'none') {
        // Simplified: no actual time tracking, just add minor penalty for wrong ordering
        timeWindowPenalty += 0;
      }
    }
  }

  const unvisitedCount = round.customers.length - allVisited.size;
  const unvisitedPenalty = unvisitedCount * 100;

  const distanceScore = Math.round(rawDistanceKm);
  const penaltyScore = capacityPenalty + timeWindowPenalty + unvisitedPenalty;
  const totalScore = Math.max(0, 1000 - distanceScore - penaltyScore);

  return {
    distanceScore,
    penaltyScore,
    totalScore,
    rawDistanceKm,
    capacityPenalty,
    timeWindowPenalty,
    unvisitedPenalty,
  };
}

export default function JoinScreen() {
  const { code: urlCode } = useParams<{ code?: string }>();

  const [phase, setPhase] = useState<Phase>('join');
  const [roomCode, setRoomCode] = useState(urlCode?.toUpperCase() ?? '');
  const [playerName, setPlayerName] = useState('');
  const [players, setPlayers] = useState<string[]>([]);
  const [currentRound, setCurrentRound] = useState(1);
  const [timerSeconds, setTimerSeconds] = useState<number | null>(null);
  const [lastScore, setLastScore] = useState<ScoreResult | null>(null);
  const [roundScores, setRoundScores] = useState<ScoreResult[]>([]);
  const [feasibility, setFeasibility] = useState<FeasibilityResult | undefined>();
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const round = rounds[currentRound];

  // Timer countdown
  useEffect(() => {
    if (phase === 'playing' && round) {
      setTimerSeconds(round.timerSeconds);
      timerRef.current = setInterval(() => {
        setTimerSeconds(prev => {
          if (prev === null || prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
  }, [phase, round]);

  const handleJoin = useCallback(() => {
    if (!roomCode.trim() || !playerName.trim()) return;
    // In demo mode, simulate joining: add self + a few AI players
    setPlayers([playerName, 'Demo Player 2', 'Demo Player 3']);
    setPhase('waiting');
    // Auto-start after a short wait (demo mode)
    setTimeout(() => setPhase('countdown'), 2000);
  }, [roomCode, playerName]);

  const handleCountdownComplete = useCallback(() => {
    setPhase('playing');
  }, []);

  const handleSubmit = useCallback(
    (submission: RouteSubmission[]) => {
      if (timerRef.current) clearInterval(timerRef.current);
      const score = scoreLocally(currentRound, submission);
      setLastScore(score);
      setRoundScores(prev => [...prev, score]);
      setPhase('result');
    },
    [currentRound],
  );

  const handleNextRound = useCallback(() => {
    const nextRound = currentRound + 1;
    if (nextRound > 3) {
      setFeasibility({
        isFeasible: false,
        totalDemand: 34,
        totalCapacity: 23,
        capacityShortfall: 11,
        theoreticalMinPenalty: 550,
        explanation:
          'Round 3 is intentionally infeasible! Total demand (34 units) exceeds total vehicle capacity (23 units). ' +
          'The best strategy is to skip the least valuable deliveries and minimize penalties. ' +
          'This mirrors real-world VRP where not all orders can always be fulfilled.',
      });
      setPhase('gameOver');
    } else {
      setCurrentRound(nextRound);
      setPhase('countdown');
    }
  }, [currentRound]);

  const handlePlayAgain = useCallback(() => {
    setPhase('join');
    setCurrentRound(1);
    setRoundScores([]);
    setLastScore(null);
    setTimerSeconds(null);
  }, []);

  const handleCodeChange = (value: string) => {
    setRoomCode(value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4));
  };

  // --- Render phases ---

  if (phase === 'waiting') {
    return <WaitingRoom roomCode={roomCode} playerName={playerName} players={players} />;
  }

  if (phase === 'countdown') {
    return <Countdown onComplete={handleCountdownComplete} />;
  }

  if (phase === 'playing' && round) {
    return <PlayScreen round={round} timerSeconds={timerSeconds} onSubmit={handleSubmit} />;
  }

  if (phase === 'result' && lastScore) {
    return (
      <RoundResult
        roundNumber={currentRound}
        score={lastScore}
        rank={1}
        totalPlayers={players.length}
        onContinue={handleNextRound}
      />
    );
  }

  if (phase === 'gameOver') {
    const allScores = [...roundScores];
    const totalScore = allScores.reduce((s, r) => s + r.totalScore, 0);
    const leaderboard: LeaderboardEntry[] = [
      { playerId: '1', playerName, totalScore, rank: 1 },
      { playerId: '2', playerName: 'Demo Player 2', totalScore: Math.round(totalScore * 0.85), rank: 2 },
      { playerId: '3', playerName: 'Demo Player 3', totalScore: Math.round(totalScore * 0.72), rank: 3 },
    ];

    return (
      <GameOver
        leaderboard={leaderboard}
        playerName={playerName}
        feasibility={feasibility}
        onPlayAgain={handlePlayAgain}
      />
    );
  }

  // Default: join form
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-4">
      <div className="text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-orange-500">PŘIPOJIT SE</h2>
        <p className="text-slate-500 mt-1 text-sm">Zadej kód místnosti od hostitele</p>
      </div>

      <div className="flex flex-col gap-4 w-full max-w-xs">
        <div>
          <label className="block text-slate-400 text-xs uppercase tracking-wider mb-1">
            Kód místnosti
          </label>
          <input
            type="text"
            value={roomCode}
            onChange={e => handleCodeChange(e.target.value)}
            placeholder="ABCD"
            maxLength={4}
            className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-center text-2xl tracking-[0.4em] text-slate-200 font-bold placeholder-slate-600 focus:outline-none focus:border-orange-500 transition-colors"
          />
        </div>

        <div>
          <label className="block text-slate-400 text-xs uppercase tracking-wider mb-1">
            Tvoje jméno
          </label>
          <input
            type="text"
            value={playerName}
            onChange={e => setPlayerName(e.target.value)}
            placeholder="Jméno dispečera"
            maxLength={20}
            className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-orange-500 transition-colors"
          />
        </div>

        <button
          onClick={handleJoin}
          disabled={roomCode.length < 4 || !playerName.trim()}
          className="bg-orange-500 hover:bg-orange-600 disabled:bg-slate-700 disabled:text-slate-500 text-white font-bold py-4 px-8 rounded-xl text-xl transition-colors"
        >
          PŘIPOJIT
        </button>
      </div>
    </div>
  );
}
