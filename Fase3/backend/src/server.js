const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { connectDatabase } = require("./dbConnection");
const mqtt = require("mqtt");
const axios = require("axios"); // Añadir axios para hacer peticiones HTTP
const app = express();
const port = 3000;
// Middleware
app.use(bodyParser.json());
app.use(cors());

// MQTT CONFIG
const mqttClient = mqtt.connect("mqtt://broker.emqx.io:1883");

let latestSensorData = {
  temperatura: null,
  humedad: null,
  Aire: null,
  Iluminacion: null,
  Personas: null,
  corriente: null,
};

const topics = [
  "sensor/temperatura",
  "sensor/humedad",
  "sensor/gas",
  "sensor/luz",
  "sensor/personas",
  "sensor/corriente",
];

const {
  SensorTemperatura,
  SensorCalidadAire,
  SensorLuz,
  SensorProximidad,
  SensorVoltaje,
  SensorHumedad,
} = require("./sensorData");

mqttClient.on("connect", () => {
  console.log("Conectado al broker MQTT");
  mqttClient.subscribe(topics, (err) => {
    if (err) console.error("Error al suscribirse:", err);
    else console.log("Suscrito a:", topics.join(", "));
  });
});

mqttClient.on("message", (topic, message) => {
  const value = parseFloat(message.toString());

  switch (topic) {
    case "sensor/temperatura":
      latestSensorData.temperatura = value;
      break;
    case "sensor/humedad":
      latestSensorData.humedad = value;
      break;
    case "sensor/gas":
      latestSensorData.Aire = value;
      break;
    case "sensor/luz":
      latestSensorData.Iluminacion = value;
      break;
    case "sensor/personas":
      latestSensorData.Personas = value;
      break;
    case "sensor/corriente":
      latestSensorData.corriente = value;
      break;
    default:
      console.log(`❓ Topic desconocido: ${topic}`);
      return;
  }

  console.log("📦 JSON actualizado:", JSON.stringify(latestSensorData));
});

// Conectar a la base de datos

connectDatabase()
  .then(() => {
    console.log("Conexión a la base de datos establecida");

    // Configurar el puerto serial
    //const serialPort = new SerialPort({ path: "COM5", baudRate: 9600 }); // Cambia 'COM3' por el puerto correcto
    //const parser = serialPort.pipe(new ReadlineParser({ delimiter: "\n" }));

    mqttClient.on("message", async (topic, message) => {
      try {
        const value = parseFloat(message.toString());
        const decimales = contarDecimales(value);
        if (decimales >= 3) {
          return;
        }
        // Enviar datos a la API
        const timestamp = new Date();

        switch (topic) {
          case "sensor/temperatura":
            await axios.post("http://localhost:3000/api/sensor-data", {
              table: "Sensor_temperatura",
              value: value,
              timestamp,
            });
            //latestSensorData.temperatura = value;
            break;
          case "sensor/humedad":
            await axios.post("http://localhost:3000/api/sensor-data", {
              table: "Sensor_humedad",
              value: value,
              timestamp,
            });
            //latestSensorData.humedad = value;
            break;
          case "sensor/gas":
            await axios.post("http://localhost:3000/api/sensor-data", {
              table: "Sensor_calidadAire",
              value: value,
              timestamp,
            });
            //latestSensorData.Aire = value;
            break;
          case "sensor/luz":
            await axios.post("http://localhost:3000/api/sensor-data", {
              table: "Sensor_luz",
              value: value,
              timestamp,
            });
            //latestSensorData.Iluminacion = value;
            break;
          case "sensor/personas":
            await axios.post("http://localhost:3000/api/sensor-data", {
              table: "Sensor_proximidad",
              value: value,
              timestamp,
            });
            //latestSensorData.Personas = value;
            break;
          case "sensor/corriente":
            await axios.post("http://localhost:3000/api/sensor-data", {
              table: "Sensor_voltaje",
              value: value,
              timestamp,
            });
            //latestSensorData.corriente = value;
            break;
          default:
            console.log(`❓ Topic desconocido: ${topic}`);
            return;
        }
      } catch (error) {
        console.error("Error al procesar los datos del sensor", error);
      }

      console.log("📦 JSON actualizado:", JSON.stringify(latestSensorData));
    });

    // Ruta para guardar datos del sensor
    app.post("/api/sensor-data", async (req, res) => {
      try {
        const { table, value, timestamp } = req.body;
        let sensorData;

        switch (table) {
          case "Sensor_temperatura":
            sensorData = new SensorTemperatura({ value, timestamp });
            break;
          case "Sensor_calidadAire":
            sensorData = new SensorCalidadAire({ value, timestamp });
            break;
          case "Sensor_luz":
            sensorData = new SensorLuz({ value, timestamp });
            break;
          case "Sensor_proximidad":
            sensorData = new SensorProximidad({ value, timestamp });
            break;
          case "Sensor_humedad":
            sensorData = new SensorHumedad({ value, timestamp });
            break;
          case "Sensor_voltaje":
            sensorData = new SensorVoltaje({ value, timestamp });
            break;
          default:
            return res.status(400).send("Tabla no válida");
        }
        await sensorData.save();
        res.status(201).send(sensorData);
      } catch (error) {
        console.error("Error al guardar los datos del sensor", error);
        res.status(500).send("Error al guardar los datos del sensor");
      }
    });

    // Iniciar el servidor
    app.listen(port, () => {
      console.log(`Servidor corriendo en http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error("Error al conectar a la base de datos", error);
  });

function contarDecimales(numero) {
  if (Math.floor(numero) === numero) {
    // Es un número entero, no tiene decimales
    return 0;
  }
  const partes = numero.toString().split(".");
  return partes[1]?.length || 0;
}
