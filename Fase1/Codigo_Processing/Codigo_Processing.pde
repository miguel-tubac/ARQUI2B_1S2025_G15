PFont myFont;

import processing.serial.*;

Serial myPort;
String data = "";

int x_titulo = 10;
int y_titulo = 10;

float luz = 1; // definr de 0 a 100
int x_luz = 10; // posicion inicial del esapcio de la luz en x
int y_luz = 550; // posicion inicial del esapcio de la luz en y

float temperatura = 0; // Nivel de temperatura definir de 0 a 100
int x_temp = 10; // posicion inicial del esapcio de la temperatura en x
int y_temp = 100; // posicion inincial del esapcio de la temperatura en y 

float humedad = 100; // definir de 0 a 100
int x_hume = 220; // posicion inicial del esapcio de la humedad en x
int y_hume = 100; // posicion inicial del esapcio de la humedad en y

float distancia_mov = -20;  // definir de 0 a 100 
int numero_personas = 0; // matener en un rango de 4 digitos 
int x_mov = 430; // posicion inicial del esapcio de la sensor de moviento en x
int y_mov = 100; // posicion inicial del esapcio de la sensor de movientoen y
int rang_senso = 50; 


int x_aire = 740;
int y_aire = 10;
int gasVal = 0; //--// Valor local en lugar de lectura desde Arduino rango 0 - 1500

int x_corriente = 740;
int y_corriente = 345;
float corrienteVal = 0.00; //--// Valor local en lugar de lectura desde Arduino rango 0 - 5

void setup() {
  size(1100, 680);
  colorMode(RGB); // Modo de color RGB
  background(65, 100, 135); // Fondo con color RGB (ejemplo: morado)
  
  // Cambia el índice según el puerto donde esté conectado Arduino
  myPort = new Serial(this, Serial.list()[0], 9600); 
  myPort.bufferUntil('\n'); // Esperar hasta recibir una línea completa
}

void draw() {
  /*temperatura += 1;
  if(temperatura >106){
    temperatura = 0;
  }
  
  humedad += 1;
  if(humedad > 106){
    humedad = 0;
  }*/
  
  /*distancia_mov += 1;
  if(distancia_mov > 120){
    distancia_mov = -20;
  }*/
  
  /*luz += 1;
  if(luz>100){
    luz = 0;
  }*/
  
  //gasVal += 1;
  //if(gasVal > 1500){
    //gasVal = 0;
  //}
  
  //corrienteVal += 0.01;
  //corrienteVal = float(int((corrienteVal + 0.01) * 100)) / 100.0;
  //if (corrienteVal > 5) {
    //  corrienteVal = 0.00;
  //}
  
  
  
  texto_titulo();
  espacio_termometro();
  espacio_humedad();
  espacio_sensor_movimiento();
  espacio_luz();
  espacio_aire();
  espacio_corriente();
}



////////////////////////////////////////////////////////////////////////////////////////////////////////

