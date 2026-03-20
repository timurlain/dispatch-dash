interface Props {
  roomCode: string;
  playerName: string;
  players: string[];
}

export default function WaitingRoom({ roomCode, playerName, players }: Props) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-4">
      <div className="text-center">
        <p className="text-slate-500 text-sm uppercase tracking-widest">Room Code</p>
        <p className="text-4xl md:text-6xl font-bold text-orange-500 tracking-[0.3em] mt-1">
          {roomCode}
        </p>
      </div>

      <div className="bg-slate-800 rounded-xl p-6 w-full max-w-sm">
        <p className="text-slate-400 text-sm uppercase tracking-wider mb-3">
          Players ({players.length})
        </p>
        <ul className="space-y-2">
          {players.map((name, i) => (
            <li
              key={i}
              className={`flex items-center gap-2 py-2 px-3 rounded-lg ${
                name === playerName ? 'bg-slate-700 text-orange-400' : 'text-slate-300'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
              {name}
              {name === playerName && (
                <span className="text-xs text-slate-500 ml-auto">(you)</span>
              )}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex items-center gap-2 text-slate-500">
        <span className="inline-block w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
        Waiting for host to start...
      </div>
    </div>
  );
}
