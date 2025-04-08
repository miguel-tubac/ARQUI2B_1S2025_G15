const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mqtt = require("mqtt");

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(cors());

// En memoria: { table: [ { value, timestamp }, ... ] }
const sensorData = {};

// MQTT CONFIG
const mqttClient = mqtt.connect("mqtt://broker.emqx.io:1883");

const topics = [
  "sensor/temperatura",
  "sensor/humedad",
  "sensor/gas",
  "sensor/luz",
  "sensor/personas",
  "sensor/corriente",
];

mqttClient.on("connect", () => {
  console.log("🟢 Conectado al broker MQTT");
  mqttClient.subscribe(topics, (err) => {
    if (err) console.error("Error al suscribirse:", err);
    else console.log("📡 Suscrito a:", topics.join(", "));
  });
});

mqttClient.on("message", (topic, message) => {
  const value = parseFloat(message.toString());
  const timestamp = new Date().toISOString();
  let table;

  switch (topic) {
    case "sensor/temperatura":
      table = "Sensor_temperatura";
      break;
    case "sensor/humedad":
      table = "Sensor_humedad";
      break;
    case "sensor/gas":
      table = "Sensor_calidadAire";
      break;
    case "sensor/luz":
      table = "Sensor_luz";
      break;
    case "sensor/personas":
      table = "Sensor_proximidad";
      break;
    case "sensor/corriente":
      table = "Sensor_voltaje";
      break;
    default:
      console.log(`❓ Topic desconocido: ${topic}`);
      return;
  }

  // Guardar en memoria
  if (!sensorData[table]) sensorData[table] = [];
  sensorData[table].push({ value, timestamp });

  // Limitar tamaño de historial (opcional)
  if (sensorData[table].length > 1000) sensorData[table].shift();

  console.log(`✅ Guardado: ${table} -> ${value} @ ${timestamp}`);
});

// Ruta para recibir datos desde MQTT (opcional si lo quieres conservar)
app.post("/api/sensor-data", (req, res) => {
  const { table, value, timestamp } = req.body;

  if (!sensorData[table]) sensorData[table] = [];
  sensorData[table].push({ value, timestamp });

  res.status(200).json({ message: "Dato guardado correctamente" });
});

// Nueva ruta para enviar datos al frontend
app.get("/api/datos/:sensorName", (req, res) => {
  const { sensorName } = req.params;
  const data = sensorData[sensorName] || [];
  res.json(data);
});

app.listen(port, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${port}`);
});
