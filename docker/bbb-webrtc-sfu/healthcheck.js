'use strict';

// Healthy when both listeners accept connections: the client WebSocket (clientPort, opened
// once all SFU modules have started) and the LiveKit webhook receiver (livekit.webhook.port).
const net = require('net');

const PORTS = [3008, 3040];
const TIMEOUT_MS = 2000;

const probe = (port) => new Promise((resolve, reject) => {
  const socket = net.connect({ host: '127.0.0.1', port });
  socket.setTimeout(TIMEOUT_MS);
  socket.once('connect', () => { socket.destroy(); resolve(); });
  socket.once('timeout', () => { socket.destroy(); reject(new Error(`port ${port}: timeout`)); });
  socket.once('error', (error) => reject(new Error(`port ${port}: ${error.code || error.message}`)));
});

Promise.all(PORTS.map(probe)).then(
  () => process.exit(0),
  (error) => { console.error(error.message); process.exit(1); },
);
