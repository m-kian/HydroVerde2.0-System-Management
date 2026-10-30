// HydroVerde ESP32 + DHT22 -> Django backend (POST /api/readings/ingest/)
// Arduino IDE libraries: "DHT sensor library" by Adafruit (+ "Adafruit Unified Sensor").
// Wiring: DHT22 VCC -> 3V3, GND -> GND, DATA -> GPIO 4 (10k pull-up to 3V3 if your module has none).

#include <WiFi.h>
#include <HTTPClient.h>
#include <DHT.h>

const char* WIFI_SSID     = "YOUR_WIFI_NAME";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";
// Your PC's LAN IP (run `ipconfig` on Windows, IPv4 Address). Not localhost.
const char* INGEST_URL    = "http://192.168.1.10:8000/api/readings/ingest/";
// Must match DEVICE_API_KEY in backend/.env (default: dev-device-key).
const char* DEVICE_KEY    = "dev-device-key";

const int DHT_PIN = 4;
const unsigned long SEND_EVERY_MS = 10000;  // DHT22 needs >= 2 s between reads

DHT dht(DHT_PIN, DHT22);
unsigned long lastSend = 0;

void connectWifi() {
  if (WiFi.status() == WL_CONNECTED) return;
  Serial.printf("Connecting to %s", WIFI_SSID);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  for (int i = 0; i < 40 && WiFi.status() != WL_CONNECTED; i++) {
    delay(500);
    Serial.print(".");
  }
  Serial.println(WiFi.status() == WL_CONNECTED ? " connected, IP " + WiFi.localIP().toString() : " failed");
}

void sendReading(float temperature, float humidity) {
  HTTPClient http;
  http.begin(INGEST_URL);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("X-Device-Key", DEVICE_KEY);
  String body = "{\"temperature\":" + String(temperature, 1) + ",\"humidity\":" + String(humidity, 1) + "}";
  int code = http.POST(body);
  Serial.printf("POST %s -> %d\n", body.c_str(), code);
  if (code != 201) Serial.println(http.getString());
  http.end();
}

void setup() {
  Serial.begin(115200);
  dht.begin();
  WiFi.mode(WIFI_STA);
  connectWifi();
}

void loop() {
  if (millis() - lastSend < SEND_EVERY_MS) return;
  lastSend = millis();

  connectWifi();
  if (WiFi.status() != WL_CONNECTED) return;

  float h = dht.readHumidity();
  float t = dht.readTemperature();  // °C
  if (isnan(h) || isnan(t)) {
    Serial.println("DHT22 read failed, check wiring");
    return;
  }
  sendReading(t, h);
}
