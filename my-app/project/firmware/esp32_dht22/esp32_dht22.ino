// HydroVerde ESP32: DHT11 + Relay 3/4 + Django integration
#include <WiFi.h>
#include <HTTPClient.h>
#include <DHT.h>

#define DHT_PIN 32
#define DHT_TYPE DHT11

#define RELAY_3_PIN 19  // Connected to In3 (DS3 channel)
#define RELAY_4_PIN 4   // Connected to In4 (DS4 channel / fans)

// Replace with your network credentials
const char* WIFI_SSID = "YOUR_WIFI_NAME";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";

// Replace with your Django server details
const char* INGEST_URL = "http://YOUR_PC_LAN_IP:8000/api/readings/ingest/";
const char* RELAY_URL = "http://YOUR_PC_LAN_IP:8000/api/readings/relay/";
const char* DEVICE_KEY = "YOUR_DEVICE_API_KEY";

// Most HL-54S relay modules are active-low (LOW = ON, HIGH = OFF).
const bool ACTIVE_LOW = true;

// Adjust these thresholds to match your target conditions.
const float TEMP_THRESHOLD_C = 35.0;
const float HUMIDITY_THRESHOLD = 80.0;

DHT dht(DHT_PIN, DHT_TYPE);

unsigned long lastReadTime = 0;
const unsigned long READ_INTERVAL_MS = 2000;
unsigned long lastSendTime = 0;
const unsigned long SEND_INTERVAL_MS = 10000;
unsigned long lastRelayPollTime = 0;
const unsigned long RELAY_POLL_MS = 2000;

bool relay3State = false;
bool relay4State = false;

void setRelay(int pin, const char* label, bool turnOn) {
  int level = ACTIVE_LOW ? (turnOn ? LOW : HIGH) : (turnOn ? HIGH : LOW);
  digitalWrite(pin, level);
  Serial.print(label);
  Serial.print(": ");
  Serial.println(turnOn ? "ON" : "OFF");
}

void connectWiFi() {
  if (WiFi.status() == WL_CONNECTED) return;
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.printf("Connecting to %s", WIFI_SSID);
  for (int i = 0; i < 40 && WiFi.status() != WL_CONNECTED; i++) {
    delay(500);
    Serial.print(".");
  }
  Serial.println(WiFi.status() == WL_CONNECTED
    ? " connected, IP " + WiFi.localIP().toString()
    : " failed");
}

void sendReading(float temperature, float humidity) {
  HTTPClient http;
  http.begin(INGEST_URL);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("X-Device-Key", DEVICE_KEY);
  String body = "{\"temperature\":" + String(temperature, 1)
              + ",\"humidity\":" + String(humidity, 1) + "}";
  int code = http.POST(body);
  Serial.printf("POST reading -> %d\n", code);
  if (code != 201) Serial.println(http.getString());
  http.end();
}

void pollRelayState() {
  HTTPClient http;
  http.begin(RELAY_URL);
  http.addHeader("X-Device-Key", DEVICE_KEY);
  int code = http.GET();
  if (code == 200) {
    String response = http.getString();
    bool nextRelay3 = response.indexOf("\"relay_3\":true") >= 0;
    bool nextRelay4 = response.indexOf("\"relay_4\":true") >= 0;
    if (nextRelay3 != relay3State) {
      relay3State = nextRelay3;
      setRelay(RELAY_3_PIN, "Relay 3 (DS3)", relay3State);
    }
    if (nextRelay4 != relay4State) {
      relay4State = nextRelay4;
      setRelay(RELAY_4_PIN, "Relay 4 (DS4)", relay4State);
    }
  }
  http.end();
}

void updateRelayServer(bool fanOn) {
  HTTPClient http;
  http.begin(RELAY_URL);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("X-Device-Key", DEVICE_KEY);
  String body = fanOn ? "{\"relay_4\":true}" : "{\"relay_4\":false}";
  int code = http.POST(body);
  if (code != 200) Serial.printf("Relay state POST -> %d\n", code);
  http.end();
}

void setup() {
  Serial.begin(115200);
  pinMode(RELAY_3_PIN, OUTPUT);
  pinMode(RELAY_4_PIN, OUTPUT);

  setRelay(RELAY_3_PIN, "Relay 3 (DS3)", false);
  setRelay(RELAY_4_PIN, "Relay 4 (DS4)", false);

  dht.begin();
  WiFi.mode(WIFI_STA);
  connectWiFi();

  Serial.println("DHT11 + Relay 3/4 control ready.");
  Serial.println("Serial commands: '3on'/'3off', '4on'/'4off', 'alloff'");
}

void loop() {
  unsigned long now = millis();
  connectWiFi();

  if (WiFi.status() == WL_CONNECTED && now - lastRelayPollTime >= RELAY_POLL_MS) {
    lastRelayPollTime = now;
    pollRelayState();
  }

  if (now - lastReadTime >= READ_INTERVAL_MS) {
    lastReadTime = now;

    float humidity = dht.readHumidity();
    float tempC = dht.readTemperature();

    if (isnan(humidity) || isnan(tempC)) {
      Serial.println("Failed to read from DHT11 sensor. Check wiring on GPIO 5.");
    } else {
      Serial.print("Temp: ");
      Serial.print(tempC, 1);
      Serial.print(" C | Humidity: ");
      Serial.print(humidity, 1);
      Serial.println(" %");

      bool fanShouldBeOn = tempC >= TEMP_THRESHOLD_C || humidity >= HUMIDITY_THRESHOLD;
      if (fanShouldBeOn != relay4State) {
        relay4State = fanShouldBeOn;
        setRelay(RELAY_4_PIN, "Relay 4 (DS4)", relay4State);
        updateRelayServer(relay4State);
      }
    }
  }

  if (WiFi.status() == WL_CONNECTED && now - lastSendTime >= SEND_INTERVAL_MS) {
    lastSendTime = now;
    float humidity = dht.readHumidity();
    float tempC = dht.readTemperature();
    sendReading(tempC, humidity);
  }

  if (Serial.available() > 0) {
    String cmd = Serial.readStringUntil('\n');
    cmd.trim();
    cmd.toLowerCase();

    if (cmd == "3on") {
      setRelay(RELAY_3_PIN, "Relay 3 (DS3)", true);
    } else if (cmd == "3off") {
      setRelay(RELAY_3_PIN, "Relay 3 (DS3)", false);
    } else if (cmd == "4on") {
      setRelay(RELAY_4_PIN, "Relay 4 (DS4)", true);
    } else if (cmd == "4off") {
      setRelay(RELAY_4_PIN, "Relay 4 (DS4)", false);
    } else if (cmd == "alloff") {
      setRelay(RELAY_3_PIN, "Relay 3 (DS3)", false);
      setRelay(RELAY_4_PIN, "Relay 4 (DS4)", false);
    }
  }
}