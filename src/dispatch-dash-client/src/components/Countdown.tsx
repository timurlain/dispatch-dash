import { useState, useEffect } from 'react';

interface Props {
  onComplete: () => void;
}

const STEPS = ['3', '2', '1', 'DISPATCH!'];
const STEP_MS = 900;

export default function Countdown({ onComplete }: Props) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (step < STEPS.length - 1) {
      const timer = setTimeout(() => setStep(s => s + 1), STEP_MS);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(onComplete, STEP_MS);
      return () => clearTimeout(timer);
    }
  }, [step, onComplete]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <span
        key={step}
        className={`font-bold select-none animate-countdown ${
          step === STEPS.length - 1
            ? 'text-6xl md:text-8xl text-orange-500'
            : 'text-8xl md:text-[10rem] text-slate-200'
        }`}
      >
        {STEPS[step]}
      </span>
    </div>
  );
}
