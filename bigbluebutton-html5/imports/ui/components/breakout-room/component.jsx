import React, { PureComponent } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import _ from 'lodash';
import Button from '/imports/ui/components/button/component';
import { Session } from 'meteor/session';
import logger from '/imports/startup/client/logger';
import Styled from './styles';
import Service from './service';
import BreakoutRoomContainer from './breakout-remaining-time/container';
import VideoService from '/imports/ui/components/video-provider/service';
import { PANELS, ACTIONS } from '../layout/enums';
import { screenshareHasEnded } from '/imports/ui/components/screenshare/service';
import AudioManager from '/imports/ui/services/audio-manager';
import Settings from '/imports/ui/services/settings';

const intlMessages = defineMessages({
  breakoutTitle: {
    id: 'app.createBreakoutRoom.title',
    description: 'breakout title',
  },
  breakoutAriaTitle: {
    id: 'app.createBreakoutRoom.ariaTitle',
    description: 'breakout aria title',
  },
  breakoutDuration: {
    id: 'app.createBreakoutRoom.duration',
    description: 'breakout duration time',
  },
  breakoutRoom: {
    id: 'app.createBreakoutRoom.room',
    description: 'breakout room',
  },
  breakoutJoin: {
    id: 'app.createBreakoutRoom.join',
    description: 'label for join breakout room',
  },
  breakoutJoinAudio: {
    id: 'app.createBreakoutRoom.joinAudio',
    description: 'label for option to transfer audio',
  },
  breakoutReturnAudio: {
    id: 'app.createBreakoutRoom.returnAudio',
    description: 'label for option to return audio',
  },
  askToJoin: {
    id: 'app.createBreakoutRoom.askToJoin',
    description: 'label for generate breakout room url',
  },
  generatingURL: {
    id: 'app.createBreakoutRoom.generatingURL',
    description: 'label for generating breakout room url',
  },
  endAllBreakouts: {
    id: 'app.createBreakoutRoom.endAllBreakouts',
    description: 'Button label to end all breakout rooms',
  },
  alreadyConnected: {
    id: 'app.createBreakoutRoom.alreadyConnected',
    description: 'label for the user that is already connected to breakout room',
  },
  extendTimeInMinutes: {
    id: 'app.createBreakoutRoom.extendTimeInMinutes',
    description: 'Label for input to extend time (minutes)',
  },
  extendTimeLabel: {
    id: 'app.createBreakoutRoom.extendTimeLabel',
    description: 'Button label to incresce breakout rooms time',
  },
  extendTimeCancel: {
    id: 'app.createBreakoutRoom.extendTimeCancel',
    description: 'Button label to cancel extend breakout rooms time',
  },
  extendTimeHigherThanMeetingTimeError: {
    id: 'app.createBreakoutRoom.extendTimeHigherThanMeetingTimeError',
    description: 'Label for error when extend breakout rooms time would be higher than remaining time in parent meeting',
  },
});

class BreakoutRoom extends PureComponent {
  static sortById(a, b) {
    if (a.userId > b.userId) {
      return 1;
    }

    if (a.userId < b.userId) {
      return -1;
    }

    return 0;
  }

  constructor(props) {
    super(props);
    this.renderBreakoutRooms = this.renderBreakoutRooms.bind(this);
    this.getBreakoutURL = this.getBreakoutURL.bind(this);
    this.getBreakoutLabel = this.getBreakoutLabel.bind(this);
    this.renderDuration = this.renderDuration.bind(this);
    this.transferUserToBreakoutRoom = this.transferUserToBreakoutRoom.bind(this);
    this.changeExtendTime = this.changeExtendTime.bind(this);
    this.showExtendTimeForm = this.showExtendTimeForm.bind(this);
    this.resetExtendTimeForm = this.resetExtendTimeForm.bind(this);
    this.renderUserActions = this.renderUserActions.bind(this);
    this.returnBackToMeeeting = this.returnBackToMeeeting.bind(this);
    this.closePanel = this.closePanel.bind(this);
    this.state = {
      requestedBreakoutId: '',
      waiting: false,
      generated: false,
      joinedAudioOnly: false,
      breakoutId: '',
      visibleExtendTimeForm: false,
      visibleExtendTimeHigherThanMeetingTimeError: false,
      extendTime: 5,
    };
  }

  componentDidMount() {
    if (this.panel) this.panel.firstChild.focus();
  }

