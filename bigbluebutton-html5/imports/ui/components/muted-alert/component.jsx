import React, { Component } from 'react';
import PropTypes from 'prop-types';
import hark from 'hark';
import Icon from '/imports/ui/components/common/icon/component';
import Styled from './styles';
import { defineMessages, injectIntl } from 'react-intl';
import { notify } from '/imports/ui/services/notification';
import TooltipContainer from '/imports/ui/components/common/tooltip/container';

const MUTE_ALERT_CONFIG = Meteor.settings.public.app.mutedAlert;

const propTypes = {
  inputStream: PropTypes.objectOf(PropTypes.any).isRequired,
  isPresenter: PropTypes.bool.isRequired,
  isViewer: PropTypes.bool.isRequired,
  muted: PropTypes.bool.isRequired,
};

const intlMessages = defineMessages({
  disableMessage: {
    id: 'app.muteWarning.disableMessage',
    description: 'Message used when mute alerts has been disabled',
  },
  tooltip: {
    id: 'app.muteWarning.tooltip',
    description: 'Tooltip message',
  },
  warningLabel: {
    id: 'app.muteWarning.label',
    description: 'Warning when someone speaks while muted',
  },
});

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
    this.closeAlert = this.closeAlert.bind(this);
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
      this.inputStream.getTracks().forEach((t) => t.stop());
    }
    this.resetTimer();
  }

  cloneMediaStream() {
    if (this.inputStream) return;
    const { inputStream } = this.props;

    if (inputStream) {
      this.inputStream = inputStream.clone();
      this.enableInputStreamAudioTracks(this.inputStream);
    }
  }

  /* eslint-disable no-param-reassign */
  enableInputStreamAudioTracks() {
    if (!this.inputStream) return;
    this.inputStream.getAudioTracks().forEach((t) => { t.enabled = true; });
  }
  /* eslint-enable no-param-reassign */

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

  closeAlert() {
    const { intl } = this.props;

    this.setState({ visible: false });
    this.speechEvents.stop();

    notify(intl.formatMessage(intlMessages.disableMessage), 'info', 'mute');
  }

  render() {
    const {
      isViewer, isPresenter, muted, intl,
    } = this.props;
    const { visible } = this.state;

    return visible && muted ? (
      <TooltipContainer
        title={intl.formatMessage(intlMessages.tooltip)}
        position="top"
      >
        <Styled.MuteWarning
          alignForMod={!isViewer || isPresenter}
          alignForViewer={isViewer}
          onClick={() => this.closeAlert()}
        >
          <span>
            {intl.formatMessage(intlMessages.warningLabel, { 0: <Icon iconName="mute" /> })}
          </span>
        </Styled.MuteWarning>
      </TooltipContainer>
    ) : null;
  }
}

MutedAlert.propTypes = propTypes;

export default injectIntl(MutedAlert);
