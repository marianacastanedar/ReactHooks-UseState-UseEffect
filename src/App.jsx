import { useState, useEffect, useRef } from 'react';

const WORK_TIME = 1500;
const BREAK_TIME = 300;

function Pomodoro() {
  const [timeLeft, setTimeLeft] = useState(WORK_TIME);
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState('work');
  const [sessions, setSessions] = useState([]);
  const intervalRef = useRef(null);

  // cuenta regresiva
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    }

    return () => clearInterval(intervalRef.current);
  }, [isRunning, timeLeft]);

  // cambio de modo cuando es 0
  useEffect(() => {
    if (timeLeft !== 0) return;

    if (mode === 'work') {
      setSessions(prev => [
        ...prev,
        { id: Date.now(), type: 'work', duration: WORK_TIME, completedAt: new Date() },
      ]);
    }

    const nextMode = mode === 'work' ? 'break' : 'work';
    setMode(nextMode);
    setTimeLeft(nextMode === 'work' ? WORK_TIME : BREAK_TIME);
    setIsRunning(true);
  }, [timeLeft]);

  function formatTime(segundos) {
    const minutes = Math.floor(segundos / 60);
    const seg = segundos % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seg).padStart(2, '0')}`;
  }

  function toggleTimer() {
    setIsRunning(prev => !prev);
  }

  function resetTimer() {
    setIsRunning(false);
    setTimeLeft(WORK_TIME);
    setMode('work');
    setSessions([]);
  }

  return (
    <div>
      <p>{mode === 'work' ? 'Trabajo' : 'Descanso'}</p>
      <h1>{formatTime(timeLeft)}</h1>
      <button onClick={toggleTimer}>{isRunning ? 'Pausar' : 'Iniciar'}</button>
      <button onClick={resetTimer}>Reiniciar</button>

      <ul>
        {sessions.map((session, index) => (
          <li key={session.id}>
            Sesión {index + 1} — {formatTime(session.duration)} —{' '}
            {session.completedAt.toLocaleTimeString()}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Pomodoro;
