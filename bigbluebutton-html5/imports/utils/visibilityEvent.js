import { log } from '/imports/ui/services/api';

const VISIBILITY_TIMEOUT = 5000;

export default class VisibilityEvent {

  constructor () {
    this._onVisible = null;
    this._onHidden = null;

    this._handleVisibilityChange = this._handleVisibilityChange.bind(this);

    this._registerVisibilityEvent();

    this._onHiddenTimeout = null;
  }

  onVisible (onVisibleCallback) {
    this._onVisible = () => {
      if (!this._isHidden()) {
        onVisibleCallback();
      }
    };
  }

  onHidden(onHiddenCallback) {
    this._onHidden = () => {
      if (this._isHidden()) {
        onHiddenCallback();
        this._onHiddenTimeout = null;
      }
    };
  }

  removeEventListeners() {
    let event = this._getVisibilityEvent();
    document.removeEventListener(event, this._handleVisibilityChange, false);
  }

  _handleVisibilityChange () {

    if (!this._isHidden()) {
      if (this._onVisible) {
        if (this._onHiddenTimeout) {
          clearTimeout(this._onHiddenTimeout);
          this._onHiddenTimeout = null;
        } else {
          this._onVisible();
        }
      }
    } else {
      if (this._onHidden) {
        if (!this._onHiddenTimeout) {
          this._onHiddenTimeout = setTimeout(this._onHidden.bind(this), VISIBILITY_TIMEOUT);
        }
      }
    }
  }

  _getHiddenProp () {
    let prefixes = ['webkit', 'moz', 'ms', 'o'];

    // if 'hidden' is natively supported just return it
    if ('hidden' in document) return 'hidden';

    // otherwise loop over all the known prefixes unti we find one
    for (var i = 0; i < prefixes.length; i++) {
      if ((prefixes[i] + 'Hidden') in document) {
        return prefixes[i] + 'Hidden';
      }
    }

    // otherwise it's not supported
    return null;
  }

  _isHidden () {
    var prop = this._getHiddenProp();

    if (!prop) {
      return false;
    }
    return document[prop];
  }

  _getVisibilityEvent() {
    let hidden, visibilityChange;
    if (typeof document.hidden !== "undefined") {
      visibilityChange = "visibilitychange";
    } else if (typeof document.msHidden !== "undefined") {
      visibilityChange = "msvisibilitychange";
    } else if (typeof document.webkitHidden !== "undefined") {
      visibilityChange = "webkitvisibilitychange";
    }

    return visibilityChange;
  }

  _registerVisibilityEvent () {
    let event = this._getVisibilityEvent();
    document.addEventListener(event, this._handleVisibilityChange, false);
  }

}
