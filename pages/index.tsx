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
      text: 'Gráfica representativa del MRUA',
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
      const newMeasurement = { depth, elapsedTime, name: 'Mediciones' };
      const newMeasurementHistory = [...measurementHistory, newMeasurement];
      setMeasurementHistory(newMeasurementHistory);
      localStorage.setItem('measurementHistory', JSON.stringify(newMeasurementHistory));
    }
  }

  function handleNameChange(event: React.ChangeEvent<HTMLInputElement>, index: number) {
    const newMeasurementHistory = [...measurementHistory];
    newMeasurementHistory[index].name = event.target.value;
    setMeasurementHistory(newMeasurementHistory);
    localStorage.setItem('measurementHistory', JSON.stringify(newMeasurementHistory));
  }

  function handleDeleteClick(index: number) {
    const newMeasurementHistory = [...measurementHistory];
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
        label: 'Distancia (m)',
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
            <span className="mb-0 text-center">Distancia (m)</span>
            <h1 className="mb-0" style={{ fontSize: '52px' }}>{depth !== null ? depth.toFixed(2) : '0'}</h1>
          </div>
          <div className="mx-4" />
          <div className="mr-5 text-center">
            <span className="mb-0 text-center">Tiempo (s)</span>
            <h1 className="mb-0" style={{ fontSize: '52px' }}>{elapsedTime !== null ? elapsedTime.toFixed(2) : '-'}</h1>
          </div>
        </div>
        <div className="form-group d-flex justify-content-center">
          {isMeasuring ? (
            <button type="button" className="btn btn-danger animated pulse" onClick={handleStopClick}>
              Parar
            </button>
          ) : (
            <button type="button" className="btn btn-success animated pulse" onClick={handleStartClick}>
              Comenzar
            </button>
          )}
        </div>
        <h3 className="mt-5">Historial de mediciones</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Distancia</th>
              <th>Tiempo</th>
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
        <h3 className="mt-5">Cómo funciona</h3>
        <p>
          La distancia recorrida por un objeto en caída libre es la distancia que recorre el objeto desde el punto en el que comienza a caer hasta el punto en el que toca el suelo. La caída libre es un movimiento en el que un objeto se deja caer desde una altura sin que ninguna fuerza externa actúe sobre él, por lo que la única fuerza que actúa sobre el objeto es la gravedad.
        </p>
        <p>Para calcular la distancia recorrida por un objeto en caída libre, se puede utilizar la siguiente fórmula:</p>
        <p className="text-center code-style">
          Distancia = g * t<sup>2</sup> / 2
        </p>
        <div>
          En esta fórmula:
          <ul>
            <li>
              g es la aceleración debida a la gravedad, que es de aproximadamente 9,8 m/s^2 en la Tierra.
            </li>
            <li>
              t es el tiempo que ha pasado desde que el objeto comenzó a caer.
            </li>
          </ul>
        </div>
        <p>
          Es importante tener en cuenta que esta fórmula solo es precisa si el objeto está en caída libre y no está siendo afectado por otras fuerzas, como la resistencia del aire.
          Si el objeto está siendo afectado por otras fuerzas, es necesario tener en cuenta esas fuerzas al calcular la distancia recorrida.
          Otro dato a tener en cuenta es el tiempo que tarda el sonido en llegar a nosotros. El impacto del objeto contra el suelo emitirá un sonido que tardará un tiempo en llegar a
          nuestro oído y será entonces cuando paremos el tiempo.
        </p>
        <p>
          Cabe destacar que para que la medición sea extrictamente exacta, habría que tener buenos aparatos de medición los cuales en la mayoría de casos no vamos a tener a nuestro alcance
          por lo que para el uso de esta app se han obviado y se centra en el cálculo general del Movimiento Rectilíneo Uniformemente Acelerado (MRUA) representado matemáticamente en la fórmula
          anteriormente citada.
        </p>
        <p>
          Puedes ver una representación visual en el gráfico siguiente:
        </p>
        <Line options={chartOptions} data={chartData} />
        <p>
          Esta app usa: <a href="https://www.flaticon.com/free-icons/equis" title="equis icons">Equis icons created by Radhe Icon - Flaticon</a>
        </p>
        <footer className="text-center mt-5 footer-margin">
          Made with <span role="img" aria-label="heart">❤️</span> by <a href="https://github.com/carmona44">Carmona44</a> with <a href="https://chat.openai.com/chat">ChatGPT</a>
        </footer>
      </form>
    </div>
  );
}

export default HomePage;
