import { TimerData } from '/imports/ui/core/graphql/queries/timer';

type TimerListener = (timePassed: number) => void;

class TimerSingleton {
  private timer: Partial<TimerData> | undefined = undefined;

  private timeOffset: number = 0;

  private listeners: Set<TimerListener> = new Set();

  private interval: ReturnType<typeof setInterval> | null = null;

  private startTimeout: ReturnType<typeof setTimeout> | null = null;

  subscribe(listener: TimerListener) {
    this.listeners.add(listener);
    this.notify(listener);
    return () => {
      this.listeners.delete(listener);
      if (this.listeners.size === 0) this.stopCounting();
    };
  }

  updateTimerInfo(timer: Partial<TimerData> | undefined) {
    this.timer = timer;
    this.notify();
    const { running = false } = timer || {};
    if (running) {
      this.startCounting();
    } else {
      this.stopCounting();
    }
  }

  setTimeOffset(timeOffset: number) {
    this.timeOffset = timeOffset;
  }

  private startCounting() {
    this.stopCounting();
    if (!this.timer?.running) return;
    const serverNow = Date.now() + this.timeOffset;
    // calculate time to next second to sync second counting with the server time
    const msToNextSecond = 1000 - (serverNow % 1000);
    this.startTimeout = setTimeout(() => {
      if (!this.timer?.running) return;
      this.notify();
      if (!this.interval) {
        this.interval = setInterval(() => {
          this.notify();
        }, 1000);
      }
    }, msToNextSecond);
  }

  private stopCounting() {
    if (this.startTimeout) {
      clearTimeout(this.startTimeout);
      this.startTimeout = null;
    }
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  private notify(listener: TimerListener | null = null) {
    const {
      accumulated = 0,
      running = false,
      startedAt,
      stopwatch = false,
      time = 0,
    } = this.timer || {};

    const clientNow = Date.now();
    const serverNow = clientNow + this.timeOffset;
    const startedAtTime = startedAt ? new Date(startedAt).getTime() : serverNow;
    let elapsedTime = accumulated;
    if (running) {
      elapsedTime += serverNow - startedAtTime;
    }
    const timePassed = stopwatch
      ? Math.max(0, Math.floor(elapsedTime))
      : Math.max(0, Math.floor(time - elapsedTime));

    if (listener) {
      // When notify is called for a specific listener, we pass the timePassed directly
      listener(timePassed);
      return;
    }

    this.listeners.forEach((listener) => {
      listener(timePassed);
    });
  }
}

export default new TimerSingleton();
