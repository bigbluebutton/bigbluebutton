import logger from '/imports/startup/client/logger';
import deviceInfo from '/imports/utils/deviceInfo';

const WAKELOCK_ENABLED = Meteor.settings.public.app.wakeLock.enabled;

const WAKELOCK_ERRORS = {
  NOT_SUPPORTED: {
    locale: 'wakeLockNotSupported',
    error: 'wake_lock_not_supported',
  },
  REQUEST_FAILED: {
    locale: 'wakeLockAcquireFailed',
    error: 'wake_lock_request_error',
  },
};

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

  isMobile() {
    const { isMobile } = deviceInfo;
    return isMobile;
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
        logCode: WAKELOCK_ERRORS.NOT_SUPPORTED.error,
      }, 'Wake lock API not supported');
      return {
        ...WAKELOCK_ERRORS.NOT_SUPPORTED,
        msg: 'Wake lock API not supported',
      };
    }

    try {
      this.sentinel = await navigator.wakeLock.request('screen');
      this.sentinel.addEventListener('release', this.handleRelease);
      document.addEventListener('visibilitychange', this.handleVisibilityChanged.bind(this));
      document.addEventListener('fullscreenchange', this.handleVisibilityChanged.bind(this));
    } catch (err) {
      logger.warn({
        logCode: WAKELOCK_ERRORS.REQUEST_FAILED.error,
        extraInfo: {
          errorName: err.name,
          errorMessage: err.message,
        },
      }, 'Error requesting wake lock.');
      return {
        ...WAKELOCK_ERRORS.REQUEST_FAILED,
        msg: `${err.name} - ${err.message}`,
      };
    }
    return {
      error: false,
    };
  }

  release() {
    if (this.isActive()) this.sentinel.release();
  }
}

const wakeLock = new WakeLock();

export default {
  isEnabled: () => wakeLock.isEnabled(),
  isSupported: () => wakeLock.isSupported(),
  isMobile: () => wakeLock.isMobile(),
  isActive: () => wakeLock.isActive(),
  request: () => wakeLock.request(),
  release: () => wakeLock.release(),
};
