const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { connectDatabase } = require("./dbConnection");
const { SerialPort } = require("serialport");
const { ReadlineParser } = require("@serialport/parser-readline");
const axios = require("axios"); // Añadir axios para hacer peticiones HTTP
const {
  SensorTemperatura,
  SensorCalidadAire,
  SensorLuz,
  SensorProximidad,
  SensorVoltaje,
  SensorHumedad,
} = require("./sensorData");

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Conectar a la base de datos
connectDatabase()
  .then(() => {
    console.log("Conexión a la base de datos establecida");

    // Configurar el puerto serial
    const serialPort = new SerialPort({ path: "COM3", baudRate: 9600 }); // Cambia 'COM3' por el puerto correcto
    const parser = serialPort.pipe(new ReadlineParser({ delimiter: "\n" }));

    parser.on("data", async (data) => {
      console.log(`Datos recibidos: ${data}`);
      try {
        const sensorData = JSON.parse(data);
        const { temperatura, humedad, Aire, Iluminacion, Personas, corriente } =
          sensorData;

        // Enviar datos a la API
        const timestamp = new Date();
        if (temperatura !== undefined) {
          await axios.post("http://localhost:3000/api/sensor-data", {
            table: "Sensor_temperatura",
            value: temperatura,
            timestamp,
          });
        }
        if (Aire !== undefined) {
          await axios.post("http://localhost:3000/api/sensor-data", {
            table: "Sensor_calidadAire",
            value: Aire,
            timestamp,
          });
        }
        if (Iluminacion !== undefined) {
          await axios.post("http://localhost:3000/api/sensor-data", {
            table: "Sensor_luz",
            value: Iluminacion,
            timestamp,
          });
        }
        if (Personas !== undefined) {
          await axios.post("http://localhost:3000/api/sensor-data", {
            table: "Sensor_proximidad",
            value: Personas,
            timestamp,
          });
        }
        if (humedad !== undefined) {
          await axios.post("http://localhost:3000/api/sensor-data", {
            table: "Sensor_humedad",
            value: humedad,
            timestamp,
          });
        }
        if (corriente !== undefined) {
          await axios.post("http://localhost:3000/api/sensor-data", {
            table: "Sensor_voltaje",
            value: corriente,
            timestamp,
          });
        }

        console.log("Datos del sensor enviados a la API");
      } catch (error) {
        console.error("Error al procesar los datos del sensor", error);
      }
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
