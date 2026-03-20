import { useState, useEffect, useRef } from 'react';
import type { RoundConfig } from '../types';
import { useGameState } from '../hooks/useGameState';
import GameMap from './GameMap';
import BottomBar from './BottomBar';

interface Props {
  round: RoundConfig;
  timerSeconds: number | null;
  onSubmit: (routes: { vehicleId: string; customerIds: string[] }[]) => void;
}

export default function PlayScreen({ round, timerSeconds, onSubmit }: Props) {
  const {
    routes,
    activeVehicleId,
    setActiveVehicleId,
    toggleCustomer,
    getVehicleLoad,
    getVehicleDistance,
    totalVisited,
    toSubmission,
    reset,
  } = useGameState(round);

  const [submitted, setSubmitted] = useState(false);

  // Local countdown timer — ticks every second, syncs with server ticks
  const [localTimer, setLocalTimer] = useState<number | null>(timerSeconds);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Sync with server timer when it changes
  useEffect(() => {
    if (timerSeconds !== null) {
      setLocalTimer(timerSeconds);
    }
  }, [timerSeconds]);

  // Local countdown every second
  useEffect(() => {
    if (localTimer === null) return;

    intervalRef.current = setInterval(() => {
      setLocalTimer(prev => {
        if (prev === null || prev <= 0) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [localTimer === null]); // only restart interval when timer starts/stops

  const handleSubmit = () => {
    if (submitted) return;
    setSubmitted(true);
    onSubmit(toSubmission());
  };

  // Auto-submit when timer hits 0
  useEffect(() => {
    if (localTimer === 0 && !submitted) {
      handleSubmit();
    }
  }, [localTimer, submitted]);

  return (
    <div className="h-screen flex flex-col">
      <div className="bg-slate-800 border-b border-slate-700 px-4 py-2 flex items-center justify-between">
        <div>
          <span className="text-orange-500 font-bold text-sm">Kolo {round.roundNumber}</span>
          <span className="text-slate-500 mx-2">|</span>
          <span className="text-slate-300 text-sm">{round.title}</span>
        </div>
        <p className="text-slate-500 text-xs hidden sm:block max-w-xs truncate">
          {round.description}
        </p>
      </div>
      <div className="flex-1 relative">
        <GameMap
          customers={round.customers}
          depot={round.depot}
          routes={routes}
          activeVehicleId={activeVehicleId}
          trafficSegments={round.trafficSegments}
          onCustomerClick={submitted ? () => {} : toggleCustomer}
        />
        {submitted && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50">
            <div className="bg-slate-800 rounded-xl p-6 text-center">
              <p className="text-2xl font-bold text-green-400">✓ Odesláno!</p>
              <p className="text-slate-400 mt-2">Čekáme na ostatní hráče...</p>
            </div>
          </div>
        )}
      </div>
      {!submitted && (
        <BottomBar
          round={round}
          activeVehicleId={activeVehicleId}
          totalVisited={totalVisited}
          getVehicleLoad={getVehicleLoad}
          getVehicleDistance={getVehicleDistance}
          onSelectVehicle={setActiveVehicleId}
          onSubmit={handleSubmit}
          onClear={reset}
          timerSeconds={localTimer}
        />
      )}
    </div>
  );
}
