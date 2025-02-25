int gasVal;
volatile int velocidad = 500;
const int maxima = 5000;
const int minima = 100;
const int aumenta = 100;
int serial=0;
float sensibilidad = 0.185; //Ajuste de sensibilidad para sensor de 5A(sensor de corriente)
float corriente= 0.0;
int sensor = A2;
int lectura;


// Incluimos librería
#include <DHT.h>
 
// Definimos el pin digital donde se conecta el sensor
#define DHTPIN 4
// Dependiendo del tipo de sensor
#define DHTTYPE DHT11
// Inicializamos el sensor DHT11
DHT dht(DHTPIN, DHTTYPE);
float h; 
float t;



// incluir libreria
#include <Wire.h>
// Pines sensor izquierdo
int Trigger_izq = 11;
int Echo_izq = 10;

int izquierdo_duracion, izquierdo_distancia;


//Parte de la lcd
#include <LiquidCrystal_I2C.h>
#include <Wire.h>
LiquidCrystal_I2C lcd(0x27,16,2);

//Para los botones
volatile bool botonPresionado1 = false;
volatile bool botonPresionado2 = false;
volatile bool botonPresionado3 = false;

//Para guardar los datos en la Eprom
#include <EEPROM.h>
float tem_eeprom = 0.0;
float hum_eeprom = 0.0;
float corr_eeprom = 0.0;
int gas_eeprom = 0;
int luz_eepro = 0;

//Pines de las luces led de advertencia
int pin_azul = 26;
int pin_amarillo = 27;
int pin_rojo = 28;


void setup() {
  Serial.begin(9600);

  pinMode(2, INPUT_PULLUP);  // Activa resistencia pull-up interna
  pinMode(3, INPUT_PULLUP);
  pinMode(18, INPUT_PULLUP);

  attachInterrupt(digitalPinToInterrupt(3), setFlag3, FALLING); // Cambio a FALLING
  attachInterrupt(digitalPinToInterrupt(2), setFlag2, RISING); // Cambio a FALLING
  attachInterrupt(digitalPinToInterrupt(18), setFlag1, FALLING);

  // Se declaran los pines sensor izquierdo como Entradas/Salidas
  pinMode(Trigger_izq, OUTPUT);
  pinMode(Echo_izq, INPUT);
  

  // Comenzamos el sensor DHT
  dht.begin();

  lcd.init();
  lcd.backlight();

  //Declaracion de pines led
  pinMode(pin_azul, OUTPUT);
  pinMode(pin_amarillo, OUTPUT);
  pinMode(pin_rojo, OUTPUT);
}

void loop() {
  //Este es la parte del sensor de oxigeno
  int sensorValue = analogRead(A0);
  float voltage = sensorValue * (5.0 / 1023.0);
  gasVal = voltage * 200; // Conversión aproximada para CO2
  Serial.print(gasVal);// Se imprime en la consola el valor en ppm

  //Esta es la parte del sensor de corriente
  corriente = promedioCorriente(500); //Esto me calcula el promedio de 500 mediciones del sensor de corriente
  Serial.print(",");
  Serial.print(corriente);


  // Leemos la humedad relativa
  h = dht.readHumidity();
  // Leemos la temperatura en grados centígrados (por defecto)
  t = dht.readTemperature();
 
  // Comprobamos si ha habido algún error en la lectura
  if (isnan(h) || isnan(t)) {
    Serial.println("Error obteniendo los datos del sensor DHT11");
    return;
  }
 
  // Calcular el índice de calor en grados centígrados
  float hic = dht.computeHeatIndex(t, h, false);
 
  //Serial.print("Humedad: ");
  Serial.print(",");
  Serial.print(h);
  //Serial.print("Temperatura: ");
  Serial.print(",");
  Serial.print(t);

  
  /// Variables Para medir distancia con sensor izquierdo
  digitalWrite(Trigger_izq, HIGH);
  delayMicroseconds(10);
  digitalWrite(Trigger_izq, LOW);
  izquierdo_duracion = pulseIn(Echo_izq, HIGH);
  izquierdo_distancia = (izquierdo_duracion/2) / 29.1;
  Serial.print(",");
  Serial.print(izquierdo_distancia);
  
  
  lectura = analogRead(sensor);
  Serial.print(",");
  Serial.println(lectura);

  if (botonPresionado2) {
    botonPresionado2 = false; 
    escribir_Eprom();  
  }

  if (botonPresionado3) {
    botonPresionado3 = false; 
    leer_Eprom();  
  }

  if (botonPresionado1) {
    botonPresionado1 = false; 
    mostrar_datos();  
  }


  if(t >= 30){ // led aviso temperatura
    digitalWrite(pin_rojo, HIGH);
  }else{
    digitalWrite(pin_rojo, LOW);
  }

  if(h > 60){ // led aviso humedad
    digitalWrite(pin_azul, HIGH);
  }else{
    digitalWrite(pin_azul, LOW);
  }

  if(corriente > 0.40){ // led aviso corriente
    digitalWrite(pin_amarillo, HIGH);
  }else{
    digitalWrite(pin_amarillo, LOW);
  }
  
  loop_lcd();

  delay(1000);
}


