import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export const ChartComponent = ({ data, colors }) => {
  const {
    backgroundColor = 'rgba(0, 255, 0, 0.3)', // Color de fondo rojo con opacidad
    borderColor = 'rgba(0, 255, 0, 10)', // Color de borde rojo
    textColor = 'white',
  } = colors || {};

  const sortedData = data
    .filter(item => item.time && item.value !== null) // Filtra valores nulos
    .map(item => {
      const date = new Date(item.time);
      return {
        time: Math.floor(date.getTime() / 1000), // Convierte a timestamp en segundos
        value: item.value
      };
    })
    .sort((a, b) => a.time - b.time) // Ordena los datos por tiempo
    .filter((item, index, array) => index === 0 || item.time !== array[index - 1].time); // Elimina duplicados

  const chartData = {
    labels: sortedData.map(item => new Date(item.time * 1000).toLocaleDateString()),
    datasets: [
      {
        label: 'Valor',
        data: sortedData.map(item => item.value),
        backgroundColor,
        borderColor,
        borderWidth: 1,
        fill: false,
      },
    ],
  };

  const options = {
    responsive: true,
    animation: false, // ❗ Evita animación en cada actualización
    plugins: {
      legend: {
        position: 'top',
        labels: { color: textColor },
      },
      title: {
        display: true,
        text: 'Gráfico Lineal',
        color: textColor,
      },
    },
    scales: {
      x: { ticks: { color: textColor } },
      y: { ticks: { color: textColor } },
    },
  };
  



  return <Line data={chartData} options={options} />;
};