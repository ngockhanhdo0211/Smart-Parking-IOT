(function exposeApi(window) {
  const TIMEOUT_MS = 5000;

  async function request(url, options = {}) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      const response = await fetch(url, {
        ...options,
        headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
        signal: controller.signal
      });
      const data = await response.json().catch(() => { throw new Error('Invalid server response.'); });
      if (!response.ok) throw new Error(data.error || `Request failed (${response.status}).`);
      return data;
    } catch (error) {
      if (error.name === 'AbortError') throw new Error('Request timed out.');
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }

  window.ParkingApi = {
    getSystemState: () => request('/api/system/state'),
    openGate: () => request('/api/gate/open', { method: 'POST', body: '{}' }),
    closeGate: () => request('/api/gate/close', { method: 'POST', body: '{}' }),
    sendDemoData: (data) => request('/api/system/demo', { method: 'POST', body: JSON.stringify(data) })
  };
}(window));
