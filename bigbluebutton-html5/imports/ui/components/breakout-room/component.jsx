import React, { PureComponent } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import _ from 'lodash';
import { Session } from 'meteor/session';
import logger from '/imports/startup/client/logger';
import Styled from './styles';
import Service from './service';
import BreakoutRoomContainer from './breakout-remaining-time/container';
import MessageFormContainer from './message-form/container';
import VideoService from '/imports/ui/components/video-provider/service';
import { PANELS, ACTIONS } from '../layout/enums';
import { screenshareHasEnded } from '/imports/ui/components/screenshare/service';
import AudioManager from '/imports/ui/services/audio-manager';
import Settings from '/imports/ui/services/settings';
import BreakoutDropdown from '/imports/ui/components/breakout-room/breakout-dropdown/component';
import Users from '/imports/api/users';
import Auth from '/imports/ui/services/auth';
import Header from '/imports/ui/components/common/control-header/component';

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
  chatTitleMsgAllRooms: {
    id: 'app.createBreakoutRoom.chatTitleMsgAllRooms',
    description: 'chat title for send message to all rooms',
  },
  alreadyConnected: {
    id: 'app.createBreakoutRoom.alreadyConnected',
    description: 'label for the user that is already connected to breakout room',
  },
  setTimeInMinutes: {
    id: 'app.createBreakoutRoom.setTimeInMinutes',
    description: 'Label for input to set time (minutes)',
  },
  setTimeLabel: {
    id: 'app.createBreakoutRoom.setTimeLabel',
    description: 'Button label to set breakout rooms time',
  },
  setTimeCancel: {
    id: 'app.createBreakoutRoom.setTimeCancel',
    description: 'Button label to cancel set breakout rooms time',
  },
  setTimeHigherThanMeetingTimeError: {
    id: 'app.createBreakoutRoom.setTimeHigherThanMeetingTimeError',
    description: 'Label for error when new breakout rooms time would be higher than remaining time in parent meeting',
  },
});