void texto_titulo(){
  fill(255, 255, 255); // fondo del termometro
  stroke(0); // Borde negro
  strokeWeight(3);  
  rect(x_titulo, y_titulo, 720, 80, 20); // Esquinas redondeadas con radio de 20px
  
  myFont = createFont("Arial-Bold", 32); // Cargar la fuente Arial con tamaño 32
  textFont(myFont); // Aplicar la fuente
  fill(0);
  text("HOLA MUNDO ", x_titulo + 200, y_titulo + 50); // titulo
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////

void espacio_corriente(){
  fill(255); // fondo del termometro
  stroke(0); // Borde negro
  strokeWeight(3);  
  rect(x_corriente, y_corriente, 350, 325, 20); // Esquinas redondeadas con radio de 20px
  infromacion_SensorCorriente();
}

void infromacion_SensorCorriente(){
  int centerX = x_corriente + 170;
  int centerY = y_corriente + 145;
  int radio = 120;
  float minCO2 = 0.0;
  float maxCO2 = 1.0;
  float angle = map(corrienteVal*5, minCO2, maxCO2, -135, 135);

  for (int i = -135; i <= 135; i++) {
    float lerpFactor = map(i, -135, 135, 0, 1);
    stroke(lerpColor(color(0, 255, 0), color(255, 0, 0), lerpFactor));
    float x1 = centerX + cos(radians(i)) * (radio - 10);
    float y1 = centerY + sin(radians(i)) * (radio - 10);
    float x2 = centerX + cos(radians(i)) * (radio + 10);
    float y2 = centerY + sin(radians(i)) * (radio + 10);
    line(x1, y1, x2, y2);
  }

  float needleX = centerX + cos(radians(angle)) * (radio - 20);
  float needleY = centerY + sin(radians(angle)) * (radio - 20);
  stroke(255, 0, 0);
  strokeWeight(3);
  line(centerX, centerY, needleX, needleY);

  fill(255);
  noStroke();
  ellipse(centerX, centerY, 10, 10);

  String calidad = corrienteVal < 0.4 ? "NORMAL" : corrienteVal < 0.7 ? "PRECAUCIÓN" : "ALTA";
  color textColor = corrienteVal < 0.4 ? color(0, 180, 0) : corrienteVal < 0.7 ? color(255, 165, 0) : color(255, 0, 0);
  
  stroke(0);  // Color negro para la orilla
  strokeWeight(6);  // Grosor del borde
  noFill();
  arc(centerX, centerY, radio * 2 + 20, radio * 2 + 20, radians(-135), radians(135));

  // titulo------------------------------------------------------------
  myFont = createFont("Arial-Bold", 18); // Cargar la fuente Arial con tamaño 32
  textFont(myFont); // Aplicar la fuente
  fill(textColor);
  text("CORRIENTE: " + calidad, x_aire + 30, y_aire + 640);// titulo
  
  myFont = createFont("Arial-Bold", 20); // Cargar la fuente Arial con tamaño 32
  textFont(myFont); // Aplicar la fuente
  fill(0);
  text(corrienteVal + "  A", x_aire + 50, y_aire + 490); // titulo
  
  //textSize(25);
  //fill(textColor);
  //textAlign(CENTER);
  //text("Corriente: " + calidad, centerX, centerY + 150);
  //textSize(20);
  //fill(255);
  //text(corrienteVal + " A", centerX, centerY + 180);
}

////////////////////////////////////////////////////////////////////////////////////////////////////////

void espacio_aire(){
  fill(255); // fondo del termometro
  stroke(0); // Borde negro
  strokeWeight(3);  
  rect(x_aire, y_aire, 350, 325, 20); // Esquinas redondeadas con radio de 20px
  informacion_SensorCo2();
}

void informacion_SensorCo2(){
  int centerX = x_aire + 170;
  int centerY = y_aire + 145;
  int radio = 120;
  int minCO2 = 0;
  int maxCO2 = 1000;
  float angle = map(gasVal, minCO2, maxCO2, -135, 135);

  for (int i = -135; i <= 135; i++) {
    float lerpFactor = map(i, -135, 135, 0, 1);
    stroke(lerpColor(color(0, 255, 0), color(255, 0, 0), lerpFactor));
    float x1 = centerX + cos(radians(i)) * (radio - 10);
    float y1 = centerY + sin(radians(i)) * (radio - 10);
    float x2 = centerX + cos(radians(i)) * (radio + 10);
    float y2 = centerY + sin(radians(i)) * (radio + 10);
    line(x1, y1, x2, y2);
  }

  float needleX = centerX + cos(radians(angle)) * (radio - 20);
  float needleY = centerY + sin(radians(angle)) * (radio - 20);
  stroke(255, 0, 0);
  strokeWeight(3);
  line(centerX, centerY, needleX, needleY);

  fill(255);
  noStroke(); 
  ellipse(centerX, centerY, 10, 10);

  String calidad = gasVal < 400 ? "BUENA" : gasVal < 600 ? "PRECAUCIÓN" : "MALA";
  color textColor = gasVal < 400 ? color(0, 180, 0) : gasVal < 600 ? color(255, 165, 0) : color(255, 0, 0);
  
  stroke(0);  // Color negro para la orilla
  strokeWeight(6);  // Grosor del borde
  noFill();
  arc(centerX, centerY, radio * 2 + 20, radio * 2 + 20, radians(-135), radians(135));
  
  // titulo------------------------------------------------------------
  myFont = createFont("Arial-Bold", 18); // Cargar la fuente Arial con tamaño 32
  textFont(myFont); // Aplicar la fuente
  fill(textColor);
  text("CALIDAD DEL AIRE: " + calidad, x_aire + 30, y_aire + 305);// titulo
  
  myFont = createFont("Arial-Bold", 20); // Cargar la fuente Arial con tamaño 32
  textFont(myFont); // Aplicar la fuente
  fill(0);
  text(gasVal + "  ppm", x_aire + 50, y_aire + 153); // titulo
  
}
////////////////////////////////////////////////////////////////////////////////////////////////////////

void espacio_luz(){
  
  
  fill(255, 255, 255); // fondo del termometro 143, 200, 255
  stroke(255); // Borde negro
  strokeWeight(3);  
  rect(x_luz, y_luz, 720, 120, 20); // Esquinas redondeadas con radio de 20px
  
  //--------------------------------------------------------------------
  fill(255, 255, 255); // fondo del luz
  stroke(0); // Borde negro
  strokeWeight(4);  
  rect(x_luz + 144, y_luz + 50, 425, 43, 90); // Esquinas redondeadas con radio de 20px
  //--------------------------------------------------------------------
  // definir el colr po el sensor de luz
  int aux_luz = int(luz);
  aux_luz = 100 - aux_luz;
  int r = 55 + aux_luz*2;
  int g = 55 + aux_luz*2;
  int b = aux_luz;
  noStroke(); // Quita el contorno
  fill(r, g, b); // fondo del luz
  
  rect(x_luz + 145 , y_luz + 52, 25 + aux_luz*4, 39, 90); // Esquinas redondeadas con radio de 20px
  
  // titulo ------------------------------------------------------------
  myFont = createFont("Arial-Bold", 16); // Cargar la fuente Arial con tamaño 32
  textFont(myFont); // Aplicar la fuente
  fill(0);
  text("NIVEL DE ILUMINACIÓN: ", x_luz + 230, y_luz + 30); // titulo
  
  myFont = createFont("Arial-Bold", 20); // Cargar la fuente Arial con tamaño 32
  textFont(myFont); // Aplicar la fuente
  fill(0);
  
  String tex_luz = str(100 - luz);
  text(tex_luz + " %", x_luz + 430, y_luz + 31); // titulo
 
  //--------------------------------------------------------------------
  luna();
  sol();
}

void luna(){
  // Dibujar la luna
  fill(141, 141, 141); // Color amarillo claro para la luna
  noStroke(); // Sin contorno
  ellipse(x_luz + 80, y_luz + 60, 90, 90); // Círculo grande para la luna
  
  // Detalles de la luna (cráteres)
  fill(75, 75, 75); // Color más oscuro para los cráteres
  
  // Círculos pequeños para los detalles
  ellipse(x_luz + 60, y_luz + 40, 14, 14); // Cráter 1
  ellipse(x_luz + 100, y_luz + 80, 10, 10); // Cráter 2
  ellipse(x_luz + 100, y_luz + 40, 11, 11); // Cráter 3
  ellipse(x_luz + 65, y_luz + 80, 20, 20); // Cráter 4
  ellipse(x_luz + 80, y_luz + 55, 6, 6); // Cráter 5
}

void sol(){
  float x = x_luz + 640;
  float y = y_luz + 60;
  float radioSol = 40;  // Radio del sol
  float radioRayos = 50; // Radio donde terminan los rayos
  
  // Dibujar el sol (círculo central)
  fill(255, 204, 0); // Amarillo brillante
  noStroke();
  ellipse(x, y, radioSol * 2, radioSol * 2);
  
  // Dibujar los rayos del sol
  stroke(255, 204, 0); // Color amarillo para los rayos
  strokeWeight(3);
  
  for (float angulo = 0; angulo < TWO_PI; angulo += PI / 8) {
    float xInicio = x + cos(angulo) * radioSol;
    float yInicio = y + sin(angulo) * radioSol;
    float xFin = x + cos(angulo) * radioRayos;
    float yFin = y + sin(angulo) * radioRayos;
    
    line(xInicio, yInicio, xFin, yFin);
  }
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
void espacio_termometro(){
  fill(255, 255, 255); // fondo del termometro
  stroke(0); // Borde negro
  strokeWeight(3);  
  rect(x_temp, y_temp, 200, 440, 20); // Esquinas redondeadas con radio de 20px
  
  // titulo del termometo--------------------------------------------------------------
  myFont = createFont("Arial-Bold", 16); // Cargar la fuente Arial con tamaño 32
  textFont(myFont); // Aplicar la fuente
  fill(0);
  text("TEMPERATURA", x_temp + 40, y_temp + 30); // titulo
  text("C", x_temp + 89, y_temp + 52); // titulo

  myFont = createFont("Arial-Bold", 12); // Cargar la fuente Arial con tamaño
  textFont(myFont); // Aplicar la fuente
  fill(0);
  text("o", x_temp + 82, y_temp + 47); // texto c
  //-----------------------------------------------------------------------------------
  termometro();
  texto_temperatura();
}

void termometro(){
  if(temperatura > 106){ // mantener un limimte a la temperatura
    temperatura = 106;
  }
  if (temperatura < 0){
    temperatura = 0;
  }
  float temp_termo = (temperatura) * 2.5 + 30;
  // primero dibunar lineas
  lineas_Temperatura();
  
   // Dibujar el termómetro
  stroke(0);
  strokeWeight(3);
  fill(200); 
  rect(x_temp + 75, y_temp +60, 40, 300,90); // Tubo del termómetro

  // Dibujar el nivel de temperatura,
  // definir el color de la temperatura----------------------------------------------------
  int r = 0, g = 0, b = 0;
  int aux_temp = int(temperatura);
  if(temperatura <= 20){
    r = aux_temp  * 4;
    g = 130 + (aux_temp * 3) ;
    b = 255;
  }
  if((temperatura > 20) && (temperatura <=40) ){
      r = (aux_temp-20)  * 15 ;
      g = 190 + ((aux_temp-20) * 3) +5;
      b = 255;
   }
   if((temperatura > 40) && (temperatura <=60) ){
      r = 255;
      g = 255;
      b = 255 - ((aux_temp-40) * 12); 
   }
   if((temperatura > 60) && (temperatura <=100)){
      r = 255;
      g = 255 - ((aux_temp-60)*6);
      b = 15; 
   }
   if((temperatura > 100)){
      r = 0;
      g = 80;
      b = 255;
   }
  // ---------------------------------------------------------------------------------------
  fill(r, g, b); // Color rojo para la temperatura
  rect(x_temp + 75, y_temp + 355 - temp_termo, 40, temp_termo,90); // Altura depende de temp
  
  // Dibujar la base redonda
  fill(r, g, b);
  ellipse(x_temp + 95, y_temp + 360, 60, 60);

}

void lineas_Temperatura(){
  stroke(0); // Color negro
  strokeWeight(2); // Grosor de las líneas

  // Dibujar varias líneas seguidas
  line(x_temp + 56, y_temp + 80, x_temp + 134, y_temp + 80); // Linea 100 c
  line(x_temp + 56, y_temp + 105, x_temp + 134, y_temp + 105); // Linea 90 c
  line(x_temp + 56, y_temp + 130, x_temp + 134, y_temp + 130); // Linea 80 c
  line(x_temp + 56, y_temp + 155, x_temp + 134, y_temp + 155); // Linea 70 c
  line(x_temp + 56, y_temp + 180, x_temp + 134, y_temp + 180); // Linea 60 c
  line(x_temp + 56, y_temp + 205, x_temp + 134, y_temp + 205); // Linea 50 c
  line(x_temp + 56, y_temp + 230, x_temp + 134, y_temp + 230); // Linea 40 c
  line(x_temp + 56, y_temp + 255, x_temp + 134, y_temp + 255); // Linea 30 c
  line(x_temp + 56, y_temp + 280, x_temp + 134, y_temp + 280); // Linea 20 c
  line(x_temp + 56, y_temp + 305, x_temp + 134, y_temp + 305); // Linea 10 c
  line(x_temp + 56, y_temp + 330, x_temp + 134, y_temp + 330); // Línea 0 c
  
  texto_lineas_temperatura();
}

void texto_lineas_temperatura(){
  myFont = createFont("Arial-Bold", 14); // Cargar la fuente Arial con tamaño 
  textFont(myFont); // Aplicar la fuente
  
  fill(0);
  text("50", x_temp + 15, y_temp + 85); // texto 100 c
  text("45", x_temp + 155, y_temp + 110); // texto 90 c
  text("40", x_temp + 20, y_temp + 135); // texto 80 c
  text("35", x_temp + 155, y_temp + 160); // texto 70 c
  text("30", x_temp + 20, y_temp + 185); // texto 60 c
  text("25", x_temp + 155, y_temp + 210); // texto 50 c
  text("20", x_temp + 20, y_temp + 235); // texto 40 c
  text("15", x_temp + 155, y_temp + 260); // texto 30 c
  text("10", x_temp + 20, y_temp + 285); // texto 20 c
  text("5", x_temp + 155, y_temp + 310); // texto 10 c
  text("0", x_temp + 20, y_temp + 335); // texto 0 c
 
}

void texto_temperatura(){
  String tex_temperatura = str(temperatura/2);
  //------------------------------------------------------------------------------------
  myFont = createFont("Arial-Bold", 18); // Cargar la fuente Arial con tamaño
  textFont(myFont); // Aplicar la fuente
  fill(0);
  text("C", x_temp + 125, y_temp + 420); // texto c
  //------------------------------------------------------------------------------------
  myFont = createFont("Arial-Bold", 24); // Cargar la fuente Arial con tamaño
  textFont(myFont); // Aplicar la fuente
  fill(0);
  text(tex_temperatura, x_temp + 50, y_temp + 420); // texto temperatura numero
  //------------------------------------------------------------------------------------
  myFont = createFont("Arial-Bold", 12); // Cargar la fuente Arial con tamaño
  textFont(myFont); // Aplicar la fuente
  fill(0);
  text("o", x_temp + 119, y_temp + 413); // texto c
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////

void espacio_humedad(){
  fill(255, 255, 255); // fondo del termometro
  stroke(0); // Borde negro
  strokeWeight(3);  
  rect(x_hume, y_hume, 200, 440, 20); // Esquinas redondeadas con radio de 20px
  
  // titulo del termometo--------------------------------------------------------------
  myFont = createFont("Arial-Bold", 16); // Cargar la fuente Arial con tamaño 32
  textFont(myFont); // Aplicar la fuente
  fill(0);
  text("HUMEDAD", x_hume + 60, y_hume + 30); // titulo
  text("%", x_hume + 89, y_hume + 52); // titulo
  //-----------------------------------------------------------------------------------
  te_humedad();
  texto_humedad();
}

void te_humedad(){
  if(humedad > 106){ // mantener un limimte a la temperatura
    humedad = 100;
  }
  if (humedad < 0){
    humedad = 0;
  }
  float temp_hume = (humedad) * 2.5 + 30;
  // primero dibunar lineas
  
  lineas_Humedad();
  
  // Dibujar el termómetro
  stroke(0);
  strokeWeight(3);
  fill(200); 
  rect(x_hume + 75, y_hume +60, 40, 300,90); // Tubo del termómetro

  // Dibujar el nivel de temperatura,
  // definir el color de la temperatura----------------------------------------------------
  int r = 0, g = 0, b = 0;
  int aux_hume = int(humedad);
  if(humedad <= 0){
    r = 240;
    g = 255;
    b = 255;
  }
  if((humedad >0) && (humedad < 100)){
    r = 230 - aux_hume*2;
    g = 240 - aux_hume - aux_hume/2; 
    b = 255;
  }
  if (humedad >= 100){
    r = 0;
    g = 80;
    b = 255;
  }
  // ---------------------------------------------------------------------------------------
  fill(r, g, b); // Color rojo para la temperatura
  rect(x_hume + 75, y_hume + 355 - temp_hume, 40, temp_hume,90); // Altura depende de temp
  
  // Dibujar la base redonda
  fill(r, g, b);
  ellipse(x_hume + 95, y_hume + 360, 60, 60);
}

void lineas_Humedad(){
  stroke(0); // Color negro
  strokeWeight(2); // Grosor de las líneas

  // Dibujar varias líneas seguidas
  line(x_hume + 56, y_hume + 80, x_hume + 134, y_hume + 80); // Linea 100 %
  line(x_hume + 56, y_hume + 105, x_hume + 134, y_hume + 105); // Linea 90 %
  line(x_hume + 56, y_hume + 130, x_hume + 134, y_hume + 130); // Linea 80 %
  line(x_hume + 56, y_hume + 155, x_hume + 134, y_hume + 155); // Linea 70 %
  line(x_hume + 56, y_hume + 180, x_hume + 134, y_hume + 180); // Linea 60 %
  line(x_hume + 56, y_hume + 205, x_hume + 134, y_hume + 205); // Linea 50 %
  line(x_hume + 56, y_hume + 230, x_hume + 134, y_hume + 230); // Linea 40 %
  line(x_hume + 56, y_hume + 255, x_hume + 134, y_hume + 255); // Linea 30 %
  line(x_hume + 56, y_hume + 280, x_hume + 134, y_hume + 280); // Linea 20 %
  line(x_hume + 56, y_hume + 305, x_hume + 134, y_hume + 305); // Linea 10 %
  line(x_hume + 56, y_hume + 330, x_hume + 134, y_hume + 330); // Línea 0 %
  
  texto_lineas_humedad();
}

void texto_lineas_humedad(){
  myFont = createFont("Arial-Bold", 14); // Cargar la fuente Arial con tamaño 
  textFont(myFont); // Aplicar la fuente
  
  fill(0);
  text("100", x_hume + 15, y_hume + 85); // texto 100 %
  text("90", x_hume + 155, y_hume + 110); // texto 90 %
  text("80", x_hume + 20, y_hume + 135); // texto 80 %
  text("70", x_hume + 155, y_hume + 160); // texto 70 %
  text("60", x_hume + 20, y_hume + 185); // texto 60 %
  text("50", x_hume + 155, y_hume + 210); // texto 50 %
  text("40", x_hume + 20, y_hume + 235); // texto 40 %
  text("30", x_hume + 155, y_hume + 260); // texto 30 %
  text("20", x_hume + 20, y_hume + 285); // texto 20 %
  text("10", x_hume + 155, y_hume + 310); // texto 10 %
  text("0", x_hume + 20, y_hume + 335); // texto 0 %
}

void texto_humedad(){
  String tex_humedad = str(humedad);
  //------------------------------------------------------------------------------------
  myFont = createFont("Arial-Bold", 20); // Cargar la fuente Arial con tamaño
  textFont(myFont); // Aplicar la fuente
  fill(0);
  text("%", x_hume + 125, y_hume + 420); // texto c
  //------------------------------------------------------------------------------------
  myFont = createFont("Arial-Bold", 24); // Cargar la fuente Arial con tamaño
  textFont(myFont); // Aplicar la fuente
  fill(0);
  text(tex_humedad, x_hume + 50, y_hume + 420); // texto temperatura numero
  //------------------------------------------------------------------------------------
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////

void espacio_sensor_movimiento(){
  fill(255, 255, 255); // fondo del termometro
  stroke(0); // Borde negro
  strokeWeight(3);  
  rect(x_mov, y_mov, 300, 440, 20); // Esquinas redondeadas con radio de 20px
  
  // titulo del termometo--------------------------------------------------------------
  myFont = createFont("Arial-Bold", 16); // Cargar la fuente Arial con tamaño 32
  textFont(myFont); // Aplicar la fuente
  fill(0);
  text("SENSOR DE MOVIMIENTO", x_mov + 50, y_mov + 30); // titulo
  text("metros (m)", x_mov + 110, y_mov + 52); // titulo

  //-----------------------------------------------------------------------------------
  
  sensor_movimiento();
}

void sensor_movimiento(){
  stroke(0, 0, 0); // Color del borde (rojo)
  strokeWeight(4);   // Grosor del borde
  fill(10, 120, 30);
  arc(x_mov + 150, y_mov + 360, 550, 550, radians(250), radians(290)); // Semicírculo superior
  
  // linea del contrno
  stroke(0); // Color negro
  strokeWeight(4); // Grosor de las líneas
  line(x_mov + 54, y_mov + 102, x_mov + 150, y_mov + 360); // Linea inquierza del semicirculo 
  line(x_mov + 245, y_mov + 102, x_mov + 150, y_mov + 360); // Linea derecha del semicirculo 
  
  line(x_mov + 51, y_mov + 93, x_mov + 54, y_mov + 102); // 
  line(x_mov + 249, y_mov + 93, x_mov + 245, y_mov + 102);
  
  stroke(0); // Color negro
  strokeWeight(2); // Grosor de las líneas
  line(x_mov + 150, y_mov + 73, x_mov + 150, y_mov + 360);
  line(x_mov + 98, y_mov + 77, x_mov + 150, y_mov + 360);
  line(x_mov + 202, y_mov + 77, x_mov + 150, y_mov + 360);
  
  rang_senso += 10;
  if(rang_senso >550){
    rang_senso = 50;
  }
   
  stroke(0, 255, 50); // Color del 
  strokeWeight(6);   // Grosor del borde
  noFill(); // Sin relleno para que solo se vea la línea arqueada
  arc(x_mov + 150, y_mov + 360, rang_senso, rang_senso, radians(250), radians(290)); // Semicírculo superior
  
  //
  if((distancia_mov > 0) && (distancia_mov <= 100)){
    int aux_distancia = int(distancia_mov)*10;
    noStroke(); // Elimina el borde
    fill(0, 255, 50); // Color azul
    ellipse(x_mov + 150, y_mov + 305- aux_distancia, 20, 20); // rango 200
  }
  
  persona();
  panel_distancia();
}

void persona(){
  noStroke(); // Elimina el contorno

  fill(200, 100, 50); // Color del cuerpo (RGB)
  arc(x_mov +80, y_mov + 430, 110, 80, PI, TWO_PI); // Semicírculo para los hombros

  fill(255, 200, 150); // Color de la cabeza (RGB)
  ellipse(x_mov + 80, y_mov + 370, 65, 65); // Círculo para la cabeza
  
  myFont = createFont("Arial-Bold", 16); // Cargar la fuente Arial con tamaño 32
  textFont(myFont); // Aplicar la fuente
  fill(0);
  text("No. Accesos \n registrados  ", x_mov + 21, y_mov + 310); // titulo
  
  myFont = createFont("Arial-Bold", 23); // Cargar la fuente Arial 
  textFont(myFont); // Aplicar la fuente
  fill(0);
  String aux_num_personas = str(numero_personas);
  int num_caracteres = aux_num_personas.length();
  text(aux_num_personas, x_mov + 79 - num_caracteres*6, y_mov + 378); // titulo
}

void panel_distancia(){
  fill(10, 120, 30); // fondo del panel 
  stroke(0); // Borde negro
  strokeWeight(4);  
  rect(x_mov + 170, y_mov + 330, 120, 100, 20); // Esquinas redondeadas con radio de 20px
  
  myFont = createFont("Arial-Bold", 30); // Cargar la fuente Arial con tamaño 
  textFont(myFont); // Aplicar la fuente
  fill(255);
  String tex_distancia = str(distancia_mov);
  int num_caracter = tex_distancia.length();
  text(tex_distancia, x_mov + 215 - num_caracter*5, y_mov + 380); // titulo
  
  myFont = createFont("Arial-Bold", 18); // Cargar la fuente Arial con tamaño 
  textFont(myFont); // Aplicar la fuente
  fill(255);
  text("metros", x_mov + 202, y_mov + 410); // titulo
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////

void serialEvent(Serial p) {
  data = p.readStringUntil('\n'); // Leer línea completa
  if (data != null) {
    data = trim(data);
    String[] values = split(data, ","); 
    if (values.length == 6) { 
      gasVal = int(values[0]); 
      corrienteVal = float(values[1]);
      humedad = float(values[2]);
      temperatura = 2*(float(values[3]));
      distancia_mov = int(values[4]);
      luz = int(int(values[5])/15);
      
      if (distancia_mov >= 19){
        distancia_mov = 0;
      }else{
       numero_personas ++; 
      }
    }
  }
}
