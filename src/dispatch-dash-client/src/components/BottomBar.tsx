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
  timerSeconds: number | null;
}

export default function BottomBar({
  round, activeVehicleId, totalVisited,
  getVehicleLoad, getVehicleDistance, onSelectVehicle, onSubmit, timerSeconds,
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
          <span>{'\uD83D\uDCCF'} {distance} pts</span>
        </div>
        {timerSeconds !== null && (
          <span className={`text-sm font-bold ${timerSeconds <= 15 ? 'text-red-400 animate-pulse' : 'text-slate-400'}`}>
            {'\u23F1'} {Math.floor(timerSeconds / 60)}:{String(timerSeconds % 60).padStart(2, '0')}
          </span>
        )}
        <button
          onClick={onSubmit}
          className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-6 rounded-lg transition-colors"
        >
          SUBMIT
        </button>
      </div>
    </div>
  );
}
