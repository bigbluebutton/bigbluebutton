import { createIntl } from 'react-intl';

const FALLBACK_ON_EMPTY_STRING = Meteor.settings.public.app.fallbackOnEmptyLocaleString;

/**
 * Use this if you need any translation outside of React lifecyle.
 */
class BBBIntl {
  _intl = {
    tracker: new Tracker.Dependency(),
    value: undefined,
  };

  _fetching = {
    tracker: new Tracker.Dependency(),
    value: true,
  };

  constructor({ fallback }) {
    this._fallback = fallback;
  }

  setLocale(locale, messages) {
    this.intl = createIntl({
      locale,
      messages,
      fallbackOnEmptyString: this._fallback,
    });

    this.fetching = false;
  }

  set fetching(value) {
    this._fetching.value = value;
    this._fetching.tracker.changed();
  }

  get fetching() {
    this._fetching.tracker.depend();
    return this._fetching.value;
  }

  set intl(value) {
    this._intl.value = value;
    this._intl.tracker.changed();
  }

  get intl() {
    this._intl.tracker.depend();
    return this._intl.value;
  }

  formatMessage(descriptor, values, options) {
    return new Promise((resolve, reject) => {
      try {
        if (!this.fetching && this.intl) {
          resolve(this.intl.formatMessage(descriptor, values, options));
        } else {
          Tracker.autorun((c) => {
            const { fetching, intl } = this;

            if (fetching || !intl) return;

            resolve(this.intl.formatMessage(descriptor, values, options));
            c.stop();
          });
        }
      } catch (e) {
        reject(e);
      }
    });
  }
}

export default new BBBIntl({ fallback: FALLBACK_ON_EMPTY_STRING });
