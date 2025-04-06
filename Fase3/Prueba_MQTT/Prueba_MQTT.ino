#include <WiFi.h>
#include <PubSubClient.h>
#include <HardwareSerial.h>

//Esto es para usar los pines rx y tx
HardwareSerial SerialESP(2); // Usaremos UART2 (puedes usar 1 también)

WiFiClient esp32Client;
PubSubClient mqttClient(esp32Client);

//Son las credenciales de nuestra red 
const char* ssid     = "Galaxy A30s7840";
const char* password = "1234mike";

//Credenciales del broker gratuito
char *server = "broker.emqx.io";
int port = 1883;

//Pines de prueba
int ledpin= 11;
int fotopin=10;

int var = 0;
int ledval = 0;
int fotoval = 0;
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
  Serial.print("Mensaje recibido [");
  Serial.print(topic);
  Serial.print("] ");

  char payload_string[length + 1];
  
  int resultI;

  memcpy(payload_string, payload, length);
  payload_string[length] = '\0';
  resultI = atoi(payload_string);
  
  var = resultI;

  resultS = "";
  
  for (int i=0;i<length;i++) {
    resultS= resultS + (char)payload[i];
  }
  Serial.println();
}



void reconnect() {
  while (!mqttClient.connected()) {
    Serial.print("Intentando conectarse MQTT... ");

    if (mqttClient.connect("arduinoClient")) {
      //Serial.println("Conectado");

      //Se conecta a un Topico
      mqttClient.subscribe("Entrada/01");
      Serial.println("Conectado");
    } else {
      Serial.print("Fallo, rc=");
      Serial.print(mqttClient.state());
      Serial.println(" intentar de nuevo en 5 segundos");
      // Wait 5 seconds before retrying
      delay(5000);
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
  SerialESP.begin(9600, SERIAL_8N1, 17, 16); // RX=17, TX=16 (ajusta si usas otros pines)
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
  if (SerialESP.available()) {
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
      Serial.println("Temperatura: " + partes[0]);
      Serial.println("Humedad: " + partes[1]);
      Serial.println("Gas: " + partes[2]);
      Serial.println("Iluminación: " + partes[3]);
      Serial.println("Personas: " + partes[4]);
      Serial.println("Corriente: " + partes[5]);

      //Estos datos se tendrian que enviar al MQTTX
    }
  }


  //Esto es para encender un led solo es prueva de un topico
  Serial.print("Led: ");
  Serial.println(var);

  if (var == 0) {
    digitalWrite(ledpin, LOW);
  } else if (var == 1) {
    digitalWrite(ledpin, HIGH);
  }

  //Aca se envian datos al MQTTX, se envia el valor de una foto resistecia como prueba
  unsigned long currentMillis = millis();
  if (currentMillis - previousMillis >= interval) {
    previousMillis = currentMillis;

    fotoval = analogRead(fotopin);
    Serial.print("Foto: ");
    Serial.println(fotoval);

    sprintf(datos, "Valor fotoresistencia: %d", fotoval);
    mqttClient.publish("salida/01", datos);
  }
}
