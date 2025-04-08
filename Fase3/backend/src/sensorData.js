const mongoose = require("mongoose");

const sensorSchema = new mongoose.Schema({
  value: Number,
  timestamp: { type: Date, default: Date.now },
});

const SensorTemperatura = mongoose.model(
  "TemperaturaSensor",
  sensorSchema,
  "Sensor_temperatura"
);
const SensorCalidadAire = mongoose.model(
  "AireSensor",
  sensorSchema,
  "Sensor_calidadAire"
);
const SensorLuz = mongoose.model("LuzSensor", sensorSchema, "Sensor_luz");
const SensorProximidad = mongoose.model(
  "ProximidadSensor",
  sensorSchema,
  "Sensor_proximidad"
);
const SensorVoltaje = mongoose.model(
  "VoltajeSensor",
  sensorSchema,
  "Sensor_voltaje"
);
const SensorHumedad = mongoose.model(
  "HumedadSensor",
  sensorSchema,
  "Sensor_humedad"
);

module.exports = {
  SensorTemperatura,
  SensorCalidadAire,
  SensorLuz,
  SensorProximidad,
  SensorVoltaje,
  SensorHumedad,
};

/* const mongoose = require("mongoose");

const sensorTemperaturaSchema = new mongoose.Schema({
  value: Number,
  timestamp: Date,
});
const SensorTemperatura = mongoose.model(
  "SensorTemperatura",
  sensorTemperaturaSchema,
  "Sensor_temperatura"
);

const sensorCalidadAireSchema = new mongoose.Schema({
  value: Number,
  timestamp: Date,
});
const SensorCalidadAire = mongoose.model(
  "SensorCalidadAire",
  sensorCalidadAireSchema,
  "Sensor_calidadAire"
);

const sensorLuzSchema = new mongoose.Schema({
  value: Number,
  timestamp: Date,
});
const SensorLuz = mongoose.model("SensorLuz", sensorLuzSchema, "Sensor_luz");

const sensorProximidadSchema = new mongoose.Schema({
  value: Number,
  timestamp: Date,
});
const SensorProximidad = mongoose.model(
  "SensorProximidad",
  sensorProximidadSchema,
  "Sensor_proximidad"
);

const sensorHumedadSchema = new mongoose.Schema({
  value: Number,
  timestamp: Date,
});
const SensorHumedad = mongoose.model(
  "SensorHumedad",
  sensorHumedadSchema,
  "Sensor_humedad"
);

const sensorVoltajeSchema = new mongoose.Schema({
  value: Number,
  timestamp: Date,
});
const SensorVoltaje = mongoose.model(
  "SensorVoltaje",
  sensorVoltajeSchema,
  "Sensor_voltaje"
);

module.exports = {
  SensorTemperatura,
  SensorCalidadAire,
  SensorLuz,
  SensorProximidad,
  SensorHumedad,
  SensorVoltaje,
};

 */
