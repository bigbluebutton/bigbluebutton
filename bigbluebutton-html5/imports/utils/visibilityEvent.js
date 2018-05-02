import { log } from '/imports/ui/services/api';

export default class VisibilityEvent {

  constructor () {
    this._onVisible = null;
    this._onHidden = null;

    this._handleVisibilityChange = this._handleVisibilityChange.bind(this);

    this._registerVisibilityEvent();
  }

  onVisible (f) {
    this._onVisible = f;
  }

  onHidden(f) {
    this._onHidden = f;
  }

  removeEventListeners() {
    let event = this._getVisibilityEvent();
    document.removeEventListener(event, this._handleVisibilityChange, false);
  }

  _handleVisibilityChange () {

    if (!this._isHidden()) {
      if (this._onVisible) {
        this._onVisible();
      }
    } else {
      if (this._onHidden) {
        this._onHidden();
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
