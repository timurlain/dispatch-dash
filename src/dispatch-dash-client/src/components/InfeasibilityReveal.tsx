import type { FeasibilityResult } from '../types';

interface Props {
  feasibility: FeasibilityResult;
}

export default function InfeasibilityReveal({ feasibility }: Props) {
  return (
    <div className="bg-red-900/30 border-2 border-red-500 rounded-xl p-6 space-y-4 animate-fadeIn" style={{ animationDelay: '300ms', animationFillMode: 'both' }}>
      <div className="flex items-center gap-3">
        <span className="text-4xl">&#x26A0;&#xFE0F;</span>
        <h2 className="text-2xl font-bold text-red-400">ROUND 3 WAS INFEASIBLE</h2>
      </div>
      <p className="text-slate-300 leading-relaxed">
        There was no solution that serves all customers without violating constraints.
      </p>
      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="bg-slate-800 rounded-lg p-3">
          <div className="text-2xl font-bold text-red-400">{feasibility.totalDemand}</div>
          <div className="text-xs text-slate-500">Total demand</div>
        </div>
        <div className="bg-slate-800 rounded-lg p-3">
          <div className="text-2xl font-bold text-cyan-400">{feasibility.totalCapacity}</div>
          <div className="text-xs text-slate-500">Total capacity</div>
        </div>
        <div className="bg-slate-800 rounded-lg p-3">
          <div className="text-2xl font-bold text-yellow-400">{feasibility.capacityShortfall}</div>
          <div className="text-xs text-slate-500">Shortfall</div>
        </div>
      </div>
      <p className="text-slate-400 text-sm italic">
        The best strategy was to deliberately skip 1-2 low-demand customers
        to avoid cascading capacity and time window violations.
        <br/><br/>
        <strong className="text-orange-400">This happens every day in real logistics.</strong>
        {' '}Rush orders, breakdowns, traffic, driver illness — the dispatcher's job
        isn't finding the perfect route. It's finding the best compromise.
      </p>
      <div className="text-center text-slate-500 text-sm">
        Theoretical best score: {Math.round(feasibility.theoreticalMinPenalty)} penalty points minimum
      </div>
    </div>
  );
}
