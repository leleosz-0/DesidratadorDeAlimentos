/*
 * DESIDRATADOR DE ALIMENTOS - CODIGO ESP32
 * 
 * Componentes:
 * - ESP32
 * - Modulo Rele (para celula Peltier)
 * - DHT11 (sensor de temperatura e umidade)
 * - Display LCD 16x2 I2C
 * - Buzzer
 * - Ventoinha da Peltier (integrada)
 * - Ventoinha de exaustao
 * 
 * Funcionalidades:
 * - Leitura de temperatura e umidade
 * - Controle de temperatura com limite de 60°C
 * - Display LCD mostrando temperatura atual
 * - Buzzer quando processo termina
 * - Comunicacao WiFi com servidor web
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include "DHT.h"
#include <ArduinoJson.h>
#include <LiquidCrystal_I2C.h>

// ==================== CONFIGURACOES DE PINOS ====================
#define DHTPIN 4          // Pino do DHT11
#define DHTTYPE DHT11     // Tipo do sensor
#define RELAY_PELTIER 5   // Rele da celula Peltier
#define FAN_EXHAUST 18    // Ventoinha de exaustao
#define BUZZER_PIN 19     // Buzzer

// ==================== CONFIGURACOES DE REDE ====================
const char* ssid = "SEU_WIFI";           // Substitua pelo seu WiFi
const char* password = "SUA_SENHA";       // Substitua pela sua senha
const char* serverUrl = "http://SEU_IP:3000/api/sensor"; // URL do servidor

// Chave de API para autenticacao
const char* apiKey = "desidratador_esp32_2026";

// ==================== OBJETOS ====================
DHT dht(DHTPIN, DHTTYPE);
LiquidCrystal_I2C lcd(0x27, 16, 2);  // Endereco I2C comum: 0x27 ou 0x3F

// ==================== VARIAVEIS GLOBAIS ====================
float temperaturaAtual = 25.0;
float umidadeAtual = 50.0;
float setpoint = 57.0;
bool equipamentoLigado = false;
bool processoAtivo = false;
int tempoRestante = 0;
bool buzzerAtivo = false;

// Controle de tempo
unsigned long ultimaLeitura = 0;
unsigned long ultimoEnvio = 0;
unsigned long fanDesligaTimer = 0;

// Intervalos (em ms)
const unsigned long INTERVALO_LEITURA = 2000;  // Leitura do sensor
const unsigned long INTERVALO_ENVIO = 3000;    // Envio para servidor

// Simbolo de grau para LCD
byte grauSymbol[8] = {
  0b00110,
  0b01001,
  0b01001,
  0b00110,
  0b00000,
  0b00000,
  0b00000,
  0b00000
};

// ==================== SETUP ====================
void setup() {
  Serial.begin(115200);
  Serial.println("\n=== DESIDRATADOR DE ALIMENTOS ===");
  
  // Inicializa pinos
  pinMode(RELAY_PELTIER, OUTPUT);
  pinMode(FAN_EXHAUST, OUTPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  
  // Estado inicial: tudo desligado
  digitalWrite(RELAY_PELTIER, LOW);
  digitalWrite(FAN_EXHAUST, LOW);
  digitalWrite(BUZZER_PIN, LOW);
  
  // Inicializa DHT11
  dht.begin();
  Serial.println("DHT11 inicializado");
  
  // Inicializa LCD
  lcd.init();
  lcd.backlight();
  lcd.createChar(0, grauSymbol);
  
  // Tela de boas-vindas
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("  DESIDRATADOR  ");
  lcd.setCursor(0, 1);
  lcd.print("  Iniciando...  ");
  
  // Conecta WiFi
  conectarWiFi();
  
  // Atualiza LCD
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Temp: --.-");
  lcd.write(0);
  lcd.print("C");
  lcd.setCursor(0, 1);
  lcd.print("Aguardando...");
  
  // Beep de inicializacao
  beep(100);
  delay(100);
  beep(100);
  
  Serial.println("Sistema pronto!");
}

// ==================== LOOP PRINCIPAL ====================
void loop() {
  unsigned long agora = millis();
  
  // Verifica conexao WiFi
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi desconectado, reconectando...");
    conectarWiFi();
  }
  
  // Leitura do sensor
  if (agora - ultimaLeitura >= INTERVALO_LEITURA) {
    ultimaLeitura = agora;
    lerSensor();
    atualizarLCD();
    controlarTemperatura();
  }
  
  // Envio para servidor
  if (agora - ultimoEnvio >= INTERVALO_ENVIO) {
    ultimoEnvio = agora;
    enviarDados();
  }
  
  // Controle da ventoinha de exaustao
  if (!equipamentoLigado && millis() > fanDesligaTimer) {
    digitalWrite(FAN_EXHAUST, LOW);
  }
  
  // Controle do buzzer (processo terminado)
  if (buzzerAtivo) {
    tocarAlerta();
    buzzerAtivo = false;
  }
}

// ==================== FUNCOES ====================

void conectarWiFi() {
  Serial.print("Conectando ao WiFi: ");
  Serial.println(ssid);
  
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Conectando WiFi");
  
  WiFi.begin(ssid, password);
  
  int tentativas = 0;
  while (WiFi.status() != WL_CONNECTED && tentativas < 30) {
    delay(500);
    Serial.print(".");
    lcd.setCursor(tentativas % 16, 1);
    lcd.print(".");
    tentativas++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nWiFi conectado!");
    Serial.print("IP: ");
    Serial.println(WiFi.localIP());
    
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("WiFi Conectado!");
    lcd.setCursor(0, 1);
    lcd.print(WiFi.localIP());
    delay(2000);
  } else {
    Serial.println("\nFalha na conexao WiFi!");
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("WiFi: ERRO!");
    delay(2000);
  }
}

void lerSensor() {
  float t = dht.readTemperature();
  float h = dht.readHumidity();
  
  if (isnan(t) || isnan(h)) {
    Serial.println("Erro na leitura do DHT11!");
    return;
  }
  
  temperaturaAtual = t;
  umidadeAtual = h;
  
  Serial.print("Temperatura: ");
  Serial.print(temperaturaAtual);
  Serial.print("°C | Umidade: ");
  Serial.print(umidadeAtual);
  Serial.println("%");
}

void atualizarLCD() {
  lcd.setCursor(0, 0);
  lcd.print("Temp: ");
  lcd.print(temperaturaAtual, 1);
  lcd.write(0);
  lcd.print("C  ");
  
  lcd.setCursor(0, 1);
  if (processoAtivo && tempoRestante > 0) {
    // Mostra tempo restante
    int horas = tempoRestante / 3600;
    int minutos = (tempoRestante % 3600) / 60;
    lcd.print("Rest: ");
    if (horas > 0) {
      lcd.print(horas);
      lcd.print("h");
    }
    lcd.print(minutos);
    lcd.print("min   ");
  } else if (equipamentoLigado) {
    lcd.print("Alvo: ");
    lcd.print((int)setpoint);
    lcd.write(0);
    lcd.print("C     ");
  } else {
    lcd.print("Desligado      ");
  }
}

void controlarTemperatura() {
  // Seguranca: limite maximo de 60°C
  const float TEMP_MAX = 60.0;
  const float HISTERESE = 2.0;
  
  if (!equipamentoLigado) {
    digitalWrite(RELAY_PELTIER, LOW);
    return;
  }
  
  // Protecao contra superaquecimento
  if (temperaturaAtual >= TEMP_MAX) {
    Serial.println("ALERTA: Temperatura maxima atingida!");
    digitalWrite(RELAY_PELTIER, LOW);
    digitalWrite(FAN_EXHAUST, HIGH);
    fanDesligaTimer = millis() + 10000;
    return;
  }
  
  // Controle com histerese
  if (temperaturaAtual <= setpoint - HISTERESE) {
    // Liga aquecimento
    digitalWrite(RELAY_PELTIER, HIGH);
    digitalWrite(FAN_EXHAUST, HIGH);
    Serial.println("Aquecimento: LIGADO");
  } 
  else if (temperaturaAtual >= setpoint) {
    // Desliga aquecimento
    digitalWrite(RELAY_PELTIER, LOW);
    fanDesligaTimer = millis() + 5000;
    Serial.println("Aquecimento: DESLIGADO (temperatura atingida)");
  }
}

void enviarDados() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("Sem WiFi para enviar dados");
    return;
  }
  
  HTTPClient http;
  http.begin(serverUrl);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("X-API-Key", apiKey);
  
  // Monta JSON para envio
  StaticJsonDocument<200> doc;
  doc["temperatura"] = temperaturaAtual;
  doc["umidade"] = umidadeAtual;
  
  String json;
  serializeJson(doc, json);
  
  Serial.print("Enviando: ");
  Serial.println(json);
  
  int httpCode = http.POST(json);
  
  if (httpCode == 200) {
    String resposta = http.getString();
    Serial.print("Resposta: ");
    Serial.println(resposta);
    
    // Processa resposta do servidor
    StaticJsonDocument<300> respDoc;
    DeserializationError erro = deserializeJson(respDoc, resposta);
    
    if (!erro) {
      // Atualiza setpoint
      if (respDoc.containsKey("setpoint")) {
        float novoSetpoint = respDoc["setpoint"];
        if (novoSetpoint != setpoint) {
          setpoint = min(novoSetpoint, 60.0f);  // Limite de seguranca
          Serial.print("Setpoint atualizado: ");
          Serial.println(setpoint);
        }
      }
      
      // Atualiza estado do equipamento
      if (respDoc.containsKey("equipamentoLigado")) {
        equipamentoLigado = respDoc["equipamentoLigado"];
      }
      
      // Atualiza estado do processo
      if (respDoc.containsKey("processoAtivo")) {
        processoAtivo = respDoc["processoAtivo"];
      }
      
      // Atualiza tempo restante
      if (respDoc.containsKey("tempoRestante")) {
        tempoRestante = respDoc["tempoRestante"];
      }
      
      // Verifica se deve tocar buzzer
      if (respDoc.containsKey("buzzer") && respDoc["buzzer"] == true) {
        buzzerAtivo = true;
      }
    }
  } else {
    Serial.print("Erro HTTP: ");
    Serial.println(httpCode);
  }
  
  http.end();
}

void beep(int duracao) {
  digitalWrite(BUZZER_PIN, HIGH);
  delay(duracao);
  digitalWrite(BUZZER_PIN, LOW);
}

void tocarAlerta() {
  Serial.println("=== PROCESSO CONCLUIDO! ===");
  
  // Sequencia de beeps para alertar
  for (int i = 0; i < 5; i++) {
    beep(200);
    delay(200);
  }
  
  // Pausa
  delay(1000);
  
  // Segunda sequencia
  for (int i = 0; i < 3; i++) {
    beep(500);
    delay(300);
  }
  
  // Atualiza LCD
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("*** PRONTO! ***");
  lcd.setCursor(0, 1);
  lcd.print("Retire alimento");
}
