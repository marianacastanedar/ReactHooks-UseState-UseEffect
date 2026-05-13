import { useState, useEffect, useRef } from 'react';

function Pomodoro() {
  const [timeLeft, setTimeLeft] = useState(1500);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    }

    if (timeLeft === 0) {
      setIsRunning(false);
    }

    return () => clearInterval(intervalRef.current);
  }, [isRunning, timeLeft]);

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
    setTimeLeft(1500);
  }

  return (
    <div>
      <h1>{formatTime(timeLeft)}</h1>
      <button onClick={toggleTimer}>{isRunning ? 'Pausar' : 'Iniciar'}</button>
      <button onClick={resetTimer}>Reiniciar</button>
    </div>
  );
}

export default Pomodoro;
