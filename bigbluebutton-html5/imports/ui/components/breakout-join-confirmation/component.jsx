import React, { Component } from 'react';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import { withModalMounter } from '/imports/ui/components/modal/service';
import Modal from '/imports/ui/components/modal/fullscreen/component';
import logger from '/imports/startup/client/logger';
import PropTypes from 'prop-types';
import AudioService from '../audio/service';
import VideoService from '../video-provider/service';
import { styles } from './styles';

const intlMessages = defineMessages({
  title: {
    id: 'app.breakoutJoinConfirmation.title',
    description: 'Join breakout room title',
  },
  message: {
    id: 'app.breakoutJoinConfirmation.message',
    description: 'Join breakout confirm message',
  },
  freeJoinMessage: {
    id: 'app.breakoutJoinConfirmation.freeJoinMessage',
    description: 'Join breakout confirm message',
  },
  confirmLabel: {
    id: 'app.createBreakoutRoom.join',
    description: 'Join confirmation button label',
  },
  confirmDesc: {
    id: 'app.breakoutJoinConfirmation.confirmDesc',
    description: 'adds context to confirm option',
  },
  dismissLabel: {
    id: 'app.breakoutJoinConfirmation.dismissLabel',
    description: 'Cancel button label',
  },
  dismissDesc: {
    id: 'app.breakoutJoinConfirmation.dismissDesc',
    description: 'adds context to dismiss option',
  },
});

const propTypes = {
  intl: intlShape.isRequired,
  breakout: PropTypes.objectOf(Object).isRequired,
  getURL: PropTypes.func.isRequired,
  mountModal: PropTypes.func.isRequired,
  breakoutURL: PropTypes.string.isRequired,
  isFreeJoin: PropTypes.bool.isRequired,
  voiceUserJoined: PropTypes.bool.isRequired,
  requestJoinURL: PropTypes.func.isRequired,
  breakouts: PropTypes.arrayOf(Object).isRequired,
  breakoutName: PropTypes.string.isRequired,
};

class BreakoutJoinConfirmation extends Component {
  constructor(props) {
    super(props);

    this.state = {
      selectValue: props.breakout.breakoutId,
    };

    this.handleJoinBreakoutConfirmation = this.handleJoinBreakoutConfirmation.bind(this);
    this.renderSelectMeeting = this.renderSelectMeeting.bind(this);
    this.handleSelectChange = this.handleSelectChange.bind(this);
  }

  componentDidMount() {
    const {
      isFreeJoin,
      requestJoinURL,
      getURL,
    } = this.props;

    const {
      selectValue,
    } = this.state;

    if (isFreeJoin && !getURL(selectValue)) {
      requestJoinURL(selectValue);
    }
  }

  handleJoinBreakoutConfirmation() {
    const {
      getURL,
      mountModal,
      breakoutURL,
      isFreeJoin,
      voiceUserJoined,
      requestJoinURL,
    } = this.props;

    const { selectValue } = this.state;
    if (!getURL(selectValue)) {
      requestJoinURL(selectValue);
    }
    const urlFromSelectedRoom = getURL(selectValue);
    const url = isFreeJoin ? urlFromSelectedRoom : breakoutURL;

    if (voiceUserJoined) {
      // leave main room's audio when joining a breakout room
      AudioService.exitAudio();
      logger.info({
        logCode: 'breakoutjoinconfirmation_ended_audio',
        extraInfo: { logType: 'user_action' },
      }, 'joining breakout room closed audio in the main room');
    }

    VideoService.exitVideo();
    if (url === '') {
      logger.error({
        logCode: 'breakoutjoinconfirmation_redirecting_to_url',
        extraInfo: { breakoutURL, isFreeJoin },
      }, 'joining breakout room but redirected to about://blank');
    }
    window.open(url);
    mountModal(null);
  }

  handleSelectChange(e) {
    const { value } = e.target;
    const {
      requestJoinURL,
      getURL,
    } = this.props;

    this.setState({ selectValue: value });
    if (!getURL(value)) {
      requestJoinURL(value);
    }
  }

  renderSelectMeeting() {
    const { breakouts, intl } = this.props;
    const { selectValue } = this.state;
    return (
      <div className={styles.selectParent}>
        {`${intl.formatMessage(intlMessages.freeJoinMessage)}`}
        <select
          className={styles.select}
          value={selectValue}
          onChange={this.handleSelectChange}
        >
          {
            breakouts.map(({ name, breakoutId }) => (
              <option
                key={breakoutId}
                value={breakoutId}
              >
                {name}
              </option>
            ))
          }
        </select>
      </div>
    );
  }

  render() {
    const { intl, breakoutName, isFreeJoin } = this.props;

    return (
      <Modal
        title={intl.formatMessage(intlMessages.title)}
        confirm={{
          callback: this.handleJoinBreakoutConfirmation,
          label: intl.formatMessage(intlMessages.confirmLabel),
          description: intl.formatMessage(intlMessages.confirmDesc),
          icon: 'popout_window',
        }}
        dismiss={{
          label: intl.formatMessage(intlMessages.dismissLabel),
          description: intl.formatMessage(intlMessages.dismissDesc),
        }}
      >
        { isFreeJoin ? this.renderSelectMeeting() : `${intl.formatMessage(intlMessages.message)} ${breakoutName}?`}
      </Modal>
    );
  }
}

export default withModalMounter(injectIntl(BreakoutJoinConfirmation));

BreakoutJoinConfirmation.propTypes = propTypes;
