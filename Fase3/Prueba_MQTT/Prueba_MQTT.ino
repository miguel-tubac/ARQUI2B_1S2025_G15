#include <WiFi.h>
#include <PubSubClient.h>
#include <HardwareSerial.h>

//Esto es para usar los pines rx y tx
HardwareSerial SerialESP(2); // Usaremos UART2 (puedes usar 1 también)

// Usamos UART1: RX=16 (entrada), TX no se usa
//HardwareSerial SerialMega(1);

WiFiClient esp32Client;
PubSubClient mqttClient(esp32Client);

//Son las credenciales de nuestra red 
// const char* ssid     = "Galaxy A30s7840";
// const char* password = "1234mike";
const char* ssid     = "SIN_CONEXION01";
const char* password = "chepetepresta";

//Credenciales del broker gratuito
char *server = "broker.emqx.io";
int port = 1883;

//Pines de prueba
int ledpin= 11;

//Pines para el servo
int servopin= 2;

int var = 0;
int var2 = 0;
int ledval = 0;
char datos[40];
String resultS = "";

void wifiInit() {
    Serial.print("Conectándose a ");
    Serial.println(ssid);

    WiFi.begin(ssid, password);

    while (WiFi.status() != WL_CONNECTED) {
      Serial.print(".");
        delay(500);  
    }
    Serial.println("");
    Serial.println("Conectado a WiFi");
    Serial.println("Dirección IP: ");
    Serial.println(WiFi.localIP());
  }

void callback(char* topic, byte* payload, unsigned int length) {
  // Solo procesamos el payload si tiene contenido
  if (length > 0) {
    Serial.print("Mensaje recibido [");
    Serial.print(topic);
    Serial.print("] ");

    if (strcmp(topic, "Entrada/01")) == 0{
      char payload_string[length + 1];
      memcpy(payload_string, payload, length);
      payload_string[length] = '\0';

      int resultI = atoi(payload_string);
      var = resultI;

      Serial.print("Interpretado como entero: ");
      Serial.println(var);
    }else if(strcmp(topic, "Entrada/02")) == 0{
      char payload_string[length + 1];
      memcpy(payload_string, payload, length);
      payload_string[length] = '\0';

      int resultI = atoi(payload_string);
      var2 = resultI;

      Serial.print("Interpretado como entero: ");
      Serial.println(var2);
    }

  } else {
    Serial.println("No se recibió payload (vacío)");
  }
}



void reconnect() {
  while (!mqttClient.connected()) {
    Serial.print("Intentando conectarse MQTT... ");

    if (mqttClient.connect("arduinoClient")) {
      //Serial.println("Conectado");

      //Se conecta a un Topico
      mqttClient.subscribe("Entrada/01");
      mqttClient.subscribe("Entrada/02");
      Serial.println("Conectado");
    } else {
      Serial.print("Fallo, rc=");
      Serial.print(mqttClient.state());
      Serial.println(" intentar de nuevo en 1 segundos");
      // Wait 5 seconds before retrying
      delay(1000);
    }
  }
}

void setup(){
  pinMode(ledpin,OUTPUT);
  Serial.begin(115200);
  delay(10);
  wifiInit();
  mqttClient.setCallback(callback);
  mqttClient.setServer(server, port);

  //Esto para recibir los datos del Arduino Mega, tomar que se tomo UART2
  SerialESP.begin(9600, SERIAL_8N1, 4, -1); // RX=17, TX=16 (ajusta si usas otros pines)
}


unsigned long previousMillis = 0;
const long interval = 9000;

void loop(){
  //Aca se avlua la conexion al MQTT
  if (!mqttClient.connected()) {
    reconnect();
  }
  mqttClient.loop();


  //Aca se obtien los datos del Arduino mega mediante uart es decir rx y tx
  if (SerialESP.available() > 0) {
    String datos = SerialESP.readStringUntil('\n');  // Leer línea completa
    Serial.println("Datos recibidos: " + datos);

    //Es es un contador
    int index = 0;
    String partes[6];

    // Separar en partes
    while (datos.length() > 0 && index < 6) {
      int sep = datos.indexOf(',');
      if (sep == -1) {
        partes[index++] = datos;
        break;
      }
      partes[index++] = datos.substring(0, sep);
      datos = datos.substring(sep + 1);
    }

    // Convertir strings a números
    if (index == 6) {
      // Mostrar resultados
      // Serial.println("Temperatura: " + partes[0]);
      // Serial.println("Humedad: " + partes[1]);
      // Serial.println("Gas: " + partes[2]);
      // Serial.println("Iluminación: " + partes[3]);
      // Serial.println("Personas: " + partes[4]);
      // Serial.println("Corriente: " + partes[5]);

      //Estos datos se tendrian que enviar al MQTTX
      mqttClient.publish("sensor/temperatura", partes[0].c_str());
      mqttClient.publish("sensor/humedad", partes[1].c_str());
      mqttClient.publish("sensor/gas", partes[2].c_str());
      mqttClient.publish("sensor/luz", partes[3].c_str());
      mqttClient.publish("sensor/personas", partes[4].c_str());
      mqttClient.publish("sensor/corriente", partes[5].c_str());
    }
  }


  

  if (var == 0) {
    digitalWrite(ledpin, LOW);
  } else if (var == 1) {
    // Serial.print("Led: ");
    // Serial.println(var);
    digitalWrite(ledpin, HIGH);
  }

  if (var2 == 0) {
    digitalWrite(servopin, LOW);
  } else if (var2 == 1) {
    // Serial.print("Led: ");
    // Serial.println(var);
    digitalWrite(servopin, HIGH);
  }
  

  //Aca se envian datos al MQTTX, se envia el valor de una foto resistecia como prueba
  unsigned long currentMillis = millis();
  if (currentMillis - previousMillis >= interval) {
    //Esto para enviar los datos cada ciertos segundos
    previousMillis = currentMillis;

    //Esto es para encender un led solo es prueva de un topico
    Serial.print("Led: ");
    Serial.println(var);
  
  }
}
