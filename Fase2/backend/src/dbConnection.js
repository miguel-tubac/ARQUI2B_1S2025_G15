const mongoose = require("mongoose");
//"mongodb+srv://maugarmg03:kIvyRkvtgwKqvPCc@monitoreo-ambiental.iwe0v.mongodb.net/Sensores?retryWrites=true&w=majority&tls=true";
//"mongodb+srv://maugarmg03:kIvyRkvtgwKqvPCc@monitoreo-ambiental.iwe0v.mongodb.net/Sensores?tls=true&tlsAllowInvalidCertificates=true ";

async function connectDatabase() {
  const CONNECTION_STRING =
    "mongodb+srv://3057827540301:TWLgrK8HfUIigMxR@fase2.8w4xy.mongodb.net/Sensores?retryWrites=true&w=majority&appName=Fase2";
  try {
    await mongoose.connect(CONNECTION_STRING);
    /*await mongoose.connect(CONNECTION_STRING, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      tls: true, // Asegurar que se usa TLS
      tlsAllowInvalidCertificates: false, // Asegurar certificados válidos
    });*/
    console.log("Conectado a mongoDB Atlas con Mongoose");
  } catch (error) {
    console.error("Error al conectarse a mongoDB Atlas con Mongoose", error);
    throw error;
  }
}

module.exports = { connectDatabase };
