import { PureComponent } from 'react';
import PropTypes from 'prop-types';

const PERMISSION_GRANTED = 'granted';
const PERMISSION_DEFAULT = 'default';

class ChatDeskAlert extends PureComponent {
  constructor(props) {
    super(props);
    this.supported = false;
    this.granted = false;
    this.isWindowFocus = true;
    this.handlePermission = this.handlePermission.bind(this);
    this.onWindowFocus = this.onWindowFocus.bind(this);
    this.onWindowBlur = this.onWindowBlur.bind(this);
    this.handleNotification();
    window.addEventListener('focus', this.onWindowFocus);
    window.addEventListener('blur', this.onWindowBlur);
  }

  componentWillUnmount() {
    window.removeEventListener('focus', this.onWindowFocus);
    window.removeEventListener('blur', this.onWindowBlur);
  }

  onWindowFocus() {
    this.isWindowFocus = true;
  }

  onWindowBlur() {
    this.isWindowFocus = false;
  }

  handlePermission(permission) {
    if (permission === PERMISSION_GRANTED) {
      this.granted = true;
    } else { this.granted = false; }
  }

  handleNotification() {
    if (('Notification' in window) && window.Notification) {
      this.supported = true;
      const { permission } = window.Notification;
      if (permission === PERMISSION_GRANTED) {
        this.granted = true;
      } else if (permission === PERMISSION_DEFAULT) {
        try {
          Notification.requestPermission().then(this.handlePermission);
        } catch (err) {
          Notification.requestPermission(this.handlePermission);
        }
      }
    }
  }

  render() {
    const {
      messageId, title, body, silent, dir, lang,
    } = this.props;
    if (
      !messageId || !this.supported || !this.granted
         || (this.isWindowFocus && !document.hidden)
    ) return null;
    try {
      const notification = new Notification(title, {
        body, silent, dir, lang,
      });
    } catch (err) {
      return null;
    }
    return null;
  }
}

ChatDeskAlert.propTypes = {
  messageId: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  body: PropTypes.string.isRequired,
  dir: PropTypes.string,
  lang: PropTypes.string,
  silent: PropTypes.bool,
};

ChatDeskAlert.defaultProps = {
  dir: 'ltr',
  lang: 'en',
  silent: true,
};
export default ChatDeskAlert;
