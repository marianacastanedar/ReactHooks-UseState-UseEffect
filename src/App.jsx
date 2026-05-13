import { useState, useEffect, useRef } from 'react';
import './App.css'

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
    <div className="pomodoro">
      <div className="pomodoro__config">
        <label className="pomodoro__config-label">
          Trabajo (min)
          <input
            className="pomodoro__input"
            type="number"
            min={1}
            max={60}
            value={workMins}
            disabled={isRunning}
            onChange={handleWorkMins}
          />
        </label>
        <label className="pomodoro__config-label">
          Descanso (min)
          <input
            className="pomodoro__input"
            type="number"
            min={1}
            max={60}
            value={breakMins}
            disabled={isRunning}
            onChange={handleBreakMins}
          />
        </label>
      </div>

      <p className={`pomodoro__mode pomodoro__mode--${mode}`}>
        {mode === 'work' ? 'TRABAJO' : 'DESCANSO'}
      </p>

      <div className="pomodoro__clock">
        <h1 className="pomodoro__time">{formatTime(timeLeft)}</h1>
      </div>

      <div className="pomodoro__progress-track">
        <div
          className="pomodoro__progress-fill"
          style={{
            width: `${progress}%`,
            background: mode === 'work' ? '#4a9ece' : '#90c4e4',
          }}
        />
      </div>

      <div className="pomodoro__controls">
        <button className="pomodoro__btn pomodoro__btn--primary" onClick={toggleTimer}>
          {isRunning ? 'Pausar' : 'Iniciar'}
        </button>
        <button className="pomodoro__btn pomodoro__btn--secondary" onClick={resetTimer}>
          Reiniciar
        </button>
        <button
          className="pomodoro__btn pomodoro__btn--outline"
          onClick={savePartial}
          disabled={!isRunning && timeLeft === totalTime}
        >
          Guardar parcial
        </button>
      </div>

      <div className="pomodoro__stats">
        <div className="pomodoro__stat">
          <span className="pomodoro__stat-value">{completedWork.length}</span>
          <span className="pomodoro__stat-label">Sesiones</span>
        </div>
        <div className="pomodoro__stat">
          <span className="pomodoro__stat-value pomodoro__stat-value--time">
            {formatTime(totalWorkSecs)}
          </span>
          <span className="pomodoro__stat-label">Tiempo total</span>
        </div>
      </div>

      <ul className="pomodoro__history">
        {sessions.map((session, index) => (
          <li key={session.id} className="pomodoro__history-item">
            Sesion {index + 1} ({session.type}) — {formatTime(session.duration)} —{' '}
            {session.completedAt.toLocaleTimeString()}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Pomodoro;
