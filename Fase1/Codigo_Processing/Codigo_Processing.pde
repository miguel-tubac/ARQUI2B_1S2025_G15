import processing.serial.*;

Serial myPort;
String data = "";
int gasVal = 0;
int velocidad = 0;
float corrienteVal = 0.0;


void setup() {
  fullScreen();
  printArray(Serial.list()); // Muestra los puertos seriales disponibles

  // Cambia el índice según el puerto donde esté conectado Arduino
  myPort = new Serial(this, Serial.list()[0], 9600); 
  myPort.bufferUntil('\n'); // Esperar hasta recibir una línea completa
}

void draw() {
  background(30);  // Fondo oscuro 
  
  informacion_SensorCo2();
  infromacion_SensorCorriente();
}





void informacion_SensorCo2(){
  // Posición del tacómetro
  int centerX = 200;
  int centerY = 200;
  int radio = 120;

  // Rango de CO₂ (mínimo y máximo)
  int minCO2 = 0;
  int maxCO2 = 1500;
  
  // Mapear el valor del gas al ángulo del tacómetro (de -135° a 135°)
  float angle = map(gasVal, minCO2, maxCO2, -135, 135);

  // Dibujar el tacómetro (arco)
  for (int i = -135; i <= 135; i++) {
    float lerpFactor = map(i, -135, 135, 0, 1);
    stroke(lerpColor(color(0, 255, 0), color(255, 0, 0), lerpFactor));
    float x1 = centerX + cos(radians(i)) * (radio - 10);
    float y1 = centerY + sin(radians(i)) * (radio - 10);
    float x2 = centerX + cos(radians(i)) * (radio + 10);
    float y2 = centerY + sin(radians(i)) * (radio + 10);
    line(x1, y1, x2, y2);
  }

  // Dibujar aguja del tacómetro
  float needleX = centerX + cos(radians(angle)) * (radio - 20);
  float needleY = centerY + sin(radians(angle)) * (radio - 20);
  stroke(255, 0, 0);
  strokeWeight(3);
  line(centerX, centerY, needleX, needleY);

  // Dibujar círculo en el centro del tacómetro
  fill(255);
  noStroke();
  ellipse(centerX, centerY, 10, 10);

  // Determinar calidad del aire y color
  String calidad;
  color textColor;
  
  if (gasVal < 750) {
    calidad = "Buena";
    textColor = color(0, 255, 0);
  } else if (gasVal < 1200) {
    calidad = "Precaución";
    textColor = color(255, 165, 0);
  } else {
    calidad = "Mala";
    textColor = color(255, 0, 0);
  }

  // Mostrar calidad del aire
  textSize(25);
  fill(textColor);
  textAlign(CENTER);
  text("Calidad del Aire: " + calidad, centerX, centerY + 150);

  // Mostrar el valor exacto de CO2
  textSize(20);
  fill(255);
  text(gasVal + " ppm", centerX, centerY + 180);
}





void infromacion_SensorCorriente(){
    // Posición del tacómetro
  int centerX = 550;
  int centerY = 200;
  int radio = 120;

  // Rango de CO₂ (mínimo y máximo)
  float minCO2 = 0.0;
  float maxCO2 = 5.0;
  
  // Mapear el valor del gas al ángulo del tacómetro (de -135° a 135°)
  float angle = map(corrienteVal, minCO2, maxCO2, -135, 135);

  // Dibujar el tacómetro (arco)
  for (int i = -135; i <= 135; i++) {
    float lerpFactor = map(i, -135, 135, 0, 1);
    stroke(lerpColor(color(0, 255, 0), color(255, 0, 0), lerpFactor));
    float x1 = centerX + cos(radians(i)) * (radio - 10);
    float y1 = centerY + sin(radians(i)) * (radio - 10);
    float x2 = centerX + cos(radians(i)) * (radio + 10);
    float y2 = centerY + sin(radians(i)) * (radio + 10);
    line(x1, y1, x2, y2);
  }

  // Dibujar aguja del tacómetro
  float needleX = centerX + cos(radians(angle)) * (radio - 20);
  float needleY = centerY + sin(radians(angle)) * (radio - 20);
  stroke(255, 0, 0);
  strokeWeight(3);
  line(centerX, centerY, needleX, needleY);

  // Dibujar círculo en el centro del tacómetro
  fill(255);
  noStroke();
  ellipse(centerX, centerY, 10, 10);

  // Determinar calidad del aire y color
  String calidad;
  color textColor;
  
  if (corrienteVal < 3.0) {
    calidad = "Normal";
    textColor = color(0, 255, 0);
  } else if (corrienteVal < 4.0) {
    calidad = "Precaución";
    textColor = color(255, 165, 0);
  } else {
    calidad = "Peligro";
    textColor = color(255, 0, 0);
  }

  // Mostrar calidad del aire
  textSize(25);
  fill(textColor);
  textAlign(CENTER);
  text("Corriente: " + calidad, centerX, centerY + 150);

  // Mostrar el valor exacto de CO2
  textSize(20);
  fill(255);
  text(corrienteVal + " A", centerX, centerY + 180);
}





void serialEvent(Serial p) {
  data = p.readStringUntil('\n'); // Leer línea completa
  if (data != null) {
    data = trim(data);
    String[] values = split(data, ","); 
    if (values.length == 3) { 
      gasVal = int(values[0]); 
      corrienteVal = float(values[1]);
      velocidad = int(values[2]);
    }
  }
}