  componentDidUpdate() {
    const {
      getBreakoutRoomUrl,
      setBreakoutAudioTransferStatus,
      isMicrophoneUser,
      isReconnecting,
      breakoutRooms,
    } = this.props;

    const {
      waiting,
      requestedBreakoutId,
      joinedAudioOnly,
      generated,
    } = this.state;

    if (breakoutRooms.length === 0) {
      return this.closePanel();
    }

    if (waiting && !generated) {
      const breakoutUrlData = getBreakoutRoomUrl(requestedBreakoutId);

      if (!breakoutUrlData) return false;
      if (breakoutUrlData.redirectToHtml5JoinURL !== '') {
        window.open(breakoutUrlData.redirectToHtml5JoinURL, '_blank');
        _.delay(() => this.setState({ generated: true, waiting: false }), 1000);
      }
    }

    if (joinedAudioOnly && (!isMicrophoneUser || isReconnecting)) {
      this.clearJoinedAudioOnly();
      setBreakoutAudioTransferStatus({
        breakoutMeetingId: '',
        status: AudioManager.BREAKOUT_AUDIO_TRANSFER_STATES.DISCONNECTED,
      });
    }
    return true;
  }

  getBreakoutURL(breakoutId) {
    Session.set('lastBreakoutOpened', breakoutId);
    const { requestJoinURL, getBreakoutRoomUrl } = this.props;
    const { waiting } = this.state;
    const breakoutRoomUrlData = getBreakoutRoomUrl(breakoutId);
    if (!breakoutRoomUrlData && !waiting) {
      this.setState(
        {
          waiting: true,
          generated: false,
          requestedBreakoutId: breakoutId,
        },
        () => requestJoinURL(breakoutId),
      );
    }

    if (breakoutRoomUrlData) {
      window.open(breakoutRoomUrlData.redirectToHtml5JoinURL, '_blank');
      this.setState({ waiting: false, generated: false });
    }
    return null;
  }

  getBreakoutLabel(breakoutId) {
    const { intl, getBreakoutRoomUrl } = this.props;
    const { requestedBreakoutId, generated } = this.state;

    const breakoutRoomUrlData = getBreakoutRoomUrl(breakoutId);

    if (generated && requestedBreakoutId === breakoutId) {
      return intl.formatMessage(intlMessages.breakoutJoin);
    }

    if (breakoutRoomUrlData) {
      return intl.formatMessage(intlMessages.breakoutJoin);
    }

    return intl.formatMessage(intlMessages.askToJoin);
  }

  clearJoinedAudioOnly() {
    this.setState({ joinedAudioOnly: false });
  }

  changeExtendTime(event) {
    const newExtendTime = Number.parseInt(event.target.value, 10) || 0;
    this.setState({ extendTime: newExtendTime >= 0 ? newExtendTime : 0 });
  }

  showExtendTimeForm() {
    this.setState({ visibleExtendTimeForm: true });
  }

  showExtendTimeHigherThanMeetingTimeError(show) {
    this.setState({ visibleExtendTimeHigherThanMeetingTimeError: show });
  }

  resetExtendTimeForm() {
    this.setState({ visibleExtendTimeForm: false, extendTime: 5 });
  }

  transferUserToBreakoutRoom(breakoutId) {
    const { transferToBreakout } = this.props;
    transferToBreakout(breakoutId);
    this.setState({ joinedAudioOnly: true, breakoutId });
  }

  returnBackToMeeeting(breakoutId) {
    const { transferUserToMeeting, meetingId } = this.props;
    transferUserToMeeting(breakoutId, meetingId);
    this.setState({ joinedAudioOnly: false, breakoutId });
  }

  closePanel() {
    const { layoutContextDispatch } = this.props;

    layoutContextDispatch({
      type: ACTIONS.SET_SIDEBAR_CONTENT_IS_OPEN,
      value: false,
    });
    layoutContextDispatch({
      type: ACTIONS.SET_SIDEBAR_CONTENT_PANEL,
      value: PANELS.NONE,
    });
  }

