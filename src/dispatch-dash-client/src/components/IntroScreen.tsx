import { useNavigate } from 'react-router-dom';

export default function IntroScreen() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-8 p-4">
      <div className="text-center">
        <h1 className="text-5xl md:text-7xl font-bold text-orange-500 tracking-tight">
          DISPATCH DASH
        </h1>
        <p className="text-slate-400 mt-2 text-lg">Výzva pro dispečery</p>
      </div>
      <div className="flex flex-col gap-4 w-full max-w-xs">
        <button
          onClick={() => navigate('/host')}
          className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 px-8 rounded-xl text-xl transition-colors"
        >
          VYTVOŘIT HRU
        </button>
        <button
          onClick={() => navigate('/join')}
          className="bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold py-4 px-8 rounded-xl text-xl transition-colors border border-slate-600"
        >
          PŘIPOJIT SE
        </button>
      </div>
    </div>
  );
}
