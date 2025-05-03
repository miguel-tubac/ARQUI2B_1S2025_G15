import React, { useState, useEffect } from 'react';
import { ChartComponent } from '../components/ChartComponent';

export function Dashboard() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isLightOn, setIsLightOn] = useState(false); // estado de la luz
  const [data, setData] = useState({
    env_temperature: [],
    relative_humidity: [],
    absolute_humidity: [],
    air_speed: [],
    barometric_pressure: [],
    co2: []
  });

  const fetchLatestData = async (sensorName) => {
    try {
      const response = await fetch(`http://192.168.253.111:5000/end-data/${sensorName}`);
      const result = await response.json();
      if (response.ok) {
        return result;
      } else {
        console.error(`Error fetching latest ${sensorName} data:`, result.error);
        return null;
      }
    } catch (error) {
      console.error(`Error fetching latest ${sensorName} data:`, error);
      return null;
    }
  };

  useEffect(() => {
    const fetchRealtimeData = async () => {
      const envTemperature = await fetchLatestData('Sensor_temperatura');
      const relativeHumidity = await fetchLatestData('Sensor_humedad');
      const absoluteHumidity = await fetchLatestData('Sensor_voltaje');
      const airSpeed = await fetchLatestData('Sensor_proximidad');
      const barometricPressure = await fetchLatestData('Sensor_luz');
      const co2 = await fetchLatestData('Sensor_calidadAire');

      setData(prevData => ({
        env_temperature: envTemperature ? [...prevData.env_temperature, envTemperature] : prevData.env_temperature,
        relative_humidity: relativeHumidity ? [...prevData.relative_humidity, relativeHumidity] : prevData.relative_humidity,
        absolute_humidity: absoluteHumidity ? [...prevData.absolute_humidity, absoluteHumidity] : prevData.absolute_humidity,
        air_speed: airSpeed ? [...prevData.air_speed, airSpeed] : prevData.air_speed,
        barometric_pressure: barometricPressure ? [...prevData.barometric_pressure, barometricPressure] : prevData.barometric_pressure,
        co2: co2 ? [...prevData.co2, co2] : prevData.co2,
      }));
    };

    fetchRealtimeData(); // llamada inicial
    const intervalId = setInterval(fetchRealtimeData, 5000); // cada 5 segundos

    return () => clearInterval(intervalId); // limpiar al desmontar
  }, []);

  const handleStartDateChange = (e) => {
    setStartDate(e.target.value);
  };

  const handleEndDateChange = (e) => {
    setEndDate(e.target.value);
  };

  const filterDataByDate = (data) => {
    if (!startDate && !endDate) return data;

    return data.filter((item) => {
      const itemDate = new Date(item.timestamp);
      const start = startDate
        ? new Date(`${startDate}T00:00:00Z`)
        : new Date("1970-01-01T00:00:00Z");
      const end = endDate
        ? new Date(`${endDate}T23:59:59Z`)
        : new Date();

      return itemDate >= start && itemDate <= end;
    });
  };

  const formatData = (data) => {
    return data.map(item => ({
      time: item.timestamp,
      value: item.value
    }));
  };

  const handleToggleLight = async () => {
    const newEstado = !isLightOn; // si está apagada, queremos prenderla; si está prendida, queremos apagarla
    try {
      const response = await fetch('http://192.168.253.111:5000/admin-luces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: newEstado })
      });
      const result = await response.json();
      if (response.ok) {
        setIsLightOn(newEstado); // actualizar estado
        alert(result.message);
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      alert(`Error al enviar la solicitud: ${error.message}`);
    }
  };

  return (
    <div className='min-h-screen bg-gray-900 text-white p-5'>
      <div className='flex justify-between py-5 items-center'>
        <h1 className='font-bold text-3xl mb-4 text-left'>Dashboard | Historial de datos</h1>
        
        {/* Botón de prender/apagar luces */}
        <button
          onClick={handleToggleLight}
          className={`px-4 py-2 rounded-lg font-semibold ${
            isLightOn ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
          }`}
        >
          {isLightOn ? 'Apagar' : 'Prender'}
        </button>
      </div>

      <div className='grid grid-cols-2 gap-4'>
        {/* Cantidad de Personas */}
        <div className='bg-gray-500 p-4 rounded-2xl shadow-lg'>
          <div className='flex justify-between items-center mb-4'>
            <div className='text-white font-semibold'>Cantidad de Personas</div>
            <div>
              <input type='date' value={startDate} onChange={handleStartDateChange} className='p-2 rounded-lg bg-gray-700 text-white' />
              <input type='date' value={endDate} onChange={handleEndDateChange} className='p-2 rounded-lg bg-gray-700 text-white ml-2' />
            </div>
          </div>
          <ChartComponent data={formatData(filterDataByDate(data.air_speed))} />
        </div>

        {/* Iluminación */}
        <div className='bg-gray-500 p-4 rounded-2xl shadow-lg'>
          <div className='flex justify-between items-center mb-4'>
            <div className='text-white font-semibold'>Iluminación</div>
            <div>
              <input type='date' value={startDate} onChange={handleStartDateChange} className='p-2 rounded-lg bg-gray-700 text-white' />
              <input type='date' value={endDate} onChange={handleEndDateChange} className='p-2 rounded-lg bg-gray-700 text-white ml-2' />
            </div>
          </div>
          <ChartComponent data={formatData(filterDataByDate(data.barometric_pressure))} />
        </div>

        {/* Calidad de aire */}
        <div className='bg-gray-500 p-4 rounded-2xl shadow-lg'>
          <div className='flex justify-between items-center mb-4'>
            <div className='text-white font-semibold'>Calidad de aire (Co2)</div>
            <div>
              <input type='date' value={startDate} onChange={handleStartDateChange} className='p-2 rounded-lg bg-gray-700 text-white' />
              <input type='date' value={endDate} onChange={handleEndDateChange} className='p-2 rounded-lg bg-gray-700 text-white ml-2' />
            </div>
          </div>
          <ChartComponent data={formatData(filterDataByDate(data.co2))} />
        </div>

        {/* Voltaje */}
        <div className='bg-gray-500 p-4 rounded-2xl shadow-lg'>
          <div className='flex justify-between items-center mb-4'>
            <div className='text-white font-semibold'>Voltaje</div>
            <div>
              <input type='date' value={startDate} onChange={handleStartDateChange} className='p-2 rounded-lg bg-gray-700 text-white' />
              <input type='date' value={endDate} onChange={handleEndDateChange} className='p-2 rounded-lg bg-gray-700 text-white ml-2' />
            </div>
          </div>
          <ChartComponent data={formatData(filterDataByDate(data.absolute_humidity))} />
        </div>

        {/* Temperatura */}
        <div className='bg-gray-500 p-4 rounded-2xl shadow-lg'>
          <div className='flex justify-between items-center mb-4'>
            <div className='text-white font-semibold'>Temperatura (°C)</div>
            <div>
              <input type='date' value={startDate} onChange={handleStartDateChange} className='p-2 rounded-lg bg-gray-700 text-white' />
              <input type='date' value={endDate} onChange={handleEndDateChange} className='p-2 rounded-lg bg-gray-700 text-white ml-2' />
            </div>
          </div>
          <ChartComponent data={formatData(filterDataByDate(data.env_temperature))} />
        </div>

        {/* Humedad */}
        <div className='bg-gray-500 p-4 rounded-2xl shadow-lg'>
          <div className='flex justify-between items-center mb-4'>
            <div className='text-white font-semibold'>Humedad</div>
            <div>
              <input type='date' value={startDate} onChange={handleStartDateChange} className='p-2 rounded-lg bg-gray-700 text-white' />
              <input type='date' value={endDate} onChange={handleEndDateChange} className='p-2 rounded-lg bg-gray-700 text-white ml-2' />
            </div>
          </div>
          <ChartComponent data={formatData(filterDataByDate(data.relative_humidity))} />
        </div>

      </div>
    </div>
  );
}
