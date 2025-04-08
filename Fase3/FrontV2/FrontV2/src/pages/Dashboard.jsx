import React, { useState, useEffect } from 'react';
import { ChartComponent } from '../components/ChartComponent';

export function Dashboard() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [data, setData] = useState({
    env_temperature: [],
    relative_humidity: [],
    absolute_humidity: [],
    air_speed: [],
    barometric_pressure: [],
    co2: []
  });

  const fetchData = async (sensorName) => {
    try {
      const response = await fetch(`http://192.168.62.70:5000/api/datos/${sensorName}`);
      const result = await response.json();
      if (response.ok) {
        return result;
      } else {
        console.error(`Error fetching ${sensorName} data:`, result.error);
        return [];
      }
    } catch (error) {
      console.error(`Error fetching ${sensorName} data:`, error);
      return [];
    }
  };

  useEffect(() => {
    const fetchAllData = async () => {
      const envTemperatureData = await fetchData('Sensor_temperatura');
      const relativeHumidityData = await fetchData('Sensor_humedad');
      const absoluteHumidityData = await fetchData('Sensor_voltaje');
      const airSpeedData = await fetchData('Sensor_proximidad');
      const barometricPressureData = await fetchData('Sensor_luz');
      const co2Data = await fetchData('Sensor_calidadAire');

      setData({
        env_temperature: envTemperatureData,
        relative_humidity: relativeHumidityData,
        absolute_humidity: absoluteHumidityData,
        air_speed: airSpeedData,
        barometric_pressure: barometricPressureData,
        co2: co2Data
      });
    };

    fetchAllData();
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
        ? new Date(`${endDate}T23:59:59Z`) // Extender hasta el final del día
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

  return (
    <div className='min-h-screen bg-gray-900 text-white p-5'>
      <div className='flex justify-between py-5'>
        <h1 className='font-bold text-3xl mb-4 text-left'>Dashboard | Historial de datos</h1>
      </div>

      <div className='grid grid-cols-2 gap-4'>

        {/* Calidad del aire (m/s) */}
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

        {/* Presión Barométrica (PA) */}
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

        {/* Calidad de aire (Co2) */}
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

        {/* Datos de Volataje */}
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

        {/* Temperatura (°C) */}
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

        {/* Humedad Relativa (%) */}
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