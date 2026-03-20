import type { RoundConfig } from '../types';
import VehicleSelector from './VehicleSelector';

interface Props {
  round: RoundConfig;
  activeVehicleId: string;
  totalVisited: number;
  getVehicleLoad: (id: string) => number;
  getVehicleDistance: (id: string) => number;
  onSelectVehicle: (id: string) => void;
  onSubmit: () => void;
  onClear: () => void;
  timerSeconds: number | null;
}

export default function BottomBar({
  round, activeVehicleId, totalVisited,
  getVehicleLoad, getVehicleDistance, onSelectVehicle, onSubmit, onClear, timerSeconds,
}: Props) {
  const distance = getVehicleDistance(activeVehicleId);

  return (
    <div className="bg-slate-800 border-t border-slate-700 p-3 space-y-2">
      <VehicleSelector
        vehicles={round.vehicles}
        activeVehicleId={activeVehicleId}
        getLoad={getVehicleLoad}
        onSelect={onSelectVehicle}
      />
      <div className="flex items-center justify-between">
        <div className="flex gap-4 text-sm text-slate-400">
          <span>{'\uD83D\uDCCD'} {totalVisited}/{round.customers.length}</span>
          <span>{'\uD83D\uDCCF'} {distance} b.</span>
        </div>
        {timerSeconds !== null && (
          <span className={`text-sm font-bold ${timerSeconds <= 15 ? 'text-red-400 animate-pulse' : 'text-slate-400'}`}>
            {'\u23F1'} {Math.floor(timerSeconds / 60)}:{String(timerSeconds % 60).padStart(2, '0')}
          </span>
        )}
        <div className="flex gap-2">
          <button
            onClick={onClear}
            className="bg-slate-700 hover:bg-slate-600 text-slate-300 font-bold py-2 px-4 rounded-lg transition-colors border border-slate-600"
          >
            VYMAZAT
          </button>
          <button
            onClick={onSubmit}
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-6 rounded-lg transition-colors"
          >
            ODESLAT
          </button>
        </div>
      </div>
    </div>
  );
}
