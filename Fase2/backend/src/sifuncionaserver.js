const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { connectDatabase } = require("./dbConnection");
const { SerialPort } = require("serialport");
const { ReadlineParser } = require("@serialport/parser-readline");
const { logToDb } = require("./dbUtils");

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
    //const serialPort = new SerialPort("COM5", { baudRate: 9600 }); // Cambia 'COM3' por el puerto correcto
    const serialPort = new SerialPort({
      path: "COM5", // Asegúrate de que COM5 es el puerto correcto
      baudRate: 9600,
    });
    //const parser = serialPort.pipe(new Readline({ delimiter: "\n" }));
    const parser = serialPort.pipe(new ReadlineParser({ delimiter: "\n" }));

    parser.on("data", async (data) => {
      console.log(`Datos recibidos: ${data}`);
      try {
        const sensorData = JSON.parse(data);
        const { temperatura, humedad, iluminacion, personas, corriente } =
          sensorData;

        if (temperatura !== undefined) {
          await logToDb("Sensor_temperatura", {
            name_sensor: "temperatura",
            value: temperatura,
          });
        }
        if (humedad !== undefined) {
          await logToDb("Sensor_calidadAire", {
            name_sensor: "humedad",
            value: humedad,
          });
        }
        if (iluminacion !== undefined) {
          await logToDb("Sensor_luz", {
            name_sensor: "iluminacion",
            value: iluminacion,
          });
        }
        if (personas !== undefined) {
          await logToDb("Sensor_proximidad", {
            name_sensor: "personas",
            value: personas,
          });
        }
        if (corriente !== undefined) {
          await logToDb("Sensor_voltaje", {
            name_sensor: "corriente",
            value: corriente,
          });
        }

        console.log("Datos del sensor guardados en la base de datos");
      } catch (error) {
        console.error("Error al procesar los datos del sensor", error);
      }
    });

    // Ruta para guardar datos del sensor (opcional, si quieres recibir datos a través de una API)
    app.post("/api/sensor-data", async (req, res) => {
      try {
        const { name_sensor, value } = req.body;
        const sensorData = new SensorData({ name_sensor, value });
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
