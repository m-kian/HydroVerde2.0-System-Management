// IoT Data Service - Simulates real-time sensor data
// Replace with actual API/MQTT connections when hardware is available

const SENSOR_TYPES = {
  WATER_LEVEL: 'water_level',
  PH_LEVEL: 'ph_level',
  TEMPERATURE: 'temperature',
  HUMIDITY: 'humidity',
  NUTRIENT_LEVEL: 'nutrient_level',
  TDS: 'tds',
  LIGHT: 'light',
};

const ACTUATOR_TYPES = {
  WATER_PUMP: 'water_pump',
  NUTRIENT_PUMP: 'nutrient_pump',
  AIR_PUMP: 'air_pump',
  LED_LIGHT: 'led_light',
  FAN: 'fan',
  VALVE: 'valve',
};

const THRESHOLDS = {
  water_level: { min: 30, max: 90, critical: 20 },
  ph_level: { min: 5.5, max: 7.5, critical: 5.0 },
  temperature: { min: 18, max: 28, critical: 35 },
  humidity: { min: 40, max: 80, critical: 90 },
  nutrient_level: { min: 50, max: 100, critical: 30 },
};

// Mock sensor data
let sensorData = {
  water_level: 75,
  ph_level: 6.5,
  temperature: 22,
  humidity: 65,
  nutrient_level: 80,
  tds: 450,
  light: 85,
};

// Mock actuator states
let actuatorStates = {
  water_pump: false,
  nutrient_pump: false,
  air_pump: true,
  led_light: false,
  fan: false,
  valve: false,
};

// Device status
let deviceStatus = {
  water_pump: { online: true, lastActive: '2 hours ago', health: 'Good' },
  nutrient_pump: { online: true, lastActive: '5 hours ago', health: 'Good' },
  air_pump: { online: true, lastActive: 'Always on', health: 'Good' },
  led_light: { online: true, lastActive: '1 day ago', health: 'Good' },
  fan: { online: true, lastActive: '3 hours ago', health: 'Good' },
  valve: { online: true, lastActive: '1 hour ago', health: 'Good' },
  ph_sensor: { online: true, lastActive: 'Just now', health: 'Good' },
  temp_sensor: { online: true, lastActive: 'Just now', health: 'Good' },
  water_sensor: { online: true, lastActive: 'Just now', health: 'Good' },
};

// Historical data for analytics (last 7 days)
const historicalData = {
  water_level: generateHistoricalData(70, 80, 7),
  ph_level: generateHistoricalData(6.0, 7.0, 7),
  temperature: generateHistoricalData(20, 24, 7),
  humidity: generateHistoricalData(60, 70, 7),
  nutrient_level: generateHistoricalData(75, 85, 7),
};

function generateHistoricalData(min, max, days) {
  const data = [];
  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  for (let i = 0; i < days; i++) {
    let value = Math.random() * (max - min) + min;
    // Round to appropriate precision based on range
    if (max > 10) {
      value = Math.round(value);
    } else {
      value = Math.round(value * 10) / 10;
    }
    data.push({
      day: dayLabels[i],
      value,
    });
  }
  return data;
}

// Get current sensor readings
export function getSensorData() {
  return { ...sensorData };
}

// Get actuator states
export function getActuatorStates() {
  return { ...actuatorStates };
}

// Get device status
export function getDeviceStatus() {
  return { ...deviceStatus };
}

// Get historical data
export function getHistoricalData() {
  return { ...historicalData };
}

// Control actuator
export function controlActuator(actuator, state) {
  if (actuatorStates.hasOwnProperty(actuator)) {
    actuatorStates[actuator] = state;
    deviceStatus[actuator].lastActive = 'Just now';
    return { success: true, actuator, state };
  }
  return { success: false, error: 'Actuator not found' };
}

// Check for threshold violations
export function checkThresholds() {
  const alerts = [];
  
  Object.keys(THRESHOLDS).forEach(sensor => {
    const value = sensorData[sensor];
    const threshold = THRESHOLDS[sensor];
    
    if (value <= threshold.critical) {
      alerts.push({
        type: 'critical',
        sensor,
        message: `${formatSensorName(sensor)} is critically low: ${value}`,
        value,
      });
    } else if (value < threshold.min || value > threshold.max) {
      alerts.push({
        type: 'warning',
        sensor,
        message: `${formatSensorName(sensor)} is out of range: ${value}`,
        value,
      });
    }
  });
  
  return alerts;
}

function formatSensorName(sensor) {
  return sensor.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

// Simulate real-time data updates (call this periodically)
export function simulateSensorUpdate() {
  sensorData.water_level = Math.max(0, Math.min(100, sensorData.water_level + (Math.random() - 0.5) * 2));
  sensorData.ph_level = Math.max(0, Math.min(14, sensorData.ph_level + (Math.random() - 0.5) * 0.2));
  sensorData.temperature = Math.max(10, Math.min(40, sensorData.temperature + (Math.random() - 0.5) * 0.5));
  sensorData.humidity = Math.max(0, Math.min(100, sensorData.humidity + (Math.random() - 0.5) * 2));
  sensorData.nutrient_level = Math.max(0, Math.min(100, sensorData.nutrient_level + (Math.random() - 0.5) * 1));
  sensorData.tds = Math.max(0, Math.min(1000, sensorData.tds + (Math.random() - 0.5) * 10));
  sensorData.light = Math.max(0, Math.min(100, sensorData.light + (Math.random() - 0.5) * 5));
  
  return getSensorData();
}

export { SENSOR_TYPES, ACTUATOR_TYPES, THRESHOLDS };
