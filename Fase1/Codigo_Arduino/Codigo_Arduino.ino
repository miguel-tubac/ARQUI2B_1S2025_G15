int gasVal;
volatile int velocidad = 500;
const int maxima = 5000;
const int minima = 100;
const int aumenta = 100;
int serial=0;
float sensibilidad = 0.185; //Ajuste de sensibilidad para sensor de 5A(sensor de corriente)
float corriente= 0.0;

void setup() {
  Serial.begin(9600);

  pinMode(2, INPUT_PULLUP);  // Activa resistencia pull-up interna
  pinMode(3, INPUT_PULLUP);
  pinMode(21, INPUT_PULLUP);

  attachInterrupt(digitalPinToInterrupt(3), delayMas, FALLING); // Cambio a FALLING
  attachInterrupt(digitalPinToInterrupt(2), delayMenos, RISING); // Cambio a FALLING
  attachInterrupt(digitalPinToInterrupt(21), saludoFunc, FALLING);
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
  
  Serial.print(",");
  Serial.println(velocidad);
  
  delay(velocidad);
}


// ISR pin 2, disminuye la velocidad
void delayMenos()
{
  velocidad = velocidad - aumenta;
  if (velocidad < minima) velocidad = minima;
  Serial.println("ISR2 MENOS FLANCO UP");
}
 
// ISR pin 3, aumenta la velocidad
void delayMas()
{
  velocidad = velocidad + aumenta;
  if (velocidad > maxima) velocidad = maxima;
  Serial.println("ISR3 MAS BAJADA");
}

void saludoFunc(){
  Serial.println("ISR18 :3 :3 :3 CAMBIO");
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
  return intencidad;
}