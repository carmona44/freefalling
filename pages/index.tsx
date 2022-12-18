import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const ACCELERATION_DUE_TO_GRAVITY = 9.8; // m/s^2

function calculateDepth(time: number): number {
  return ACCELERATION_DUE_TO_GRAVITY * time ** 2 / 2;
}

function HomePage() {
  const [startTime, setStartTime] = useState<number | null>(null);
  const [isMeasuring, setIsMeasuring] = useState(false);
  const [depth, setDepth] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [measurementHistory, setMeasurementHistory] = useState<{
    depth: number;
    elapsedTime: number;
    name: string;
  }[]>([]);

  useEffect(() => {
    // Cargar el historial de mediciones del almacenamiento local
    setMeasurementHistory(JSON.parse(localStorage.getItem('measurementHistory') || '[]'));
  }, []); // Este efecto solo se ejecutará una vez al montar el componente

  useEffect(() => {
    if (isMeasuring) {
      setStartTime(Date.now());
      const intervalId = setInterval(() => {
        if (startTime !== null) {
          setDepth(calculateDepth((Date.now() - startTime) / 1000));
          setElapsedTime((Date.now() - startTime) / 1000);
        }
      }, 100);
      return () => clearInterval(intervalId);
    }
  }, [isMeasuring, startTime]);

  function handleStartClick() {
    setIsMeasuring(true);
  }

  function handleStopClick() {
    setIsMeasuring(false);
    setStartTime(null);
    // Guardar la medición en el almacenamiento local
    if (depth !== null && elapsedTime !== null) {
      let measurement = { depth, elapsedTime, name: 'Measurement' };
      setMeasurementHistory([...measurementHistory, measurement]);
      localStorage.setItem('measurementHistory', JSON.stringify(measurementHistory));
    }
  }

  function handleNameChange(event: React.ChangeEvent<HTMLInputElement>, index: number) {
    let newMeasurementHistory = [...measurementHistory];
    newMeasurementHistory[index].name = event.target.value;
    setMeasurementHistory(newMeasurementHistory);
    localStorage.setItem('measurementHistory', JSON.stringify(newMeasurementHistory));
  }

  function handleDeleteClick(index: number) {
    let newMeasurementHistory = [...measurementHistory];
    newMeasurementHistory.splice(index, 1);
    setMeasurementHistory(newMeasurementHistory);
    localStorage.setItem('measurementHistory', JSON.stringify(newMeasurementHistory));
  }

  return (
    <div className="container">
      <form>
        <div className="form-group d-flex justify-content-center align-items-center mb-5">
          <div className="mr-5 text-center">
            <span className="mb-0 text-center">Depth(m)</span>
            <h1 className="mb-0" style={{ fontSize: '52px' }}>{depth !== null ? depth.toFixed(2) : '0'}</h1>
          </div>
          <div className="mx-4" />
          <div className="mr-5 text-center">
            <span className="mb-0 text-center">Time(s)</span>
            <h1 className="mb-0" style={{ fontSize: '52px' }}>{elapsedTime !== null ? elapsedTime.toFixed(2) : '-'}</h1>
          </div>
        </div>
        <div className="form-group d-flex justify-content-center">
          {isMeasuring ? (
            <button type="button" className="btn btn-danger animated pulse" onClick={handleStopClick}>
              Stop
            </button>
          ) : (
            <button type="button" className="btn btn-success animated pulse" onClick={handleStartClick}>
              Start
            </button>
          )}
        </div>
        <h3 className="mt-5">Measurement History</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Depth</th>
              <th>Time</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {measurementHistory.map((measurement, index) => (
              <tr key={index}>
                <td className="align-middle">
                  <input
                    type="text"
                    className="form-control"
                    value={measurement.name}
                    onChange={event => handleNameChange(event, index)}
                  />
                </td>
                <td className="align-middle">{measurement.depth.toFixed(2)}</td>
                <td className="align-middle">{measurement.elapsedTime.toFixed(2)}</td>
                <td className="align-middle">
                  <button type="button" className="btn btn-danger" onClick={() => handleDeleteClick(index)}>
                    <img src="close.png" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <h3 className="mt-5">How it works</h3>
        <p>
          The depth of an object falling freely under the influence of gravity is calculated using the formula:
        </p>
        <p className="text-center code-style">
          depth = acceleration due to gravity * time<sup>2</sup> / 2
        </p>
        <p>
          In this case, the acceleration due to gravity is a constant value of 9.8 m/s<sup>2</sup>, as defined at the top of the file. The time is calculated as the elapsed time since the object started falling.
        </p>
        <p>
          The resulting depth is expressed in meters. As the time increases, the depth also increases, following a parabolic curve.
        </p>
        <p>
          You can see a visual representation of this process for velocity and time in the graph below:
        </p>
        <img src="https://imgs.search.brave.com/xPCGLBPB-4JWLlnS1OS5QjxHWCzkr66u18nT9X50avM/rs:fit:1134:992:1/g:ce/aHR0cDovLzQuYnAu/YmxvZ3Nwb3QuY29t/Ly1MQUIzMFNqNHNY/by9VYmxpVzZFbzJV/SS9BQUFBQUFBQUJh/SS9DRGF4bWc5UG5k/by9zMTYwMC9HcmFw/aDYtMDQucG5n" alt="Graph showing the relationship between time and depth for a falling object" className="img-fluid" />
        <p>
          This app use: <a href="https://www.flaticon.com/free-icons/equis" title="equis icons">Equis icons created by Radhe Icon - Flaticon</a>
        </p>
        <footer className="text-center mt-5 footer-margin">
          Made with <span role="img" aria-label="heart">❤️</span> by <a href="https://github.com/carmona44">Carmona44</a> with <a href="https://chat.openai.com/chat">ChatGPT</a>
        </footer>
      </form>
    </div>
  );
}

export default HomePage;
