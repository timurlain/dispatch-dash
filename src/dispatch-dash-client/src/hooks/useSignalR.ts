import { useEffect, useRef, useState, useCallback } from 'react';
import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import type { HubConnection } from '@microsoft/signalr';
import type { RoundConfig, RouteSubmission, LeaderboardEntry, FeasibilityResult } from '../types';

export interface RoundResult {
  playerId: string;
  score?: number;
  distanceScore?: number;
  penaltyScore?: number;
  capacityPenalty?: number;
  timeWindowPenalty?: number;
  unvisitedPenalty?: number;
  rank?: number;
}

export function useSignalR() {
  const connectionRef = useRef<HubConnection | null>(null);
  const [connected, setConnected] = useState(false);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [playerName, setPlayerName] = useState<string | null>(null);
  const [playerCount, setPlayerCount] = useState(0);
  const [playerNames, setPlayerNames] = useState<string[]>([]);
  const [round, setRound] = useState<RoundConfig | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [timer, setTimer] = useState<number | null>(null);
  const [results, setResults] = useState<RoundResult[] | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [feasibility, setFeasibility] = useState<FeasibilityResult | null>(null);
  const [submissionCount, setSubmissionCount] = useState(0);

  useEffect(() => {
    const conn = new HubConnectionBuilder()
      .withUrl('/hub/game')
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Warning)
      .build();

    conn.on('Joined', (id: string, name: string) => {
      setPlayerId(id);
      setPlayerName(name);
    });
    conn.on('PlayerJoined', (names: string[], count: number) => {
      setPlayerNames(names);
      setPlayerCount(count);
    });
    conn.on('RoundStarting', (config: RoundConfig, countdownSec: number) => {
      setRound(config);
      setCountdown(countdownSec);
      setResults(null);
      setTimer(config.timerSeconds);
      setSubmissionCount(0);
    });
    conn.on('TimerTick', (remaining: number) => setTimer(remaining));
    conn.on('RoundEnded', (subs: RoundResult[]) => {
      setResults(subs);
      setTimer(null);
    });
    conn.on('LeaderboardUpdate', (lb: LeaderboardEntry[]) => setLeaderboard(lb));
    conn.on('SubmissionReceived', (_playerName: string) =>
      setSubmissionCount(prev => prev + 1),
    );
    conn.on('GameOver', (lb: LeaderboardEntry[], feas: FeasibilityResult) => {
      setLeaderboard(lb);
      setFeasibility(feas);
      setGameOver(true);
    });
    conn.on('Error', (message: string) => {
      console.error('[SignalR] Server error:', message);
    });

    conn.start().then(() => setConnected(true));
    connectionRef.current = conn;

    return () => {
      conn.stop();
    };
  }, []);

  const joinGame = useCallback((roomCode: string, name: string) => {
    connectionRef.current?.invoke('JoinGame', roomCode, name);
  }, []);

  const joinAsHost = useCallback((roomCode: string) => {
    connectionRef.current?.invoke('JoinAsHost', roomCode);
  }, []);

  const startRound = useCallback((roomCode: string) => {
    connectionRef.current?.invoke('StartRound', roomCode);
  }, []);

  const submitSolution = useCallback(
    (roomCode: string, pid: string, routes: RouteSubmission[]) => {
      connectionRef.current?.invoke('SubmitSolution', roomCode, pid, routes);
    },
    [],
  );

  return {
    connected,
    playerId,
    playerName,
    playerCount,
    playerNames,
    round,
    countdown,
    timer,
    results,
    leaderboard,
    gameOver,
    feasibility,
    submissionCount,
    joinGame,
    joinAsHost,
    startRound,
    submitSolution,
  };
}
