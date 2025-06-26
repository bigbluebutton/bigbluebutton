import { TimerData } from '/imports/ui/core/graphql/queries/timer';
import { fetchServerTimeSync } from '/imports/ui/core/utils/timeSync';

type TimerListener = (timePassed: number) => void;

class TimerSingleton {
  private timer: Partial<TimerData> | undefined = undefined;

  private timeSync: number = 0;

  private listeners: Set<TimerListener> = new Set();

  private interval: ReturnType<typeof setInterval> | null = null;

  private timeSyncInterval: ReturnType<typeof setInterval> | null = null;

  private static SERVER_SYNC_TIME_INTERVAL() {
    return window.meetingClientSettings.public.timer.serverSyncTimeInterval || 5 * 60 * 1000;
  }

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

  startPeriodicTimeSync() {
    if (this.timeSyncInterval) this.stopPeriodicTimeSync();
    const sync = async () => {
      const newTimeSync = await fetchServerTimeSync();
      this.setTimeDesync(newTimeSync);
    };
    sync();
    this.timeSyncInterval = setInterval(sync, TimerSingleton.SERVER_SYNC_TIME_INTERVAL());
  }

  stopPeriodicTimeSync() {
    if (this.timeSyncInterval) {
      clearInterval(this.timeSyncInterval);
      this.timeSyncInterval = null;
    }
  }

  private setTimeDesync(timeSync: number) {
    this.timeSync = timeSync;
  }

  private async startCounting() {
    this.stopCounting();
    await this.startPeriodicTimeSync();
    const serverNow = Date.now() + this.timeSync;
    // calculate time to next second to sync second counting with the server time
    const msToNextSecond = 1000 - (serverNow % 1000);
    setTimeout(() => {
      this.notify();
      if (!this.interval) {
        this.interval = setInterval(() => {
          this.notify();
        }, 1000);
      }
    }, msToNextSecond);
  }

  private stopCounting() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    this.stopPeriodicTimeSync();
  }

  private notify(listener: TimerListener | null = null) {
    const {
      accumulated = 0,
      running = false,
      startedOn,
      stopwatch = false,
      time = 0,
    } = this.timer || {};

    const clientNow = Date.now();
    const serverNow = clientNow + this.timeSync;
    const startedOnTime = startedOn || serverNow;
    let elapsedTime = accumulated;
    if (running) {
      elapsedTime += serverNow - startedOnTime;
    }
    const timePassed = stopwatch
      ? Math.floor(elapsedTime)
      : Math.floor(time - elapsedTime);

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
