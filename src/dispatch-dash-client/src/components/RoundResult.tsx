import type { ScoreResult } from '../types';

interface Props {
  roundNumber: number;
  score: ScoreResult;
  rank: number;
  totalPlayers: number;
  onContinue?: () => void;
}

function rankLabel(rank: number): string {
  if (rank === 1) return '1.';
  if (rank === 2) return '2.';
  if (rank === 3) return '3.';
  return `${rank}.`;
}

function rankColor(rank: number): string {
  if (rank === 1) return 'text-yellow-400';
  if (rank === 2) return 'text-slate-300';
  if (rank === 3) return 'text-orange-400';
  return 'text-slate-400';
}

export default function RoundResult({ roundNumber, score, rank, totalPlayers, onContinue }: Props) {
  const rows: [string, number, boolean][] = [
    ['Vzdálenost', score.distanceScore, false],
    ['Penále za kapacitu', score.capacityPenalty, true],
    ['Penále za časová okna', score.timeWindowPenalty, true],
    ['Penále za nenavštívené', score.unvisitedPenalty, true],
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-4">
      <p className="text-slate-500 uppercase tracking-widest text-sm">
        Výsledek kola {roundNumber}
      </p>

      <div className={`text-6xl font-bold ${rankColor(rank)}`}>
        {rankLabel(rank)}
      </div>
      <p className="text-slate-500 text-sm -mt-4">
        z {totalPlayers} hráčů
      </p>

      <div className="bg-slate-800 rounded-xl p-6 w-full max-w-sm space-y-3">
        {rows.map(([label, value, isPenalty]) => (
          <div key={label} className="flex justify-between text-sm">
            <span className="text-slate-400">{label}</span>
            <span className={isPenalty && value > 0 ? 'text-red-400' : 'text-slate-200'}>
              {isPenalty && value > 0 ? `-${value}` : value}
            </span>
          </div>
        ))}
        <div className="border-t border-slate-700 pt-3 flex justify-between font-bold">
          <span className="text-slate-300">Celkem</span>
          <span className="text-orange-500 text-lg">{score.totalScore}</span>
        </div>
      </div>

      {onContinue && (
        <button
          onClick={onContinue}
          className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-xl transition-colors"
        >
          DALŠÍ KOLO
        </button>
      )}
    </div>
  );
}
