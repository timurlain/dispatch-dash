import { useEffect, useState } from 'react';

type Props = {
  roundNumber: number;
  defaultSeconds: number;
  onStart: (seconds: number) => void;
  onCancel: () => void;
};

const MIN_SECONDS = 30;
const MAX_SECONDS = 300;

export default function RoundTimerModal({
  roundNumber,
  defaultSeconds,
  onStart,
  onCancel,
}: Props) {
  const [seconds, setSeconds] = useState<number>(defaultSeconds);

  const isValid = seconds >= MIN_SECONDS && seconds <= MAX_SECONDS;

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
      } else if (e.key === 'Enter') {
        if (seconds >= MIN_SECONDS && seconds <= MAX_SECONDS) {
          e.preventDefault();
          onStart(seconds);
        }
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [seconds, onStart, onCancel]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Kolo ${roundNumber} — nastav čas`}
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
    >
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 w-full max-w-md shadow-2xl space-y-6">
        <h2 className="text-2xl font-bold text-orange-500">
          Kolo {roundNumber} — nastav čas
        </h2>

        <div className="space-y-2">
          <label
            htmlFor="round-timer-seconds"
            className="block text-slate-400 text-sm uppercase tracking-widest"
          >
            Čas v sekundách (30–300)
          </label>
          <input
            id="round-timer-seconds"
            type="number"
            min={MIN_SECONDS}
            max={MAX_SECONDS}
            value={Number.isNaN(seconds) ? '' : seconds}
            onChange={(e) => {
              const v = e.target.value;
              setSeconds(v === '' ? NaN : Number(v));
            }}
            autoFocus
            className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-2xl font-bold text-slate-100 focus:outline-none focus:border-orange-500 transition-colors"
          />
        </div>

        <div className="flex flex-col gap-3 pt-2">
          <button
            onClick={() => onStart(seconds)}
            disabled={!isValid}
            className={`w-full font-bold py-4 px-8 rounded-xl text-xl transition-colors ${
              isValid
                ? 'bg-orange-500 hover:bg-orange-600 text-white'
                : 'bg-slate-700 text-slate-500 cursor-not-allowed'
            }`}
          >
            Spustit kolo {roundNumber}
          </button>
          <button
            onClick={onCancel}
            className="w-full bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold py-3 px-8 rounded-xl text-lg transition-colors border border-slate-600"
          >
            Zrušit
          </button>
        </div>
      </div>
    </div>
  );
}
