const EventEmitter = require('events');

const GAS_WARNING_THRESHOLD = 600;
const ESP32_TIMEOUT_MS = 10_000;
const DEFAULT_SLOT_IDS = ['p1', 'p2', 'p3', 'p4'];

const createInitialState = () => ({
  parking: Object.fromEntries(DEFAULT_SLOT_IDS.map((id) => [id, { occupied: false }])),
  sensors: {
    gas: { value: 0, warning: false },
    vibration: { detected: false }
  },
  gate: { status: 'closed', command: 'none' },
  system: { esp32Online: false, lastSeen: null }
});

let state = createInitialState();
const stateEvents = new EventEmitter();

function getState() {
  return structuredClone(state);
}

function notifyChange() {
  stateEvents.emit('change', getState());
}

function updateParking(parking) {
  state.parking = Object.fromEntries(
    Object.entries(parking).map(([id, occupied]) => [id.toLowerCase(), { occupied }])
  );
}

function updateGas(value) {
  state.sensors.gas = { value, warning: value >= GAS_WARNING_THRESHOLD };
}

function updateVibration(detected) {
  state.sensors.vibration.detected = detected;
}

function setGateCommand(command) {
  state.gate.command = command;
  state.gate.status = command === 'open' ? 'opening' : 'closing';
  notifyChange();
}

function updateGateStatus(status) {
  state.gate.status = status;
  state.gate.command = 'none';
  notifyChange();
}

function updateHeartbeat() {
  state.system.esp32Online = true;
  state.system.lastSeen = Date.now();
}

function updateFromDevice({ parking, gas, vibration }) {
  updateParking(parking);
  updateGas(gas);
  updateVibration(vibration);
  updateHeartbeat();
  notifyChange();
}

function updateDemo({ parking, gas, vibration, esp32Online, gateStatus }) {
  updateParking(parking);
  updateGas(gas);
  updateVibration(vibration);
  state.system.esp32Online = esp32Online;
  state.system.lastSeen = esp32Online ? Date.now() : state.system.lastSeen;
  if (gateStatus) {
    state.gate.status = gateStatus;
    state.gate.command = 'none';
  }
  notifyChange();
}

function checkEsp32Online() {
  const { esp32Online, lastSeen } = state.system;
  if (esp32Online && lastSeen && Date.now() - lastSeen > ESP32_TIMEOUT_MS) {
    state.system.esp32Online = false;
    notifyChange();
    return true;
  }
  return false;
}

function resetState() {
  state = createInitialState();
  notifyChange();
}

module.exports = {
  GAS_WARNING_THRESHOLD,
  ESP32_TIMEOUT_MS,
  stateEvents,
  getState,
  updateParking,
  updateGas,
  updateVibration,
  setGateCommand,
  updateGateStatus,
  updateHeartbeat,
  updateFromDevice,
  updateDemo,
  checkEsp32Online,
  resetState
};
