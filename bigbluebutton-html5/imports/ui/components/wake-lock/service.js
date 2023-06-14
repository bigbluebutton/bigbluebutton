import logger from '/imports/startup/client/logger';
import deviceInfo from '/imports/utils/deviceInfo';

const WAKELOCK_ENABLED = Meteor.settings.public.app.wakeLock.enabled;

class WakeLock {
  constructor() {
    this.sentinel = null;
    this.apiSupport = 'wakeLock' in navigator;
  }

  static isEnabled() {
    return WAKELOCK_ENABLED;
  }

  isSupported() {
    const { isMobile } = deviceInfo;
    return WakeLock.isEnabled() && this.apiSupport && isMobile;
  }

  isActive() {
    return this.sentinel !== null;
  }

  handleVisibilityChanged() {
    if (document.visibilityState === 'visible') {
      this.request();
    }
  }

  handleRelease() {
    document.removeEventListener('visibilitychange', this.handleVisibilityChanged);
    this.sentinel = null;
  }

  async request() {
    if (!this.isSupported()) {
      logger.warn({
        logCode: 'wake_lock_request_error',
      }, 'Wake lock API not supported');
      return true;
    }

    try {
      this.sentinel = await navigator.wakeLock.request('screen');
      this.sentinel.addEventListener('release', this.handleRelease);
      document.addEventListener('visibilitychange', this.handleVisibilityChanged.bind(this));
      document.addEventListener('fullscreenchange', this.handleVisibilityChanged.bind(this));
    } catch (err) {
      logger.warn({
        logCode: 'wake_lock_request_error',
        extraInfo: {
          errorName: err.name,
          errorMessage: err.message,
        },
      }, 'Error requesting wake lock.');
      return true;
    }
    return false;
  }

  release() {
    if (this.isActive()) this.sentinel.release();
  }
}

const wakeLock = new WakeLock();

export default {
  isEnabled: () => wakeLock.isEnabled(),
  isSupported: () => wakeLock.isSupported(),
  isActive: () => wakeLock.isActive(),
  request: () => wakeLock.request(),
  release: () => wakeLock.release(),
};
