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
  gate: {
    in: { status: 'closed', command: 'none' },
    out: { status: 'closed', command: 'none' }
  },
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

function setGateCommand(gateId, command) {
  // Backward compatibility: setGateCommand('open') controls the entry gate.
  if (command === undefined) {
    command = gateId;
    gateId = 'in';
  }
  state.gate[gateId].command = command;
  state.gate[gateId].status = command === 'open' ? 'opening' : 'closing';
  notifyChange();
}

function updateGateStatus(gateId, status) {
  // Backward compatibility: updateGateStatus('open') updates the entry gate.
  if (status === undefined) {
    status = gateId;
    gateId = 'in';
  }
  state.gate[gateId].status = status;
  state.gate[gateId].command = 'none';
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

function updateDemo({ parking, gas, vibration, esp32Online, gateStatus, gateInStatus, gateOutStatus }) {
  updateParking(parking);
  updateGas(gas);
  updateVibration(vibration);
  state.system.esp32Online = esp32Online;
  state.system.lastSeen = esp32Online ? Date.now() : state.system.lastSeen;
  const entryStatus = gateInStatus || gateStatus;
  if (entryStatus) {
    state.gate.in.status = entryStatus;
    state.gate.in.command = 'none';
  }
  if (gateOutStatus) {
    state.gate.out.status = gateOutStatus;
    state.gate.out.command = 'none';
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
