#include <WiFi.h>
#include <HTTPClient.h>
#include "DHT.h"
#include <ArduinoJson.h>

#define DHTPIN 4
#define DHTTYPE DHT11
DHT dht(DHTPIN, DHTTYPE);

#define RELAY 5
#define FAN 18

const char* ssid = "SEU_WIFI";
const char* password = "SUA_SENHA";
const char* server = "http://IP_DO_SERVIDOR:3000/sensor-data";

float temperaturaAtual = 25.0;
float setpoint = 65.0;
bool releLigado = false;
unsigned long fanDesligaTimer = 0;

void setup() {
  Serial.begin(115200);
  dht.begin();
  pinMode(RELAY, OUTPUT);
  pinMode(FAN, OUTPUT);
  digitalWrite(RELAY, LOW);
  digitalWrite(FAN, LOW);

  WiFi.begin(ssid,password);
  Serial.print("Conectando Wi-Fi");
  while(WiFi.status()!=WL_CONNECTED){ 
    delay(500); 
    Serial.print(".");
  }
  Serial.println("\nWiFi conectado!");
}

void loop() {
  // Reconexão simples de Wi-Fi
  if(WiFi.status()!=WL_CONNECTED){
    Serial.println("Reconectando Wi-Fi...");
    WiFi.disconnect();
    WiFi.begin(ssid,password);
  }

  float t = dht.readTemperature();
  if (isnan(t)) {
    Serial.println("Falha no sensor!");
    digitalWrite(RELAY, LOW);
    digitalWrite(FAN, LOW);
    delay(2000);
    return;
  }
  temperaturaAtual = t;
  Serial.println("Temp atual: " + String(temperaturaAtual));

  // Envia temperatura e recebe setpoint
  if(WiFi.status()==WL_CONNECTED){
    HTTPClient http;
    http.begin(server);
    http.addHeader("Content-Type","application/json");
    http.addHeader("X-API-Key", "desidratador_esp32_2026");
    String json = "{\"temperatura\":"+String(temperaturaAtual)+"}";
    int code = http.POST(json);
    if(code==200){
      String resp = http.getString();
      StaticJsonDocument<200> doc;
      DeserializationError err = deserializeJson(doc, resp);
      if(!err){
        setpoint = doc["setpoint"];
        Serial.println("Setpoint atualizado: "+String(setpoint));
      }
    }
    http.end();
  }

  // Controle relé com histerese
  if(temperaturaAtual >= 70.0){
    releLigado = false;
    digitalWrite(RELAY, LOW);
    fanDesligaTimer = millis() + 5000;
    digitalWrite(FAN, HIGH);
  } 
  else if(temperaturaAtual <= setpoint - 2){
    releLigado = true;
    digitalWrite(RELAY, HIGH);
    digitalWrite(FAN, HIGH);
  }

  if(!releLigado && millis() > fanDesligaTimer){
    digitalWrite(FAN, LOW);
  }

  delay(2000);
}