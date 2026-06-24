import logger from '/imports/startup/client/logger';
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
    logger.debug({ logCode: 'timer_subscribe' }, 'Subscriber added to TimerSingleton, total subscribers: %d', this.listeners.size);
    this.notify(listener);
    return () => {
      this.listeners.delete(listener);
      logger.debug({ logCode: 'timer_unsubscribe' }, 'Subscriber removed from TimerSingleton, total subscribers: %d', this.listeners.size);
      if (this.listeners.size === 0) {
        logger.debug({ logCode: 'timer_stop_on_zero_subscribers' }, 'No subscribers remaining, stopping timer counting');
        this.stopCounting();
      }
    };
  }

  updateTimerInfo(timer: Partial<TimerData> | undefined) {
    this.timer = timer;
    logger.debug({ logCode: 'timer_update_info' }, 'Timer info updated: %o', timer);
    this.notify();
    const { running = false } = timer || {};
    if (running) {
      this.startCounting();
    } else {
      this.stopCounting();
    }
  }

  setTimeOffset(timeOffset: number) {
    logger.debug({ logCode: 'timer_set_time_offset' }, 'Setting time offset: %d (previous: %d)', timeOffset, this.timeOffset);
    this.timeOffset = timeOffset;
  }

  private startCounting() {
    logger.debug({ logCode: 'timer_start_counting' }, 'startCounting called');
    this.stopCounting();
    if (!this.timer?.running) return;
    const serverNow = Date.now() + this.timeOffset;
    // calculate time to next second to sync second counting with the server time
    const msToNextSecond = 1000 - (serverNow % 1000);
    this.startTimeout = setTimeout(() => {
      if (!this.timer?.running) return;
      logger.debug({ logCode: 'timer_aligned_start' }, 'Aligned start after %d ms', msToNextSecond);
      this.notify();
      if (!this.interval) {
        this.interval = setInterval(() => {
          this.notify();
        }, 1000);
        logger.debug({ logCode: 'timer_interval_started' }, 'Interval started');
      }
    }, msToNextSecond);
  }

  private stopCounting() {
    logger.debug({ logCode: 'timer_stop_counting' }, 'stopCounting called');
    if (this.startTimeout) {
      clearTimeout(this.startTimeout);
      this.startTimeout = null;
      logger.debug({ logCode: 'timer_cleared_start_timeout' }, 'Cleared start timeout');
    }
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
      logger.debug({ logCode: 'timer_cleared_interval' }, 'Cleared interval');
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

    logger.debug({ logCode: 'timer_notify' }, 'Notifying listeners timePassed: %d (listeners: %d)', timePassed, this.listeners.size);
    if (listener) {
      // When notify is called for a specific listener, we pass the timePassed directly
      listener(timePassed);
      return;
    }

    this.listeners.forEach((listener) => {
      try {
        listener(timePassed);
      } catch (err) {
        logger.error({ logCode: 'timer_listener_error' }, 'Error in timer listener: %o', err);
      }
    });
  }
}

export default new TimerSingleton();
