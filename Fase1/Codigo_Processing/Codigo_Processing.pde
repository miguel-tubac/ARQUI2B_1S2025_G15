import processing.serial.*;

Serial myPort;
String data = "";
int gasVal = 0;
int velocidad = 0;

void setup() {
  size(600, 400); // Tamaño de la ventana
  printArray(Serial.list()); // Muestra los puertos seriales disponibles

  // Cambia el índice según el puerto donde esté conectado Arduino
  myPort = new Serial(this, Serial.list()[0], 9600); 
  myPort.bufferUntil('\n'); // Esperar hasta recibir una línea completa
}

void draw() {
  background(0);  // Fondo negro
  fill(255);      // Texto blanco

  textSize(20);
  text("Sensor CO2:", 50, 100);
  text(gasVal, 200, 100);
  
  text("Velocidad:", 50, 150);
  text(velocidad, 200, 150);

  // Dibujar una barra proporcional al valor del gas
  fill(0, 255, 0);
  rect(50, 200, map(gasVal, 0, 1023, 0, width-100), 50);
}

/*
  Estos son los datos para validar la calidad del oxigeno
    
  400 ppm – 750 ppm: bueno para la salud
  750 ppm – 1200 ppm: Tenga cuidado
  1200 ppm (y más): nocivo para la salud
*/

void serialEvent(Serial p) {
  data = p.readStringUntil('\n'); // Leer línea completa
  if (data != null) {
    data = trim(data); // Eliminar espacios en blanco
    String[] values = split(data, ","); // Separar por comas
    if (values.length == 2) { 
      gasVal = int(values[0]); 
      velocidad = int(values[1]);
    }
  }
}
