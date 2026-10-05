const stateService = require('../services/state.service');
const VALID_STATUSES = new Set(['open', 'closed', 'opening', 'closing']);
const VALID_GATES = new Set(['in', 'out']);

function sendGateCommand(gate, command, res) {
  stateService.setGateCommand(gate, command);
  return res.json({ success: true, gate, command });
}

function openGate(req, res) {
  return sendGateCommand('in', 'open', res);
}

function closeGate(req, res) {
  return sendGateCommand('in', 'close', res);
}

function controlGate(req, res) {
  const { gate, action } = req.params;
  if (!VALID_GATES.has(gate) || !['open', 'close'].includes(action)) {
    return res.status(400).json({ success: false, error: 'gate must be in or out, and action must be open or close.' });
  }
  return sendGateCommand(gate, action, res);
}

function getCommand(req, res) {
  const gates = stateService.getState().gate;
  const selectedGate = ['in', 'out'].find((gate) => gates[gate].command !== 'none') || null;
  return res.json({
    gate: selectedGate,
    command: selectedGate ? gates[selectedGate].command : 'none',
    commands: {
      in: gates.in.command,
      out: gates.out.command
    }
  });
}

function updateStatus(req, res) {
  const { gate = 'in', status } = req.body || {};
  if (!VALID_GATES.has(gate)) {
    return res.status(400).json({ success: false, error: 'gate must be in or out.' });
  }
  if (!VALID_STATUSES.has(status)) {
    return res.status(400).json({ success: false, error: 'status must be open, closed, opening or closing.' });
  }
  stateService.updateHeartbeat();
  stateService.updateGateStatus(gate, status);
  return res.json({ success: true, gate, status });
}

module.exports = { openGate, closeGate, controlGate, getCommand, updateStatus };
