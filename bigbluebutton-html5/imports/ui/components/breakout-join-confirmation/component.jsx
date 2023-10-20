import React, { Component } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import ModalFullscreen from '/imports/ui/components/common/modal/fullscreen/component';
import logger from '/imports/startup/client/logger';
import PropTypes from 'prop-types';
import AudioService from '../audio/service';
import VideoService from '../video-provider/service';
import { screenshareHasEnded } from '/imports/ui/components/screenshare/service';
import Styled from './styles';
import { Session } from 'meteor/session';

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
  generatingURL: {
    id: 'app.createBreakoutRoom.generatingURLMessage',
    description: 'label for generating breakout room url',
  },
});

const propTypes = {
  intl: PropTypes.object.isRequired,
  breakout: PropTypes.objectOf(Object).isRequired,
  getURL: PropTypes.func.isRequired,
  breakoutURL: PropTypes.string.isRequired,
  isFreeJoin: PropTypes.bool.isRequired,
  voiceUserJoined: PropTypes.bool.isRequired,
  requestJoinURL: PropTypes.func.isRequired,
  breakouts: PropTypes.arrayOf(Object).isRequired,
  breakoutName: PropTypes.string.isRequired,
};

let interval = null;

class BreakoutJoinConfirmation extends Component {
  constructor(props) {
    super(props);

    this.state = {
      selectValue: props.breakout.breakoutId,
      waiting: true,
    };

    this.handleJoinBreakoutConfirmation = this.handleJoinBreakoutConfirmation.bind(this);
    this.renderSelectMeeting = this.renderSelectMeeting.bind(this);
    this.handleSelectChange = this.handleSelectChange.bind(this);
  }

  componentDidMount() {
    const {
      isFreeJoin,
    } = this.props;

    const {
      selectValue,
    } = this.state;

    if (isFreeJoin) {
      this.fetchJoinURL(selectValue);
    } else {
      this.setState({ waiting: false });
    }
  }

  componentWillUnmount() {
    if (interval) clearInterval(interval);
  }

  handleJoinBreakoutConfirmation() {
    const {
      getURL,
      setIsOpen,
      breakoutURL,
      isFreeJoin,
      voiceUserJoined,
      requestJoinURL,
      amIPresenter,
    } = this.props;

    const { selectValue } = this.state;
    if (!getURL(selectValue)) {
      requestJoinURL(selectValue);
    }
    const urlFromSelectedRoom = getURL(selectValue);
    const url = isFreeJoin ? urlFromSelectedRoom : breakoutURL;

    // leave main room's audio, and stops video and screenshare when joining a breakout room
    if (voiceUserJoined) {
      AudioService.exitAudio();
      logger.info({
        logCode: 'breakoutjoinconfirmation_ended_audio',
        extraInfo: { logType: 'user_action' },
      }, 'joining breakout room closed audio in the main room');
    }

    VideoService.storeDeviceIds();
    VideoService.exitVideo();
    if (amIPresenter) screenshareHasEnded();
    if (url === '') {
      logger.error({
        logCode: 'breakoutjoinconfirmation_redirecting_to_url',
        extraInfo: { breakoutURL, isFreeJoin },
      }, 'joining breakout room but redirected to about://blank');
    }

    Session.set('lastBreakoutIdOpened', selectValue);
    window.open(url);
    setIsOpen(false);
  }

  async fetchJoinURL(selectValue) {
    const {
      requestJoinURL,
      getURL,
    } = this.props;

    this.setState({ selectValue });

    if (!getURL(selectValue)) {
      requestJoinURL(selectValue);

      this.setState({ waiting: true });

      await new Promise((resolve) => {

        interval = setInterval(() => {
          const url = getURL(selectValue);

          if (url !== "") {
            resolve();
            clearInterval(interval);
            this.setState({ waiting: false });
          }
        }, 1000)
      })
    } else {
      this.setState({ waiting: false });
    }
  }

  handleSelectChange(e) {
    const { value } = e.target;

    this.fetchJoinURL(value);
  }

  renderSelectMeeting() {
    const { breakouts, intl } = this.props;
    const { selectValue, waiting, } = this.state;
    return (
      <Styled.SelectParent>
        {`${intl.formatMessage(intlMessages.freeJoinMessage)}`}
        <Styled.Select
          value={selectValue}
          onChange={this.handleSelectChange}
          disabled={waiting}
        >
          {
            breakouts.map(({ name, breakoutId }) => (
              <option
                data-test="roomOption"
                key={breakoutId}
                value={breakoutId}
              >
                {name}
              </option>
            ))
          }
        </Styled.Select>
        { waiting ? <span data-test="labelGeneratingURL">{intl.formatMessage(intlMessages.generatingURL)}</span> : null}
      </Styled.SelectParent>
    );
  }

  render() {
    const { intl, breakoutName, isFreeJoin, setIsOpen,
      isOpen, priority,
    } = this.props;
    const { waiting } = this.state;

    return (
      <ModalFullscreen
        title={intl.formatMessage(intlMessages.title)}
        confirm={{
          callback: this.handleJoinBreakoutConfirmation,
          label: intl.formatMessage(intlMessages.confirmLabel),
          description: intl.formatMessage(intlMessages.confirmDesc),
          icon: 'popout_window',
          disabled: waiting,
        }}
        dismiss={{
          callback: () => setIsOpen(false),
          label: intl.formatMessage(intlMessages.dismissLabel),
          description: intl.formatMessage(intlMessages.dismissDesc),
        }}
        {...{ 
          setIsOpen,
          isOpen,
          priority,
        }}
      >
        { isFreeJoin ? this.renderSelectMeeting() : `${intl.formatMessage(intlMessages.message)} ${breakoutName}?`}
      </ModalFullscreen>
    );
  }
}

export default injectIntl(BreakoutJoinConfirmation);

BreakoutJoinConfirmation.propTypes = propTypes;
