import type { LeaderboardEntry } from '../types';

interface Props {
  entries: LeaderboardEntry[];
  title?: string;
}

export default function Leaderboard({ entries, title = 'ŽEBŘÍČEK' }: Props) {
  const maxScore = Math.max(...entries.map(e => e.totalScore), 1);

  return (
    <div className="space-y-2">
      <h2 className="text-xl font-bold text-orange-500">{title}</h2>
      {entries.map((entry, i) => (
        <div
          key={entry.playerId}
          className="flex items-center gap-3 animate-cascadeIn"
          style={{ animationDelay: `${i * 150}ms` }}
        >
          <span className={`text-2xl font-bold w-8 ${
            i === 0 ? 'text-yellow-400' : i === 1 ? 'text-slate-300' : i === 2 ? 'text-amber-600' : 'text-slate-500'
          }`}>
            {entry.rank}
          </span>
          <div className="flex-1">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-slate-200 font-semibold">{entry.playerName}</span>
              <span className="text-slate-400">{Math.round(entry.totalScore)} b.</span>
            </div>
            <div className="h-2 bg-slate-700 rounded-full">
              <div
                className="h-full bg-orange-500 rounded-full transition-all duration-1000"
                style={{ width: `${(entry.totalScore / maxScore) * 100}%` }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
