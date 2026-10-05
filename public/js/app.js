(function initialiseApp() {
  const api = window.ParkingApi;
  const ui = window.ParkingUi;
  const $ = (id) => document.getElementById(id);
  let currentState = null;
  const actionLocks = { in: false, out: false };

  function setButtonLoading(button, loading) {
    button.classList.toggle('is-loading', loading);
    button.setAttribute('aria-busy', String(loading));
    if (loading) button.disabled = true;
  }

  async function gateAction(gateId, action, button) {
    if (actionLocks[gateId]) return;
    actionLocks[gateId] = true;
    setButtonLoading(button, true);
    try {
      await action();
    } catch (error) {
      ui.showToast(error.message, 'error');
      ui.showConnectionError(true);
    } finally {
      setButtonLoading(button, false);
      actionLocks[gateId] = false;
      if (currentState) ui.renderGate(currentState.gate);
    }
  }

  function buildDemoSlots(parking) {
    const container = $('demo-slots');
    container.replaceChildren();
    Object.entries(parking).forEach(([id, slot]) => {
      const label = document.createElement('label');
      const input = document.createElement('input');
      input.type = 'checkbox';
      input.dataset.slotId = id;
      input.checked = slot.occupied;
      const text = document.createElement('span');
      text.textContent = `${id.toUpperCase()} occupied`;
      label.append(input, text);
      container.append(label);
    });
  }

  function syncDemoControls(state) {
    if (!$('demo-controls').disabled) return;
    buildDemoSlots(state.parking);
    $('demo-gas').value = state.sensors.gas.value;
    $('demo-gas-output').textContent = `${state.sensors.gas.value} ppm`;
    $('demo-vibration').value = String(state.sensors.vibration.detected);
    $('demo-esp').value = String(state.system.esp32Online);
    const gates = state.gate.in && state.gate.out ? state.gate : {
      in: state.gate,
      out: { status: 'closed' }
    };
    $('demo-gate-in').value = gates.in.status;
    $('demo-gate-out').value = gates.out.status;
  }

  function receiveState(state) {
    if (!state || !state.parking || !state.sensors || !state.gate || !state.system) return;
    currentState = state;
    ui.renderAll(state);
    syncDemoControls(state);
    ui.showConnectionError(false);
  }

  async function initialFetch() {
    try {
      receiveState(await api.getSystemState());
    } catch (error) {
      ui.showConnectionError(true);
      ui.showToast(error.message, 'error');
    }
  }

  const socket = io({ reconnection: true });
  socket.on('connect', () => {
    $('socket-status').textContent = 'Connected';
    ui.showConnectionError(false);
  });
  socket.on('disconnect', () => {
    $('socket-status').textContent = 'Disconnected';
    ui.showConnectionError(true);
  });
  socket.on('connect_error', () => ui.showConnectionError(true));
  socket.on('system:update', receiveState);

  $('open-gate-in').addEventListener('click', () => gateAction('in', () => api.openGate('in'), $('open-gate-in')));
  $('close-gate-in').addEventListener('click', () => gateAction('in', () => api.closeGate('in'), $('close-gate-in')));
  $('open-gate-out').addEventListener('click', () => gateAction('out', () => api.openGate('out'), $('open-gate-out')));
  $('close-gate-out').addEventListener('click', () => gateAction('out', () => api.closeGate('out'), $('close-gate-out')));
  $('demo-enabled').addEventListener('change', (event) => {
    $('demo-controls').disabled = !event.target.checked;
    $('demo-panel').classList.toggle('is-enabled', event.target.checked);
    if (event.target.checked && currentState) buildDemoSlots(currentState.parking);
  });
  $('demo-gas').addEventListener('input', (event) => { $('demo-gas-output').textContent = `${event.target.value} ppm`; });
  $('apply-demo').addEventListener('click', async () => {
    if (!currentState) return;
    const button = $('apply-demo');
    const parking = {};
    document.querySelectorAll('[data-slot-id]').forEach((input) => { parking[input.dataset.slotId] = input.checked; });
    setButtonLoading(button, true);
    try {
      await api.sendDemoData({
        parking,
        gas: Number($('demo-gas').value),
        vibration: $('demo-vibration').value === 'true',
        esp32Online: $('demo-esp').value === 'true',
        gateInStatus: $('demo-gate-in').value,
        gateOutStatus: $('demo-gate-out').value
      });
    } catch (error) {
      ui.showToast(error.message, 'error');
    } finally {
      setButtonLoading(button, false);
    }
  });

  function updateClock() {
    $('current-time').textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }
  updateClock();
  setInterval(updateClock, 1000);
  initialFetch();
}());
