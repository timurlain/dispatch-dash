import type { Vehicle } from '../types';
import { VEHICLE_COLORS } from '../lib/mapHelpers';

interface Props {
  vehicles: Vehicle[];
  activeVehicleId: string;
  getLoad: (id: string) => number;
  onSelect: (id: string) => void;
}

export default function VehicleSelector({ vehicles, activeVehicleId, getLoad, onSelect }: Props) {
  if (vehicles.length <= 1) return null;

  return (
    <div className="flex gap-2">
      {vehicles.map((v, i) => {
        const load = getLoad(v.id);
        const pct = v.capacity === Infinity ? 0 : Math.min(100, (load / v.capacity) * 100);
        const overloaded = v.capacity !== Infinity && load > v.capacity;
        const isActive = v.id === activeVehicleId;

        return (
          <button
            key={v.id}
            onClick={() => onSelect(v.id)}
            className={`flex-1 rounded-lg p-2 border-2 transition-all ${
              isActive ? 'border-opacity-100' : 'border-opacity-30'
            }`}
            style={{ borderColor: VEHICLE_COLORS[i % VEHICLE_COLORS.length] }}
          >
            <div className="text-xs text-slate-400">Kamion {i + 1}</div>
            <div className="h-1.5 bg-slate-700 rounded-full mt-1">
              <div
                className={`h-full rounded-full transition-all ${overloaded ? 'bg-red-500' : 'bg-green-500'}`}
                style={{ width: `${Math.min(100, pct)}%` }}
              />
            </div>
            <div className={`text-xs mt-0.5 ${overloaded ? 'text-red-400' : 'text-slate-500'}`}>
              {load}/{v.capacity === Infinity ? '\u221E' : v.capacity}
            </div>
          </button>
        );
      })}
    </div>
  );
}
