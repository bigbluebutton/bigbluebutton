import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import hark from 'hark';
import Icon from '/imports/ui/components/icon/component';
import cx from 'classnames';
import { styles } from './styles';

const MUTE_ALERT_CONFIG = Meteor.settings.public.app.mutedAlert;

const propTypes = {
  inputStream: PropTypes.objectOf(PropTypes.any).isRequired,
  isPresenter: PropTypes.bool.isRequired,
  isViewer: PropTypes.bool.isRequired,
  muted: PropTypes.bool.isRequired,
};

class MutedAlert extends Component {
  constructor(props) {
    super(props);

    this.state = {
      visible: false,
    };

    this.inputStream = null;
    this.speechEvents = null;
    this.timer = null;

    this.cloneMediaStream = this.cloneMediaStream.bind(this);
    this.resetTimer = this.resetTimer.bind(this);
  }

  componentDidMount() {
    this._isMounted = true;

    if (!this.hasValidInputStream()) return;

    this.cloneMediaStream();
    if (this.inputStream) {
      const { interval, threshold, duration } = MUTE_ALERT_CONFIG;
      this.speechEvents = hark(this.inputStream, { interval, threshold });
      this.speechEvents.on('speaking', () => {
        this.resetTimer();
        if (this._isMounted) this.setState({ visible: true });
      });
      this.speechEvents.on('stopped_speaking', () => {
        if (this._isMounted) {
          this.timer = setTimeout(() => this.setState(
            { visible: false },
          ), duration);
        }
      });
    }
  }

  componentDidUpdate() {
    this.cloneMediaStream();
  }

  componentWillUnmount() {
    this._isMounted = false;
    if (this.speechEvents) this.speechEvents.stop();
    if (this.inputStream) {
      this.inputStream.getTracks().forEach(t => t.stop());
    }
    this.resetTimer();
  }

  cloneMediaStream() {
    if (this.inputStream) return;
    const { inputStream, muted } = this.props;
    if (inputStream && !muted) this.inputStream = inputStream.clone();
  }

  resetTimer() {
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
  }

  hasValidInputStream() {
    const { inputStream } = this.props;

    if (inputStream
      && (typeof inputStream.getAudioTracks === 'function')
      && (inputStream.getAudioTracks().length > 0)
    ) return true;

    return false;
  }

  render() {
    const { isViewer, isPresenter, muted } = this.props;
    const { visible } = this.state;
    const style = {};
    style[styles.alignForMod] = !isViewer || isPresenter;

    return visible && muted ? (
      <div className={cx(styles.muteWarning, style)}>
        <span>
          <FormattedMessage
            id="app.muteWarning.label"
            description="Warning when someone speaks while muted"
            values={{
              0: <Icon iconName="mute" />,
            }}
          />
        </span>
      </div>
    ) : null;
  }
}

MutedAlert.propTypes = propTypes;

export default MutedAlert;
