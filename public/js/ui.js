(function exposeUi(window) {
  const $ = (id) => document.getElementById(id);
  const setStateClass = (element, positive, warning = false) => {
    element.className = `status-dot ${warning ? 'is-danger' : positive ? 'is-success' : 'is-muted'}`;
  };

  function renderParking(parking) {
    const grid = $('parking-grid');
    grid.replaceChildren();
    Object.entries(parking).forEach(([id, slot]) => {
      const card = document.createElement('article');
      card.className = `parking-card ${slot.occupied ? 'is-occupied' : 'is-available'}`;
      const top = document.createElement('div');
      const name = document.createElement('strong');
      const dot = document.createElement('span');
      name.textContent = id.toUpperCase();
      dot.className = `status-dot ${slot.occupied ? 'is-danger' : 'is-success'}`;
      top.append(name, dot);
      const icon = document.createElement('div');
      icon.className = 'parking-icon';
      icon.setAttribute('aria-hidden', 'true');
      icon.textContent = 'P';
      const status = document.createElement('p');
      status.textContent = slot.occupied ? 'OCCUPIED' : 'AVAILABLE';
      card.append(top, icon, status);
      grid.append(card);
    });
  }

  function renderSummary(parking) {
    const slots = Object.values(parking);
    const occupied = slots.filter((slot) => slot.occupied).length;
    $('summary-total').textContent = slots.length;
    $('summary-occupied').textContent = occupied;
    $('summary-available').textContent = slots.length - occupied;
  }

  function renderGas(gas) {
    $('gas-value').textContent = gas.value;
    $('gas-status').textContent = gas.warning ? 'WARNING' : 'NORMAL';
    $('gas-card').classList.toggle('is-warning', gas.warning);
    setStateClass($('gas-dot'), !gas.warning, gas.warning);
    $('gas-progress').style.transform = `scaleX(${Math.min(gas.value / 1000, 1)})`;
  }

  function renderVibration(vibration) {
    $('vibration-status').textContent = vibration.detected ? 'VIBRATION DETECTED' : 'NORMAL';
    $('vibration-card').classList.toggle('is-warning', vibration.detected);
    setStateClass($('vibration-dot'), !vibration.detected, vibration.detected);
  }

  function renderGate(gate) {
    const status = gate.status.toUpperCase();
    $('gate-status').textContent = status;
    $('barrier-scene').dataset.status = gate.status;
    $('barrier-scene').setAttribute('aria-label', `Gate is ${gate.status}`);
    $('open-gate').disabled = ['open', 'opening'].includes(gate.status);
    $('close-gate').disabled = ['closed', 'closing'].includes(gate.status);
  }

  function renderSystemStatus(system) {
    const label = system.esp32Online ? 'Online' : 'Offline';
    ['header-esp', 'system-esp'].forEach((id) => { $(id).textContent = label; });
    ['header-esp-dot', 'system-esp-dot'].forEach((id) => setStateClass($(id), system.esp32Online));
    $('last-seen').textContent = system.lastSeen ? new Date(system.lastSeen).toLocaleString() : 'No data received';
  }

  function renderAll(state) {
    renderParking(state.parking);
    renderSummary(state.parking);
    renderGas(state.sensors.gas);
    renderVibration(state.sensors.vibration);
    renderGate(state.gate);
    renderSystemStatus(state.system);
  }

  function showConnectionError(disconnected) {
    $('connection-banner').hidden = !disconnected;
    $('header-server').textContent = disconnected ? 'Offline' : 'Online';
    $('system-server').textContent = disconnected ? 'Offline' : 'Online';
    setStateClass($('header-server-dot'), !disconnected);
    setStateClass($('system-server-dot'), !disconnected);
  }

  let toastTimer;
  function showToast(message, type = 'info') {
    const toast = $('toast');
    toast.textContent = message;
    toast.dataset.type = type;
    toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 3000);
  }

  window.ParkingUi = { renderParking, renderSummary, renderGas, renderVibration, renderGate, renderSystemStatus, renderAll, showConnectionError, showToast };
}(window));