let prevBreakoutData = {};

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
    this.hasBreakoutUrl = this.hasBreakoutUrl.bind(this);
    this.getBreakoutLabel = this.getBreakoutLabel.bind(this);
    this.renderDuration = this.renderDuration.bind(this);
    this.transferUserToBreakoutRoom = this.transferUserToBreakoutRoom.bind(this);
    this.changeSetTime = this.changeSetTime.bind(this);
    this.showSetTimeForm = this.showSetTimeForm.bind(this);
    this.resetSetTimeForm = this.resetSetTimeForm.bind(this);
    this.renderUserActions = this.renderUserActions.bind(this);
    this.returnBackToMeeeting = this.returnBackToMeeeting.bind(this);
    this.closePanel = this.closePanel.bind(this);
    this.handleClickOutsideDurationContainer = this.handleClickOutsideDurationContainer.bind(this);
    this.state = {
      requestedBreakoutId: '',
      waiting: false,
      generated: false,
      joinedAudioOnly: false,
      breakoutId: '',
      visibleSetTimeForm: false,
      visibleSetTimeHigherThanMeetingTimeError: false,
      newTime: 15,
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
      if (breakoutUrlData.redirectToHtml5JoinURL !== ''
        && breakoutUrlData.redirectToHtml5JoinURL !== prevBreakoutData.redirectToHtml5JoinURL) {
        prevBreakoutData = breakoutUrlData;
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

  hasBreakoutUrl(breakoutId) {
    const { getBreakoutRoomUrl } = this.props;
    const { requestedBreakoutId, generated } = this.state;

    const breakoutRoomUrlData = getBreakoutRoomUrl(breakoutId);

    if ((generated && requestedBreakoutId === breakoutId) || breakoutRoomUrlData) {
      return true;
    }

    return false;
  }

  getBreakoutLabel(breakoutId) {
    const { intl } = this.props;
    const hasBreakoutUrl = this.hasBreakoutUrl(breakoutId)

    if (hasBreakoutUrl) {
      return intl.formatMessage(intlMessages.breakoutJoin);
    }

    return intl.formatMessage(intlMessages.askToJoin);
  }

  clearJoinedAudioOnly() {
    this.setState({ joinedAudioOnly: false });
  }

  changeSetTime(event) {
    const newSetTime = Number.parseInt(event.target.value, 10) || 0;
    this.setState({ newTime: newSetTime >= 0 ? newSetTime : 0 });
  }

  handleClickOutsideDurationContainer(e) {
    if (this.durationContainerRef) {
      const { x, right, y, bottom } = this.durationContainerRef.getBoundingClientRect();

      if (e.clientX < x || e.clientX > right || e.clientY < y || e.clientY > bottom) {
        this.resetSetTimeForm();
      }
    }
  }

  showSetTimeForm() {
    this.setState({ visibleSetTimeForm: true });
    window.addEventListener('click', this.handleClickOutsideDurationContainer);
  }

  showSetTimeHigherThanMeetingTimeError(show) {
    this.setState({ visibleSetTimeHigherThanMeetingTimeError: show });
  }

  resetSetTimeForm() {
    this.setState({ visibleSetTimeForm: false, newTime: 5 });
    window.removeEventListener('click', this.handleClickOutsideDurationContainer);
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

  renderUserActions(breakoutId, joinedUsers, shortName) {
    const {
      isMicrophoneUser,
      amIModerator,
      amIPresenter,
      intl,
      isUserInBreakoutRoom,
      forceExitAudio,
      rejoinAudio,
      setBreakoutAudioTransferStatus,
      getBreakoutAudioTransferStatus,
    } = this.props;

    const {
      joinedAudioOnly,
      breakoutId: _stateBreakoutId,
      requestedBreakoutId,
      waiting,
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
    const hasBreakoutUrl = this.hasBreakoutUrl(breakoutId);
    const dataTest = `${hasBreakoutUrl ? 'join' : 'askToJoin'}${shortName.replace(' ', '')}`;

    const audioAction = joinedAudioOnly || isInBreakoutAudioTransfer
      ? () => {
        setBreakoutAudioTransferStatus({
          breakoutMeetingId: breakoutId,
          status: AudioManager.BREAKOUT_AUDIO_TRANSFER_STATES.RETURNING,
        });
        this.returnBackToMeeeting(breakoutId);
        return logger.info({
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
        return logger.info({
          logCode: 'breakoutroom_join_audio_from_main_room',
          extraInfo: { logType: 'user_action' },
        }, 'joining breakout room audio (main room audio closed)');
      };
    return (
      <Styled.BreakoutActions>
        {
          isUserInBreakoutRoom(joinedUsers)
            ? (
              <Styled.AlreadyConnected data-test="alreadyConnected">
                {intl.formatMessage(intlMessages.alreadyConnected)}
              </Styled.AlreadyConnected>
            )
            : (
              <Styled.JoinButton
                label={this.getBreakoutLabel(breakoutId)}
                data-test={dataTest}
                aria-label={`${this.getBreakoutLabel(breakoutId)} ${shortName}`}
                onClick={() => {
                  this.getBreakoutURL(breakoutId);
                  // leave main room's audio,
                  // and stops video and screenshare when joining a breakout room
                  forceExitAudio();
                  logger.info({
                    logCode: 'breakoutroom_join',
                    extraInfo: { logType: 'user_action' },
                  }, 'joining breakout room closed audio in the main room');
                  VideoService.storeDeviceIds();
                  VideoService.exitVideo();
                  if (amIPresenter) screenshareHasEnded();

                  Tracker.autorun((c) => {
                    const selector = {
                      meetingId: breakoutId,
                    };

                    const query = Users.find(selector, {
                      fields: {
                        loggedOut: 1,
                        extId: 1,
                      },
                    });

                    const observeLogOut = (user) => {
                      if (user?.loggedOut && user?.extId?.startsWith(Auth.userID)) {
                        rejoinAudio();
                        c.stop();
                      }
                    }

                    query.observe({
                      added: observeLogOut,
                      changed: observeLogOut,
                    });
                  });
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
            breakout.shortName,
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
      setBreakoutsTime,
      isNewTimeHigherThanMeetingRemaining,
    } = this.props;
    const {
      newTime,
      visibleSetTimeForm,
      visibleSetTimeHigherThanMeetingTimeError,
    } = this.state;
    return (
      <Styled.DurationContainer
        centeredText={!visibleSetTimeForm}
        ref={(ref) => this.durationContainerRef = ref}
      >
        <Styled.Duration>
          <BreakoutRoomContainer
            messageDuration={intlMessages.breakoutDuration}
            breakoutRoom={breakoutRooms[0]}
            fromBreakoutPanel
          />
        </Styled.Duration>
        {amIModerator && visibleSetTimeForm ? (
          <Styled.SetTimeContainer>
            <label htmlFor="inputSetTimeSelector" >
              {intl.formatMessage(intlMessages.setTimeInMinutes)}
            </label>
            <br />
            <Styled.FlexRow>
              <Styled.SetDurationInput
                id="inputSetTimeSelector"
                type="number"
                min="1"
                value={newTime}
                onChange={this.changeSetTime}
                aria-label={intl.formatMessage(intlMessages.setTimeInMinutes)}
              />
              &nbsp;
              &nbsp;
              <Styled.EndButton
                color="primary"
                disabled={!isMeteorConnected}
                size="sm"
                label={intl.formatMessage(intlMessages.setTimeLabel)}
                onClick={() => {
                  this.showSetTimeHigherThanMeetingTimeError(false);

                  if (isNewTimeHigherThanMeetingRemaining(newTime)) {
                    this.showSetTimeHigherThanMeetingTimeError(true);
                  } else if (setBreakoutsTime(newTime)) {
                    this.resetSetTimeForm();
                  }
                }}
              />
            </Styled.FlexRow>
            {visibleSetTimeHigherThanMeetingTimeError ? (
              <Styled.WithError>
                {intl.formatMessage(intlMessages.setTimeHigherThanMeetingTimeError)}
              </Styled.WithError>
            ) : null}
          </Styled.SetTimeContainer>
        ) : null}
      </Styled.DurationContainer>
    );
  }

  render() {
    const {
      isMeteorConnected,
      intl,
      endAllBreakouts,
      amIModerator,
      isRTL,
    } = this.props;
    return (
      <Styled.Panel ref={(n) => this.panel = n}>
        <Header
          leftButtonProps={{
            'aria-label': intl.formatMessage(intlMessages.breakoutAriaTitle),
            label: intl.formatMessage(intlMessages.breakoutTitle),
            onClick: () => {
              this.closePanel();
            },
          }}
          customRightButton={amIModerator && (
            <BreakoutDropdown
              openBreakoutTimeManager={this.showSetTimeForm}
              endAllBreakouts={() => {
                this.closePanel();
                endAllBreakouts();
              }}
              isMeteorConnected={isMeteorConnected}
              amIModerator={amIModerator}
              isRTL={isRTL}
            />
          )}
        />
        {this.renderDuration()}
        {amIModerator
          ? (
            <MessageFormContainer
              {...{
                title: intl.formatMessage(intlMessages.chatTitleMsgAllRooms),
              }}
              chatId="breakouts"
              chatTitle={intl.formatMessage(intlMessages.chatTitleMsgAllRooms)}
              disabled={!isMeteorConnected}
              connected={isMeteorConnected}
              locked={false}
            />
          ) : null }
        {amIModerator ? <Styled.Separator /> : null }
        {this.renderBreakoutRooms()}
      </Styled.Panel>
    );
  }
}

export default injectIntl(BreakoutRoom);
