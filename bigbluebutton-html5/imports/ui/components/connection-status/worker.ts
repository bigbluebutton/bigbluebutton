/* eslint-disable no-restricted-globals */
const timer = {
  id: null as ReturnType<typeof setTimeout> | null,
};
const lastExecutionTime = {
  time: 0,
};
const cfg = {
  baseUrl: '',
  interval: 10000,
  fetchTimeout: 10000,
  userId: '',
  meetingId: '',
  clientSessionUUID: '',
};

const tick = async () => {
  const startTime = performance.now();

  try {
    const fetchOptions = {
      signal: AbortSignal.timeout ? AbortSignal.timeout(cfg.fetchTimeout) : undefined,
    };

    const res = await fetch(
      `${cfg.baseUrl}/rtt-check?session=${cfg.clientSessionUUID}&user=${cfg.userId}&meeting=${cfg.meetingId}`,
      fetchOptions,
    );

    const endTime = performance.now();
    const networkRttInMs = Math.round(endTime - startTime);

    if (!res.ok) {
      postMessage({
        type: 'error',
        error: {
          status: res.status,
          statusText: res.statusText,
          url: res.url,
        },
      });
      return;
    }

    const serverEpochSecStr = res.headers.get('X-Server-Epoch-Msec');
    const serverRequestId = res.headers.get('X-Request-Id');
    // I can't use logger here, so use console.log
    console.log(
      `Worker RTT check: RTT=${networkRttInMs}ms, Server-Epoch-Msec=${serverEpochSecStr} (this log is client only)`,
      // Not log first execution time
      lastExecutionTime.time ? `Last execution time: ${Math.floor(Date.now() - lastExecutionTime.time)}ms ago` : '',
    );
    postMessage({
      type: 'rtt',
      rtt: networkRttInMs,
      serverEpochMsec: serverEpochSecStr ? Number(serverEpochSecStr) : null,
      serverRequestId,
    });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    postMessage({
      type: 'error',
      error: {
        message: error?.message,
        stack: error?.stack,
        name: error?.name,
      },
    });
  }
  lastExecutionTime.time = Date.now();
  // Just schedule the next tick after completing this one
  timer.id = setTimeout(tick, cfg.interval);
};

const startLoop = () => {
  if (timer.id) clearTimeout(timer.id);
  // Optional: first run at half-interval (to match your current behavior)
  setTimeout(tick, Math.floor(cfg.interval / 2));
};

self.onmessage = (e) => {
  const { type, payload } = e.data || {};
  switch (type) {
    case 'init': {
      cfg.baseUrl = payload.baseUrl;
      cfg.interval = payload.interval || cfg.interval;
      cfg.fetchTimeout = payload.fetchTimeout || cfg.fetchTimeout;
      cfg.userId = payload.userId || '';
      cfg.meetingId = payload.meetingId || '';
      cfg.clientSessionUUID = payload.clientSessionUUID || '';
      startLoop();
      break;
    }
    case 'stop': {
      if (timer.id) clearTimeout(timer.id);
      timer.id = null;
      break;
    }
    default:
      break;
  }
};

self.onclose = () => {
  if (timer.id) clearTimeout(timer.id);
};
