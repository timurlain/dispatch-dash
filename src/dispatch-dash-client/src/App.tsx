import { BrowserRouter, Routes, Route } from 'react-router-dom';
import IntroScreen from './components/IntroScreen';
import JoinScreen from './components/JoinScreen';
import HostScreen from './components/HostScreen';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-900 text-slate-200 font-mono">
        <Routes>
          <Route path="/" element={<IntroScreen />} />
          <Route path="/join/:code?" element={<JoinScreen />} />
          <Route path="/host" element={<HostScreen />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
