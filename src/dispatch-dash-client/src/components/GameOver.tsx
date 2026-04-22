import { useEffect } from 'react';
import confetti from 'canvas-confetti';
import type { LeaderboardEntry, FeasibilityResult, ScoreResult } from '../types';
import InfeasibilityReveal from './InfeasibilityReveal';

interface Props {
  leaderboard: LeaderboardEntry[];
  playerName: string;
  feasibility?: FeasibilityResult;
  roundScores?: Record<number, ScoreResult>;
  onPlayAgain?: () => void;
}

const roundNames = ['', 'Pohodička', 'Vítejte v realitě', 'Typické pondělí'];

function rankBadge(rank: number): string {
  if (rank === 1) return 'bg-yellow-500/20 border-yellow-500 text-yellow-400';
  if (rank === 2) return 'bg-slate-400/10 border-slate-400 text-slate-300';
  if (rank === 3) return 'bg-orange-500/10 border-orange-500 text-orange-400';
  return 'bg-slate-800 border-slate-700 text-slate-400';
}

export default function GameOver({ leaderboard, playerName, feasibility, roundScores, onPlayAgain }: Props) {
  useEffect(() => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#FF6B35', '#00B4D8', '#22c55e'],
    });
  }, []);

  const hasRoundScores = roundScores && Object.keys(roundScores).length > 0;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-5 p-4 animate-fadeIn">
      <div className="text-center">
        <p className="text-slate-500 uppercase tracking-widest text-sm">Konec hry</p>
        <h2 className="text-3xl md:text-4xl font-bold text-orange-500 mt-2 animate-scaleIn">
          KONEČNÉ POŘADÍ
        </h2>
      </div>

      {/* Leaderboard */}
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
                {isMe && <span className="text-xs text-slate-500 ml-2">(ty)</span>}
              </span>
              <span className="font-bold text-lg">{Math.round(entry.totalScore)}</span>
            </div>
          );
        })}
      </div>

      {/* Per-round score breakdown */}
      {hasRoundScores && (
        <div className="bg-slate-800 rounded-xl p-4 w-full max-w-md">
          <h3 className="text-orange-500 font-bold text-sm mb-3">TVOJE BODY PO KOLECH</h3>
          <div className="space-y-3">
            {[1, 2, 3].map(rn => {
              const s = roundScores![rn];
              if (!s) return null;
              return (
                <div key={rn} className="bg-slate-900/50 rounded-lg p-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-slate-300 font-semibold text-sm">
                      Kolo {rn}: {roundNames[rn]}
                    </span>
                    <span className="text-orange-400 font-bold">{Math.round(s.totalScore)}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                    <span className="text-slate-500">Vzdálenost</span>
                    <span className="text-slate-400 text-right">{Math.round(s.distanceScore)}</span>
                    {s.capacityPenalty > 0 && (<>
                      <span className="text-slate-500">Kapacita</span>
                      <span className="text-red-400 text-right">+{Math.round(s.capacityPenalty)}</span>
                    </>)}
                    {s.timeWindowPenalty > 0 && (<>
                      <span className="text-slate-500">Časová okna</span>
                      <span className="text-red-400 text-right">+{Math.round(s.timeWindowPenalty)}</span>
                    </>)}
                    {s.unvisitedPenalty > 0 && (<>
                      <span className="text-slate-500">Nenavštívené</span>
                      <span className="text-red-400 text-right">+{Math.round(s.unvisitedPenalty)}</span>
                    </>)}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-3 pt-3 border-t border-slate-700 flex justify-between font-bold">
            <span className="text-slate-300">Celkem</span>
            <span className="text-orange-500 text-lg">
              {Math.round(Object.values(roundScores!).reduce((sum, s) => sum + s.totalScore, 0))}
            </span>
          </div>
        </div>
      )}

      {/* Feasibility reveal — show full card to player when infeasible */}
      {feasibility && !feasibility.isFeasible && (
        <div className="w-full max-w-md">
          <InfeasibilityReveal feasibility={feasibility} />
        </div>
      )}
      {feasibility && feasibility.isFeasible && (
        <div className="bg-slate-800 rounded-xl p-5 w-full max-w-md border border-slate-700">
          <h3 className="text-orange-500 font-bold mb-2">Toto kolo bylo řešitelné!</h3>
          <p className="text-slate-400 text-sm leading-relaxed">{feasibility.explanation}</p>
        </div>
      )}

      {onPlayAgain && (
        <button
          onClick={onPlayAgain}
          className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-xl transition-colors"
        >
          HRÁT ZNOVU
        </button>
      )}
    </div>
  );
}
