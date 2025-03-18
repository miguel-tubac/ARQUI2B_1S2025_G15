const mongoose = require('mongoose');
const SensorData = require('./sensorData');

async function logToDb(collectionName, data) {
    try {
        const Model = mongoose.model(collectionName, SensorData.schema);
        const document = new Model(data);
        await document.save();
        return document;
    } catch (error) {
        console.error('Error al guardar los datos en la base de datos', error);
        throw error;
    }
}

module.exports = { logToDb };
