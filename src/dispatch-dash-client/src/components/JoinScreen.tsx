import { useState, useCallback, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import type { RouteSubmission, ScoreResult } from '../types';
import { useSignalR } from '../hooks/useSignalR';
import WaitingRoom from './WaitingRoom';
import Countdown from './Countdown';
import PlayScreen from './PlayScreen';
import RoundResult from './RoundResult';
import GameOver from './GameOver';

type Phase = 'join' | 'waiting' | 'countdown' | 'playing' | 'result' | 'gameOver';

export default function JoinScreen() {
  const { code: urlCode } = useParams<{ code?: string }>();
  const signalR = useSignalR();

  const [phase, setPhase] = useState<Phase>('join');
  const [roomCode, setRoomCode] = useState(urlCode?.toUpperCase() ?? '');
  const [name, setName] = useState('');
  const [currentRound, setCurrentRound] = useState(0);
  const [lastScore, setLastScore] = useState<ScoreResult | null>(null);
  const [lastRank, setLastRank] = useState(1);

  // RoundStarting → transition to countdown
  useEffect(() => {
    if (signalR.round && phase !== 'playing' && phase !== 'gameOver') {
      setCurrentRound(signalR.round.roundNumber);
      setPhase('countdown');
    }
  }, [signalR.round]);

  // RoundEnded → transition to result
  useEffect(() => {
    if (signalR.results && signalR.playerId) {
      const myResult = signalR.results.find(r => r.playerId === signalR.playerId);
      if (myResult) {
        setLastScore({
          distanceScore: myResult.distanceScore ?? 0,
          penaltyScore: myResult.penaltyScore ?? 0,
          totalScore: myResult.score ?? 0,
          rawDistanceKm: 0,
          capacityPenalty: myResult.capacityPenalty ?? 0,
          timeWindowPenalty: myResult.timeWindowPenalty ?? 0,
          unvisitedPenalty: myResult.unvisitedPenalty ?? 0,
        });
        setLastRank(myResult.rank ?? 1);
        setPhase('result');
      }
    }
  }, [signalR.results, signalR.playerId]);

  // GameOver → transition to game over
  useEffect(() => {
    if (signalR.gameOver) {
      setPhase('gameOver');
    }
  }, [signalR.gameOver]);

  const handleJoin = useCallback(() => {
    if (!roomCode.trim() || !name.trim()) return;
    signalR.joinGame(roomCode, name);
    setPhase('waiting');
  }, [roomCode, name, signalR]);

  const handleCountdownComplete = useCallback(() => {
    setPhase('playing');
  }, []);

  const handleSubmit = useCallback(
    (submission: RouteSubmission[]) => {
      if (!signalR.playerId) {
        console.error('[DispatchDash] Cannot submit: playerId is null. SignalR state:', {
          connected: signalR.connected,
          playerId: signalR.playerId,
        });
        return;
      }
      signalR.submitSolution(roomCode, signalR.playerId, submission);
    },
    [roomCode, signalR],
  );

  const handleNextRound = useCallback(() => {
    // Wait for host to start next round — go back to waiting
    setPhase('waiting');
  }, []);

  const handlePlayAgain = useCallback(() => {
    setPhase('join');
    setCurrentRound(0);
    setLastScore(null);
  }, []);

  const handleCodeChange = (value: string) => {
    setRoomCode(value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4));
  };

  // --- Render phases ---

  if (phase === 'waiting') {
    return <WaitingRoom roomCode={roomCode} playerName={name} players={signalR.playerNames} />;
  }

  if (phase === 'countdown') {
    return <Countdown onComplete={handleCountdownComplete} />;
  }

  if (phase === 'playing' && signalR.round) {
    return (
      <PlayScreen
        round={signalR.round}
        timerSeconds={signalR.timer}
        onSubmit={handleSubmit}
      />
    );
  }

  if (phase === 'result' && lastScore) {
    return (
      <RoundResult
        roundNumber={currentRound}
        score={lastScore}
        rank={lastRank}
        totalPlayers={signalR.playerCount || signalR.playerNames.length}
        onContinue={currentRound < 3 ? handleNextRound : undefined}
      />
    );
  }

  if (phase === 'gameOver') {
    return (
      <GameOver
        leaderboard={signalR.leaderboard}
        playerName={name}
        feasibility={signalR.feasibility ?? undefined}
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
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Jméno dispečera"
            maxLength={20}
            className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-orange-500 transition-colors"
          />
        </div>

        <button
          onClick={handleJoin}
          disabled={roomCode.length < 4 || !name.trim() || !signalR.connected}
          className="bg-orange-500 hover:bg-orange-600 disabled:bg-slate-700 disabled:text-slate-500 text-white font-bold py-4 px-8 rounded-xl text-xl transition-colors"
        >
          {signalR.connected ? 'PŘIPOJIT' : 'PŘIPOJOVÁNÍ...'}
        </button>
      </div>
    </div>
  );
}
