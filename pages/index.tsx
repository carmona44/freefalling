import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export const chartOptions = {
  responsive: true,
  plugins: {
    legend: {
      display: false,
    },
    title: {
      display: true,
      text: 'Free fall chart',
    },
  },
};

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
      const intervalId = setInterval(() => {
        if (startTime !== null) {
          setDepth(calculateDepth((Date.now() - startTime) / 1000));
          setElapsedTime((Date.now() - startTime) / 1000);
        }
      }, 1);
      return () => clearInterval(intervalId);
    }
  }, [isMeasuring]);

  function handleStartClick() {
    setStartTime(Date.now());
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

  const elapsedTimeValues = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20];
  const depthValues = elapsedTimeValues.map(time => calculateDepth(time));

  const chartData = {
    labels: elapsedTimeValues, // Array of values for the x-axis
    datasets: [
      {
        label: 'Depth (m)',
        fill: false,
        lineTension: 0.3,
        backgroundColor: 'rgba(75,192,192,0.4)',
        borderColor: 'rgba(75,192,192,1)',
        borderDash: [],
        borderDashOffset: 0.0,
        pointBorderColor: 'rgba(75,192,192,1)',
        pointBackgroundColor: '#fff',
        pointBorderWidth: 1,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: 'rgba(75,192,192,1)',
        pointHoverBorderColor: 'rgba(220,220,220,1)',
        pointHoverBorderWidth: 2,
        pointRadius: 1,
        pointHitRadius: 10,
        data: depthValues // Array of values for the y-axis
      }
    ]
  };

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
          This app measures the depth of an object falling through the air under the influence of gravity. When you start the measurement, the app uses the current time as a reference point and begins tracking the elapsed time. It also calculates the meters traveled by the object in free fall using the following formula:
        </p>
        <p className="text-center code-style">
          depth = Gravity * Time<sup>2</sup> / 2
        </p>
        <p>
          In this case, the acceleration due to gravity is a constant value of 9.8 m/s<sup>2</sup> The time is calculated as the elapsed time since the object started falling.
          The rest of the vaules in the formula use default values for the average situation on Earth and an object the size of a marble to a fist.
        </p>
        <p>
          The resulting depth is expressed in meters. As the time increases, the depth also increases, following a parabolic curve.
        </p>
        <p>
          You can see a visual representation of this process in the graph below:
        </p>
        <Line options={chartOptions} data={chartData} />
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
