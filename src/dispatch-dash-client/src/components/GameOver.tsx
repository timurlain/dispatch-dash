import type { LeaderboardEntry, FeasibilityResult } from '../types';

interface Props {
  leaderboard: LeaderboardEntry[];
  playerName: string;
  feasibility?: FeasibilityResult;
  onPlayAgain?: () => void;
}

function rankBadge(rank: number): string {
  if (rank === 1) return 'bg-yellow-500/20 border-yellow-500 text-yellow-400';
  if (rank === 2) return 'bg-slate-400/10 border-slate-400 text-slate-300';
  if (rank === 3) return 'bg-orange-500/10 border-orange-500 text-orange-400';
  return 'bg-slate-800 border-slate-700 text-slate-400';
}

export default function GameOver({ leaderboard, playerName, feasibility, onPlayAgain }: Props) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-4">
      <div className="text-center">
        <p className="text-slate-500 uppercase tracking-widest text-sm">Game Over</p>
        <h2 className="text-4xl md:text-5xl font-bold text-orange-500 mt-2">
          FINAL STANDINGS
        </h2>
      </div>

      <div className="bg-slate-800 rounded-xl p-4 w-full max-w-md space-y-2">
        {leaderboard.map((entry) => {
          const isMe = entry.playerName === playerName;
          return (
            <div
              key={entry.playerId}
              className={`flex items-center gap-3 p-3 rounded-lg border ${rankBadge(entry.rank)} ${
                isMe ? 'ring-2 ring-orange-500/50' : ''
              }`}
            >
              <span className="text-2xl font-bold w-8 text-center">{entry.rank}</span>
              <span className={`flex-1 ${isMe ? 'text-orange-400 font-bold' : 'text-slate-200'}`}>
                {entry.playerName}
                {isMe && <span className="text-xs text-slate-500 ml-2">(you)</span>}
              </span>
              <span className="font-bold text-lg">{entry.totalScore}</span>
            </div>
          );
        })}
      </div>

      {feasibility && (
        <div className="bg-slate-800 rounded-xl p-5 w-full max-w-md border border-slate-700">
          <h3 className="text-orange-500 font-bold mb-2">
            {feasibility.isFeasible ? 'This round was feasible!' : 'Wait... was this even solvable?'}
          </h3>
          <p className="text-slate-400 text-sm leading-relaxed">{feasibility.explanation}</p>
          {!feasibility.isFeasible && (
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <div className="text-slate-500">Total demand</div>
              <div className="text-slate-300">{feasibility.totalDemand} units</div>
              <div className="text-slate-500">Total capacity</div>
              <div className="text-slate-300">{feasibility.totalCapacity} units</div>
              <div className="text-slate-500">Shortfall</div>
              <div className="text-red-400">{feasibility.capacityShortfall} units</div>
            </div>
          )}
        </div>
      )}

      {onPlayAgain && (
        <button
          onClick={onPlayAgain}
          className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-xl transition-colors"
        >
          PLAY AGAIN
        </button>
      )}
    </div>
  );
}