  renderUserActions(breakoutId, joinedUsers, number) {
    const {
      isMicrophoneUser,
      amIModerator,
      amIPresenter,
      intl,
      isUserInBreakoutRoom,
      exitAudio,
      setBreakoutAudioTransferStatus,
      getBreakoutAudioTransferStatus,
    } = this.props;

    const {
      joinedAudioOnly,
      breakoutId: _stateBreakoutId,
      requestedBreakoutId,
      waiting,
      generated,
    } = this.state;

    const {
      breakoutMeetingId: currentAudioTransferBreakoutId,
      status,
    } = getBreakoutAudioTransferStatus();

    const isInBreakoutAudioTransfer = status
      === AudioManager.BREAKOUT_AUDIO_TRANSFER_STATES.CONNECTED;

    const stateBreakoutId = _stateBreakoutId || currentAudioTransferBreakoutId;
    const moderatorJoinedAudio = isMicrophoneUser && amIModerator;
    const disable = waiting && requestedBreakoutId !== breakoutId;
    const audioAction = joinedAudioOnly || isInBreakoutAudioTransfer
      ? () => {
        setBreakoutAudioTransferStatus({
          breakoutMeetingId: breakoutId,
          status: AudioManager.BREAKOUT_AUDIO_TRANSFER_STATES.RETURNING,
        });
        this.returnBackToMeeeting(breakoutId);
        return logger.debug({
          logCode: 'breakoutroom_return_main_audio',
          extraInfo: { logType: 'user_action' },
        }, 'Returning to main audio (breakout room audio closed)');
      }
      : () => {
        setBreakoutAudioTransferStatus({
          breakoutMeetingId: breakoutId,
          status: AudioManager.BREAKOUT_AUDIO_TRANSFER_STATES.CONNECTED,
        });
        this.transferUserToBreakoutRoom(breakoutId);
        return logger.debug({
          logCode: 'breakoutroom_join_audio_from_main_room',
          extraInfo: { logType: 'user_action' },
        }, 'joining breakout room audio (main room audio closed)');
      };
    return (
      <Styled.BreakoutActions>
        {
          isUserInBreakoutRoom(joinedUsers)
            ? (
              <Styled.AlreadyConnected>
                {intl.formatMessage(intlMessages.alreadyConnected)}
              </Styled.AlreadyConnected>
            )
            : (
              <Styled.JoinButton
                label={this.getBreakoutLabel(breakoutId)}
                data-test="breakoutJoin"
                aria-label={`${this.getBreakoutLabel(breakoutId)} ${this.props.breakoutRooms[number - 1]?.shortName }`}
                onClick={() => {
                  this.getBreakoutURL(breakoutId);
                  // leave main room's audio,
                  // and stops video and screenshare when joining a breakout room
                  exitAudio();
                  logger.debug({
                    logCode: 'breakoutroom_join',
                    extraInfo: { logType: 'user_action' },
                  }, 'joining breakout room closed audio in the main room');
                  VideoService.storeDeviceIds();
                  VideoService.exitVideo();
                  if (amIPresenter) screenshareHasEnded();
                }}
                disabled={disable}
              />
            )
        }
        {
          moderatorJoinedAudio
            ? [
              ('|'),
              (
                <Styled.AudioButton
                  label={
                    stateBreakoutId === breakoutId
                      && (joinedAudioOnly || isInBreakoutAudioTransfer)
                      ? intl.formatMessage(intlMessages.breakoutReturnAudio)
                      : intl.formatMessage(intlMessages.breakoutJoinAudio)
                  }
                  disabled={stateBreakoutId !== breakoutId && joinedAudioOnly}
                  key={`join-audio-${breakoutId}`}
                  onClick={audioAction}
                />
              ),
            ]
            : null
        }
      </Styled.BreakoutActions>
    );
  }

  renderBreakoutRooms() {
    const {
      breakoutRooms,
      intl,
    } = this.props;

    const {
      waiting,
      requestedBreakoutId,
    } = this.state;

    const { animations } = Settings.application;

    const roomItems = breakoutRooms.map((breakout) => (
      <Styled.BreakoutItems key={`breakoutRoomItems-${breakout.breakoutId}`} >
        <Styled.Content key={`breakoutRoomList-${breakout.breakoutId}`}>
          <Styled.BreakoutRoomListNameLabel aria-hidden>
            {breakout.isDefaultName
              ? intl.formatMessage(intlMessages.breakoutRoom, { 0: breakout.sequence })
              : breakout.shortName}
            <Styled.UsersAssignedNumberLabel>
              (
              {breakout.joinedUsers.length}
              )
            </Styled.UsersAssignedNumberLabel>
          </Styled.BreakoutRoomListNameLabel>
          {waiting && requestedBreakoutId === breakout.breakoutId ? (
            <span>
              {intl.formatMessage(intlMessages.generatingURL)}
              <Styled.ConnectingAnimation animations={animations}/>
            </span>
          ) : this.renderUserActions(
            breakout.breakoutId,
            breakout.joinedUsers,
            breakout.sequence.toString(),
          )}
        </Styled.Content>
        <Styled.JoinedUserNames>
          {breakout.joinedUsers
            .sort(BreakoutRoom.sortById)
            .filter((value, idx, arr) => !(value.userId === (arr[idx + 1] || {}).userId))
            .sort(Service.sortUsersByName)
            .map((u) => u.name)
            .join(', ')}
        </Styled.JoinedUserNames>
      </Styled.BreakoutItems>
    ));

    return (
      <Styled.BreakoutColumn>
        <Styled.BreakoutScrollableList>
          {roomItems}
        </Styled.BreakoutScrollableList>
      </Styled.BreakoutColumn>
    );
  }

