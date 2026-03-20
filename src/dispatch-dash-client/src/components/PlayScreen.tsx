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
  } = useGameState(round);

  const handleSubmit = () => {
    onSubmit(toSubmission());
  };

  return (
    <div className="h-screen flex flex-col">
      <div className="bg-slate-800 border-b border-slate-700 px-4 py-2 flex items-center justify-between">
        <div>
          <span className="text-orange-500 font-bold text-sm">Round {round.roundNumber}</span>
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
          onCustomerClick={toggleCustomer}
        />
      </div>
      <BottomBar
        round={round}
        activeVehicleId={activeVehicleId}
        totalVisited={totalVisited}
        getVehicleLoad={getVehicleLoad}
        getVehicleDistance={getVehicleDistance}
        onSelectVehicle={setActiveVehicleId}
        onSubmit={handleSubmit}
        timerSeconds={timerSeconds}
      />
    </div>
  );
}
