import { useState, useEffect } from 'react';
import type { RoundConfig } from '../types';

interface Props {
  round?: RoundConfig;
  onComplete: () => void;
}

const DEFAULT_INTRO_SECONDS: Record<number, number> = { 1: 11, 2: 18, 3: 18 };
const COUNT_STEPS = ['3', '2', '1', 'JEDEM!'];
const COUNT_STEP_MS = 750;
const COUNT_PHASE_SECONDS = 3; // 3-2-1 portion; the "JEDEM!" overlaps with round start

const roundIntros: Record<number, { emoji: string; objectives: string[]; tips: string[] }> = {
  1: {
    emoji: '🚚',
    objectives: [
      'Máš jeden kamion s neomezenou kapacitou',
      'Na mapě je 15 zastávek — navštiv všechny',
      'Klikni na zastávku a přidej ji do trasy',
      'Nižší celková vzdálenost = lepší skóre',
    ],
    tips: [
      '💡 Nenavštívená zastávka = 1000 trestných bodů!',
    ],
  },
  2: {
    emoji: '⚡',
    objectives: [
      'Teď máš 4 kamiony — přepínej mezi nimi dole',
      'Každý kamion uveze max 20 jednotek',
      'Číslo pod zastávkou = kolik jednotek chce zákazník',
      'Přetížení kamionu = 50 trestných bodů za každou jednotku navíc',
    ],
    tips: [
      '🌅 Ranní okno — zákazník musí být v první polovině trasy',
      '🌙 Odpolední okno — zákazník musí být v druhé polovině trasy',
      '⚠️ Porušení časového okna = 80 trestných bodů',
    ],
  },
  3: {
    emoji: '🔥',
    objectives: [
      '30 zákazníků — přibyli urgentní objednávky 🆘',
      'Kapacita kamionů je snížená (15, 20, 20, 15)',
      'Zácpa 🚧 na trase Zlín–Otrokovice zdvojnásobuje vzdálenost',
      'Stihneš obsloužit všechny? Nebo je lepší někoho vynechat?',
    ],
    tips: [
      '💡 Někdy nejde obsloužit všechny — dispečer hledá nejlepší kompromis',
    ],
  },
};

export default function Countdown({ round, onComplete }: Props) {
  const roundNumber = round?.roundNumber ?? 1;
  const totalIntroSeconds = Math.max(
    COUNT_PHASE_SECONDS + 1,
    round?.introSeconds ?? DEFAULT_INTRO_SECONDS[roundNumber] ?? 11,
  );
  const objectivesSeconds = totalIntroSeconds - COUNT_PHASE_SECONDS;

  const [phase, setPhase] = useState<'intro' | 'count'>('intro');
  const [countStep, setCountStep] = useState(0);
  const [remainingSec, setRemainingSec] = useState(totalIntroSeconds);
  const intro = roundIntros[roundNumber] ?? roundIntros[1];

  // Live tick during objectives phase → transitions to count phase when 3s remain
  useEffect(() => {
    if (phase !== 'intro') return;
    if (remainingSec <= COUNT_PHASE_SECONDS) {
      setPhase('count');
      setCountStep(0);
      return;
    }
    const t = setTimeout(() => setRemainingSec(r => r - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, remainingSec]);

  // Count steps
  useEffect(() => {
    if (phase !== 'count') return;

    if (countStep < COUNT_STEPS.length - 1) {
      const timer = setTimeout(() => setCountStep(s => s + 1), COUNT_STEP_MS);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(onComplete, COUNT_STEP_MS);
      return () => clearTimeout(timer);
    }
  }, [phase, countStep, onComplete]);

  if (phase === 'intro') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-5 p-6 animate-fadeIn">
        <div className="text-6xl">{intro.emoji}</div>
        <div className="text-center">
          <p className="text-slate-500 uppercase tracking-widest text-sm mb-2">Kolo {roundNumber}</p>
          <h2 className="text-3xl md:text-4xl font-bold text-orange-500">
            {round?.title ?? ''}
          </h2>
        </div>

        <div className="bg-slate-800 rounded-xl p-5 w-full max-w-md space-y-3">
          {intro.objectives.map((obj, i) => (
            <div key={i} className="flex items-start gap-3 text-sm animate-fadeIn"
              style={{ animationDelay: `${i * 400}ms`, animationFillMode: 'both' }}>
              <span className="text-orange-500 mt-0.5">▸</span>
              <span className="text-slate-300">{obj}</span>
            </div>
          ))}
        </div>

        {intro.tips.length > 0 && (
          <div className="w-full max-w-md space-y-2 animate-fadeIn"
            style={{ animationDelay: `${intro.objectives.length * 400 + 500}ms`, animationFillMode: 'both' }}>
            {intro.tips.map((tip, i) => (
              <div key={i} className="bg-slate-800/60 border border-slate-700 rounded-lg px-4 py-2 text-sm text-slate-400">
                {tip}
              </div>
            ))}
          </div>
        )}

        <p className="text-slate-400 text-base">
          Kolo začíná za{' '}
          <span className="text-orange-500 font-bold text-xl tabular-nums">{remainingSec}</span> s
        </p>
        <div className="text-slate-600 text-xs">
          Celkem {objectivesSeconds}s na přečtení, pak odstartujeme
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <span
        key={countStep}
        className={`font-bold select-none animate-countdown ${
          countStep === COUNT_STEPS.length - 1
            ? 'text-5xl md:text-7xl text-orange-500'
            : 'text-8xl md:text-[10rem] text-slate-200'
        }`}
      >
        {COUNT_STEPS[countStep]}
      </span>
    </div>
  );
}
