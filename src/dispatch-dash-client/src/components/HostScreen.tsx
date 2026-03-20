import { useState, useEffect, useCallback } from 'react';
import { useSignalR } from '../hooks/useSignalR';
import Leaderboard from './Leaderboard';
import InfeasibilityReveal from './InfeasibilityReveal';

const WHAT_CHANGED: Record<number, { title: string; bullets: string[] }> = {
  2: {
    title: 'ROUND 2 — Welcome to Reality',
    bullets: [
      '4 trucks with capacity limits (20 units each)',
      'Time windows: some customers need morning or afternoon delivery',
      'You must split customers across vehicles wisely',
    ],
  },
  3: {
    title: 'ROUND 3 — A Typical Monday',
    bullets: [
      'Rush order incoming! A new customer appeared in Frenstat',
      'Traffic jam on the Zlin-Otrokovice corridor (2x travel cost)',
      'Reduced fleet capacity — trucks carry less',
      'Can you serve everyone? ...or is that even possible?',
    ],
  },
};

export default function HostScreen() {
  const {
    connected,
    playerCount,
    round,
    timer,
    leaderboard,
    gameOver,
    feasibility,
    submissionCount,
    joinAsHost,
    startRound,
  } = useSignalR();

  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastCompletedRound, setLastCompletedRound] = useState(0);
  const [showingWhatChanged, setShowingWhatChanged] = useState(false);

  // Track when rounds complete (results come in, timer stops)
  useEffect(() => {
    if (round && timer === null && lastCompletedRound < round.roundNumber) {
      setLastCompletedRound(round.roundNumber);
    }
  }, [round, timer, lastCompletedRound]);

  // Create game on mount
  useEffect(() => {
    if (!connected) return;

    fetch('/api/game/create', { method: 'POST' })
      .then(res => {
        if (!res.ok) throw new Error('Failed to create game');
        return res.json();
      })
      .then((data: { roomCode: string }) => {
        setRoomCode(data.roomCode);
        joinAsHost(data.roomCode);
      })
      .catch(err => setError(err.message));
  }, [connected, joinAsHost]);

  const handleStartRound = useCallback(() => {
    if (!roomCode) return;
    setShowingWhatChanged(false);
    startRound(roomCode);
  }, [roomCode, startRound]);

  const handleShowWhatChanged = useCallback((roundNum: number) => {
    if (WHAT_CHANGED[roundNum]) {
      setShowingWhatChanged(true);
    }
  }, []);

  const joinUrl = roomCode
    ? `${window.location.origin}/join/${roomCode}`
    : '';

  const nextRound = lastCompletedRound + 1;
  const isPlaying = round !== null && timer !== null && !gameOver;
  const isShowingResults = round !== null && timer === null && !gameOver && lastCompletedRound > 0;
  // Default fall-through is the lobby state (no round, not game over)

  // --- Connecting ---
  if (!connected || !roomCode) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        {error ? (
          <p className="text-red-400 text-xl">{error}</p>
        ) : (
          <p className="text-slate-500 text-xl animate-pulse">Creating game...</p>
        )}
      </div>
    );
  }

  // --- Game Over ---
  if (gameOver) {
    return (
      <div className="h-screen flex flex-col bg-slate-900 p-6 overflow-auto">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <span className="text-slate-500 text-sm uppercase tracking-widest">Room</span>
            <span className="text-orange-500 font-bold text-2xl ml-3 tracking-[0.2em]">{roomCode}</span>
          </div>
          <h1 className="text-4xl font-bold text-orange-500">GAME OVER</h1>
          <div className="text-slate-500 text-sm">{playerCount} players</div>
        </div>

        <div className="flex-1 grid grid-cols-2 gap-6 max-w-7xl mx-auto w-full">
          {/* Left: Final leaderboard */}
          <div className="bg-slate-800/50 rounded-xl p-6">
            <Leaderboard entries={leaderboard} title="FINAL STANDINGS" />
          </div>

          {/* Right: Infeasibility reveal */}
          <div className="flex flex-col justify-center">
            {feasibility && !feasibility.isFeasible ? (
              <InfeasibilityReveal feasibility={feasibility} />
            ) : (
              <div className="bg-slate-800/50 rounded-xl p-6 text-center">
                <h2 className="text-3xl font-bold text-green-400 mb-4">ALL ROUNDS FEASIBLE</h2>
                <p className="text-slate-400">Every round had a valid solution. Well played!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // --- Playing a round ---
  if (isPlaying && round) {
    const timerMin = Math.floor((timer ?? 0) / 60);
    const timerSec = (timer ?? 0) % 60;
    const timerLow = (timer ?? 0) <= 15;

    return (
      <div className="h-screen flex flex-col bg-slate-900">
        {/* Top bar */}
        <div className="bg-slate-800 border-b border-slate-700 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div>
              <span className="text-slate-500 text-xs uppercase tracking-widest">Room</span>
              <span className="text-orange-500 font-bold text-lg ml-2 tracking-[0.2em]">{roomCode}</span>
            </div>
            <div className="h-6 w-px bg-slate-700" />
            <div>
              <span className="text-orange-500 font-bold text-lg">Round {round.roundNumber}</span>
              <span className="text-slate-500 mx-2">|</span>
              <span className="text-slate-300">{round.title}</span>
            </div>
          </div>

          <div className={`text-4xl font-bold font-mono ${timerLow ? 'text-red-400 animate-pulse' : 'text-slate-200'}`}>
            {timerMin}:{String(timerSec).padStart(2, '0')}
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="text-slate-500 text-xs uppercase">Submissions</div>
              <div className="text-cyan-400 font-bold text-lg">{submissionCount} / {playerCount}</div>
            </div>
            <div className="text-right">
              <div className="text-slate-500 text-xs uppercase">Players</div>
              <div className="text-slate-300 font-bold text-lg">{playerCount}</div>
            </div>
          </div>
        </div>

        {/* Main area */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center space-y-6">
            <div className="text-slate-500 uppercase tracking-widest text-sm">Round in progress</div>
            <div className="text-slate-400 text-lg max-w-xl mx-auto">{round.description}</div>
            <div className="grid grid-cols-3 gap-6 mt-8">
              <div className="bg-slate-800 rounded-xl p-6">
                <div className="text-3xl font-bold text-slate-200">{round.customers.length}</div>
                <div className="text-slate-500 text-sm mt-1">Customers</div>
              </div>
              <div className="bg-slate-800 rounded-xl p-6">
                <div className="text-3xl font-bold text-slate-200">{round.vehicles.length}</div>
                <div className="text-slate-500 text-sm mt-1">Vehicles</div>
              </div>
              <div className="bg-slate-800 rounded-xl p-6">
                <div className="text-3xl font-bold text-slate-200">
                  {round.trafficSegments.length > 0 ? 'Yes' : 'No'}
                </div>
                <div className="text-slate-500 text-sm mt-1">Traffic jams</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- Between rounds (showing results / leaderboard) ---
  if (isShowingResults) {
    return (
      <div className="h-screen flex flex-col bg-slate-900 p-6 overflow-auto">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <span className="text-slate-500 text-sm uppercase tracking-widest">Room</span>
            <span className="text-orange-500 font-bold text-2xl ml-3 tracking-[0.2em]">{roomCode}</span>
          </div>
          <div className="text-slate-500 text-sm">{playerCount} players</div>
        </div>

        <div className="flex-1 grid grid-cols-2 gap-6 max-w-7xl mx-auto w-full">
          {/* Left: Leaderboard */}
          <div className="bg-slate-800/50 rounded-xl p-6">
            <Leaderboard
              entries={leaderboard}
              title={`AFTER ROUND ${lastCompletedRound}`}
            />
          </div>

          {/* Right: What Changed card or Start button */}
          <div className="flex flex-col justify-center items-center gap-6">
            {showingWhatChanged && WHAT_CHANGED[nextRound] ? (
              <div className="bg-slate-800 border border-orange-500/30 rounded-xl p-6 w-full space-y-4">
                <h3 className="text-xl font-bold text-orange-500">
                  {WHAT_CHANGED[nextRound].title}
                </h3>
                <ul className="space-y-2">
                  {WHAT_CHANGED[nextRound].bullets.map((b, i) => (
                    <li key={i} className="flex items-start gap-2 text-slate-300">
                      <span className="text-orange-500 mt-0.5">&#x25B6;</span>
                      {b}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={handleStartRound}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 px-8 rounded-xl text-xl transition-colors mt-4"
                >
                  START ROUND {nextRound}
                </button>
              </div>
            ) : nextRound <= 3 ? (
              <div className="text-center space-y-4">
                <button
                  onClick={() => handleShowWhatChanged(nextRound)}
                  className="bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 font-bold py-4 px-8 rounded-xl text-lg transition-colors"
                >
                  WHAT CHANGED?
                </button>
                <div className="text-slate-600 text-sm">or</div>
                <button
                  onClick={handleStartRound}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 px-8 rounded-xl text-xl transition-colors"
                >
                  START ROUND {nextRound}
                </button>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-slate-500 text-lg">All rounds completed!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // --- Lobby (waiting for players) ---
  return (
    <div className="h-screen flex flex-col bg-slate-900">
      {/* Top bar */}
      <div className="bg-slate-800 border-b border-slate-700 px-6 py-4 flex items-center justify-center">
        <h1 className="text-3xl font-bold text-orange-500 tracking-tight">DISPATCH DASH</h1>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center gap-8 p-8">
        {/* Room code */}
        <div className="text-center">
          <p className="text-slate-500 text-sm uppercase tracking-widest mb-2">Join at</p>
          <p className="text-slate-400 text-lg mb-4 break-all">{joinUrl}</p>
          <p className="text-slate-500 text-sm uppercase tracking-widest mb-2">Room Code</p>
          <p className="text-7xl md:text-9xl font-bold text-orange-500 tracking-[0.3em] select-all">
            {roomCode}
          </p>
        </div>

        {/* Player count */}
        <div className="bg-slate-800 rounded-xl px-8 py-4 text-center">
          <span className="text-5xl font-bold text-slate-200">{playerCount}</span>
          <span className="text-slate-500 text-xl ml-3">
            player{playerCount !== 1 ? 's' : ''} connected
          </span>
        </div>

        {/* Start button */}
        <button
          onClick={handleStartRound}
          disabled={playerCount === 0}
          className={`font-bold py-4 px-12 rounded-xl text-2xl transition-colors ${
            playerCount > 0
              ? 'bg-orange-500 hover:bg-orange-600 text-white'
              : 'bg-slate-700 text-slate-500 cursor-not-allowed'
          }`}
        >
          START ROUND 1
        </button>

        {playerCount === 0 && (
          <p className="text-slate-600 text-sm">Waiting for players to join...</p>
        )}
      </div>
    </div>
  );
}