  renderDuration() {
    const {
      intl,
      breakoutRooms,
      amIModerator,
      isMeteorConnected,
      extendBreakoutsTime,
      isExtendTimeHigherThanMeetingRemaining,
    } = this.props;
    const {
      extendTime,
      visibleExtendTimeForm,
      visibleExtendTimeHigherThanMeetingTimeError,
    } = this.state;
    return (
      <Styled.DurationContainer>
        {amIModerator && visibleExtendTimeForm ? (
          <Styled.ExtendTimeContainer>
            <label htmlFor="inputExtendTimeSelector" >
              {intl.formatMessage(intlMessages.extendTimeInMinutes)}
            </label>
            <br />
            <Styled.ExtendDurationInput
              id="inputExtendTimeSelector"
              type="number"
              min="1"
              value={extendTime}
              onChange={this.changeExtendTime}
              aria-label={intl.formatMessage(intlMessages.extendTimeInMinutes)}
            />
            <br />
            <br />
            {visibleExtendTimeHigherThanMeetingTimeError ? (
              <Styled.WithError>
                {intl.formatMessage(intlMessages.extendTimeHigherThanMeetingTimeError)}
                <br />
                <br />
              </Styled.WithError>
            ) : null}
            <Styled.EndButton
              color="default"
              disabled={!isMeteorConnected}
              size="sm"
              label={intl.formatMessage(intlMessages.extendTimeCancel)}
              onClick={this.resetExtendTimeForm}
            />
            <Styled.EndButton
              color="primary"
              disabled={!isMeteorConnected}
              size="sm"
              label={intl.formatMessage(intlMessages.extendTimeLabel)}
              onClick={() => {
                this.showExtendTimeHigherThanMeetingTimeError(false);

                if (isExtendTimeHigherThanMeetingRemaining(extendTime)) {
                  this.showExtendTimeHigherThanMeetingTimeError(true);
                } else if (extendBreakoutsTime(extendTime)) {
                  this.resetExtendTimeForm();
                }
              }}
            />
          </Styled.ExtendTimeContainer>
        ) : null}
        <Styled.Duration>
          <BreakoutRoomContainer
            messageDuration={intlMessages.breakoutDuration}
            breakoutRoom={breakoutRooms[0]}
          />
          {amIModerator && !visibleExtendTimeForm
            ? (
              <Button
                onClick={this.showExtendTimeForm}
                color="default"
                icon="add"
                circle
                hideLabel
                size="sm"
                label={intl.formatMessage(intlMessages.extendTimeLabel)}
                aria-label={intl.formatMessage(intlMessages.extendTimeLabel)}
                disabled={!isMeteorConnected}
              />
            )
            : null}
        </Styled.Duration>
      </Styled.DurationContainer>
    );
  }

  render() {
    const {
      isMeteorConnected,
      intl,
      endAllBreakouts,
      amIModerator,
    } = this.props;
    return (
      <Styled.Panel ref={(n) => this.panel = n}>
        <Styled.HeaderButton
          icon="left_arrow"
          label={intl.formatMessage(intlMessages.breakoutTitle)}
          aria-label={intl.formatMessage(intlMessages.breakoutAriaTitle)}
          onClick={() => {
            this.closePanel();
          }}
        />
        {this.renderBreakoutRooms()}
        {this.renderDuration()}
        {
          amIModerator
            ? (
              <Styled.EndButton
                color="primary"
                disabled={!isMeteorConnected}
                size="lg"
                label={intl.formatMessage(intlMessages.endAllBreakouts)}
                data-test="endBreakoutRoomsButton"
                onClick={() => {
                  this.closePanel();
                  endAllBreakouts();
                }}
              />
            ) : null
        }
      </Styled.Panel>
    );
  }
}

export default injectIntl(BreakoutRoom);