// ISR pin 2, guardar datos en la eprom
void setFlag2() {
  botonPresionado2 = true;  // ISR solo cambia la bandera
}

void escribir_Eprom(){
  EEPROM.put(0, t);  
  EEPROM.put(5, h); 
  EEPROM.put(10, corriente);
  EEPROM.put(15, gasVal);
  EEPROM.put(20, lectura);
  Serial.println(".......Datos guardados......");
  lcd.clear();
  lcd.setCursor(0,0);
  lcd.print("Guardando datos");
  delay(2000);
  lcd.clear();
}

 
// ISR pin 3, obtiene los valores de la Eprom
void setFlag3() {
  botonPresionado3 = true;  // ISR solo cambia la bandera
}

void leer_Eprom(){
  EEPROM.get(0, tem_eeprom);
  EEPROM.get(5, hum_eeprom);
  EEPROM.get(10, corr_eeprom);
  EEPROM.get(15, gas_eeprom);
  EEPROM.get(20, luz_eepro);
  Serial.println(".......Datos obtenidos......");
  lcd.clear();
  lcd.setCursor(0,0);
  lcd.print("Obteniendo datos");
  delay(2000);
  lcd.clear();
}


//En esta parte se carga el mesaje a la lcd
void setFlag1() {
  botonPresionado1 = true;  // ISR solo cambia la bandera
}

void mostrar_datos(){
  lcd.clear();
  lcd.setCursor(0,0);
  lcd.print("T:");
  lcd.print(String(tem_eeprom));
  lcd.print("C");
  lcd.print(",H:");
  lcd.print(String(hum_eeprom));
  lcd.setCursor(0,1);
  lcd.print("Aire: ");
  lcd.print(String(gas_eeprom));
  lcd.print(" ppm");
  Serial.println("....Mostrando datos........");
  delay(3000);
}

void loop_lcd(){
  /*EEPROM.put(0, t);  
  EEPROM.put(5, h); 
  EEPROM.put(10, corriente);
  EEPROM.put(15, gasVal);
  EEPROM.put(20, lectura);
  Serial.println(".......Datos guardados......");
  lcd.clear();
  lcd.setCursor(0,0);
  lcd.print("Guardando datos");
  delay(1500);
  lcd.clear();*/
  lcd.clear();
  lcd.setCursor(0,0);
  lcd.print("T:");
  lcd.print(String(t));
  lcd.print("C");
  lcd.print(",H:");
  lcd.print(String(h));
  lcd.setCursor(0,1);
  lcd.print("Aire: ");
  lcd.print(String(gasVal));
  lcd.print(" ppm");
}



//Funcion para promediar el valor de la corriente
float promedioCorriente(int muestra){
  float sensorA1;
  float intencidad=0;
  for(int i=0;i<muestra;i++){
    sensorA1 = analogRead(A1) * (5.0/1023.0);//Leemos el sensor de corriente
    intencidad=intencidad+(sensorA1-2.5)/sensibilidad; //Este es el caclculo para obtener el valor de consumo
  }
  intencidad=intencidad/muestra;
  if(intencidad < 0){
    intencidad = -1*intencidad;
  }
  return intencidad;
}