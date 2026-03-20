import type { FeasibilityResult } from '../types';

interface Props {
  feasibility: FeasibilityResult;
}

export default function InfeasibilityReveal({ feasibility }: Props) {
  return (
    <div className="bg-red-900/30 border-2 border-red-500 rounded-xl p-6 space-y-4 animate-fadeIn" style={{ animationDelay: '300ms', animationFillMode: 'both' }}>
      <div className="flex items-center gap-3">
        <span className="text-4xl">&#x26A0;&#xFE0F;</span>
        <h2 className="text-2xl font-bold text-red-400">KOLO 3 NEBYLO ŘEŠITELNÉ</h2>
      </div>
      <p className="text-slate-300 leading-relaxed">
        Neexistovalo řešení, které obslouží všechny zákazníky bez porušení omezení.
      </p>
      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="bg-slate-800 rounded-lg p-3">
          <div className="text-2xl font-bold text-red-400">{feasibility.totalDemand}</div>
          <div className="text-xs text-slate-500">Celková poptávka</div>
        </div>
        <div className="bg-slate-800 rounded-lg p-3">
          <div className="text-2xl font-bold text-cyan-400">{feasibility.totalCapacity}</div>
          <div className="text-xs text-slate-500">Celková kapacita</div>
        </div>
        <div className="bg-slate-800 rounded-lg p-3">
          <div className="text-2xl font-bold text-yellow-400">{feasibility.capacityShortfall}</div>
          <div className="text-xs text-slate-500">Deficit</div>
        </div>
      </div>
      <p className="text-slate-400 text-sm italic">
        Nejlepší strategie byla záměrně vynechat 1–2 zákazníky s nízkou poptávkou,
        aby se předešlo kaskádě porušení kapacity a časových oken.
        <br/><br/>
        <strong className="text-orange-400">Tohle se v reálné logistice děje každý den.</strong>
        {' '}Urgentní objednávky, poruchy, zácpy, nemoc řidiče — úkolem dispečera není najít
        perfektní trasu. Je to najít nejlepší kompromis.
      </p>
      <div className="text-center text-slate-500 text-sm">
        Teoreticky nejlepší skóre: minimálně {Math.round(feasibility.theoreticalMinPenalty)} trestných bodů
      </div>
    </div>
  );
}
