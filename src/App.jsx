import { useState, useEffect, useRef } from 'react';

function Pomodoro() {
  const [workMins, setWorkMins] = useState(25);
  const [breakMins, setBreakMins] = useState(5);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState('work');
  const [sessions, setSessions] = useState([]);
  const intervalRef = useRef(null);

  const totalTime = mode === 'work' ? workMins * 60 : breakMins * 60;
  const progress = ((totalTime - timeLeft) / totalTime) * 100;

  const completedWork = sessions.filter(s => s.type === 'work');
  const totalWorkSecs = completedWork.reduce((acc, s) => acc + s.duration, 0);

  // cuenta regresiva
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning, timeLeft]);

  // cambio de modo al llegar a 0
  useEffect(() => {
    if (timeLeft !== 0) return;

    if (mode === 'work') {
      setSessions(prev => [
        ...prev,
        { id: Date.now(), type: 'work', duration: workMins * 60, completedAt: new Date() },
      ]);
    }

    const nextMode = mode === 'work' ? 'break' : 'work';
    setMode(nextMode);
    setTimeLeft(nextMode === 'work' ? workMins * 60 : breakMins * 60);
    setIsRunning(true);
  }, [timeLeft]);

  // sonido al completar
  useEffect(() => {
    if (timeLeft !== 0) return;
    try {
      new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg').play();
    } catch (error) {
      
    }
  }, [timeLeft]);

  // poner timeLeft cuando cambia la configuracion
  useEffect(() => {
    if (isRunning) return;
    setTimeLeft(mode === 'work' ? workMins * 60 : breakMins * 60);
  }, [workMins, breakMins]);

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
    setMode('work');
    setTimeLeft(workMins * 60);
    setSessions([]);
  }

  function savePartial() {
    const elapsed = totalTime - timeLeft;
    if (elapsed <= 0) return;
    setSessions(prev => [
      ...prev,
      { id: Date.now(), type: 'work (parcial)', duration: elapsed, completedAt: new Date() },
    ]);
  }

  function handleWorkMins(e) {
    const val = Math.min(60, Math.max(1, Number(e.target.value)));
    setWorkMins(val);
  }

  function handleBreakMins(e) {
    const val = Math.min(60, Math.max(1, Number(e.target.value)));
    setBreakMins(val);
  }

  return (
    <div>
      <div>
        <label>
          Trabajo (min):
          <input
            type="number"
            min={1}
            max={60}
            value={workMins}
            disabled={isRunning}
            onChange={handleWorkMins}
          />
        </label>
        <label>
          Descanso (min):
          <input
            type="number"
            min={1}
            max={60}
            value={breakMins}
            disabled={isRunning}
            onChange={handleBreakMins}
          />
        </label>
      </div>

      <p>{mode === 'work' ? 'Trabajo' : 'Descanso'}</p>
      <h1>{formatTime(timeLeft)}</h1>

      <div style={{ width: 300, background: '#ddd', borderRadius: 4, overflow: 'hidden' }}>
        <div
          style={{
            width: `${progress}%`,
            height: 12,
            background: mode === 'work' ? '#e74c3c' : '#2ecc71',
            transition: 'width 1s linear',
          }}
        />
      </div>

      <div>
        <button onClick={toggleTimer}>{isRunning ? 'Pausar' : 'Iniciar'}</button>
        <button onClick={resetTimer}>Reiniciar</button>
        <button onClick={savePartial} disabled={!isRunning && timeLeft === totalTime}>
          Guardar sesión
        </button>
      </div>

      <div>
        <p>Sesiones completadas: {completedWork.length}</p>
        <p>Tiempo total trabajado: {formatTime(totalWorkSecs)}</p>
      </div>

      <ul>
        {sessions.map((session, index) => (
          <li key={session.id}>
            Sesión {index + 1} ({session.type}) — {formatTime(session.duration)} —{' '}
            {session.completedAt.toLocaleTimeString()}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Pomodoro;
