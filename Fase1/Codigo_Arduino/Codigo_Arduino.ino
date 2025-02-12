int gasVal;
volatile int velocidad = 500;
const int maxima = 5000;
const int minima = 100;
const int aumenta = 100;
int serial=0;

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
  gasVal=analogRead(A0);
  //Serial.print("gas> ");
  Serial.print(gasVal);
  
  //Serial.print("vel> ");
  Serial.print(",");
  Serial.println(velocidad);
  //Serial.print("\t");
  
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