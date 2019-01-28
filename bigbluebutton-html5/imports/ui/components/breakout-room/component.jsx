import React, { Component } from 'react';

import { defineMessages, injectIntl } from 'react-intl';
import _ from 'lodash';
import Button from '/imports/ui/components/button/component';
import { styles } from './styles';
import Icon from '../icon/component';
import BreakoutRoomContainer from './breakout-remaining-time/container';

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
    description: 'breakout duration time',
  },
  breakoutJoin: {
    id: 'app.createBreakoutRoom.join',
    description: 'breakout duration time',
  },
  breakoutJoinAudio: {
    id: 'app.createBreakoutRoom.joinAudio',
    description: 'breakout duration time',
  },
  breakoutReturnAudio: {
    id: 'app.createBreakoutRoom.returnAudio',
    description: 'breakout duration time',
  },
  generatingURL: {
    id: 'app.createBreakoutRoom.generatingURL',
    description: 'breakout duration time',
  },
  generatedURL: {
    id: 'app.createBreakoutRoom.generatedURL',
    description: 'breakout duration time',
  },
  endAllBreakouts: {
    id: 'app.createBreakoutRoom.endAllBreakouts',
    description: 'breakout duration time',
  },
});

class BreakoutRoom extends Component {
  constructor(props) {
    super(props);
    this.renderBreakoutRooms = this.renderBreakoutRooms.bind(this);
    this.getBreakoutURL = this.getBreakoutURL.bind(this);
    this.renderDuration = this.renderDuration.bind(this);
    this.transferUserToBreakoutRoom = this.transferUserToBreakoutRoom.bind(this);
    this.renderUserActions = this.renderUserActions.bind(this);
    this.returnBackToMeeeting = this.returnBackToMeeeting.bind(this);
    this.state = {
      requestedBreakoutId: '',
      waiting: false,
      generated: false,
      joinedAudioOnly: false,
      breakoutId: '',
    };
  }

  componentDidUpdate() {
    const {
      breakoutRoomUser,
      breakoutRooms,
      closeBreakoutPanel,
    } = this.props;

    const {
      waiting,
      generated,
      requestedBreakoutId,
    } = this.state;

    if (breakoutRooms.length <= 0) closeBreakoutPanel();

    if (waiting && !generated) {
      const breakoutUser = breakoutRoomUser(requestedBreakoutId);

      if (!breakoutUser) return;
      if (breakoutUser.redirectToHtml5JoinURL !== '') {
        _.delay(() => this.setState({ generated: true, waiting: false }), 1000);
      }
    }
  }

  getBreakoutURL(breakoutId) {
    const { requestJoinURL, breakoutRoomUser } = this.props;
    const { waiting } = this.state;
    const hasUser = breakoutRoomUser(breakoutId);
    if (!hasUser && !waiting) {
      this.setState(
        { waiting: true, requestedBreakoutId: breakoutId },
        () => requestJoinURL(breakoutId),
      );
    }

    if (hasUser) {
      window.open(hasUser.redirectToHtml5JoinURL);
      this.setState({ waiting: false, generated: false });
    }
    return null;
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

  renderUserActions(breakoutId, number) {
    const {
      isMicrophoneUser,
      isModerator,
      intl,
    } = this.props;

    const {
      joinedAudioOnly,
      breakoutId: stateBreakoutId,
      generated,
      requestedBreakoutId,
      waiting,
    } = this.state;

    const moderatorJoinedAudio = isMicrophoneUser && isModerator;
    const disable = waiting && requestedBreakoutId !== breakoutId;
    const audioAction = joinedAudioOnly
      ? () => this.returnBackToMeeeting(breakoutId)
      : () => this.transferUserToBreakoutRoom(breakoutId);
    return (
      <div className={styles.breakoutActions}>
        <Button
          label={generated && requestedBreakoutId === breakoutId
            ? intl.formatMessage(intlMessages.generatedURL)
            : intl.formatMessage(intlMessages.breakoutJoin)}
          aria-label={generated && requestedBreakoutId === breakoutId
            ? intl.formatMessage(intlMessages.generatedURL)
            : `${intl.formatMessage(intlMessages.breakoutJoin)} ${number}`}
          onClick={() => this.getBreakoutURL(breakoutId)}
          disabled={disable}
          className={styles.joinButton}
        />
        {
          moderatorJoinedAudio
            ? [
              ('|'),
              (
                <Button
                  label={
                    moderatorJoinedAudio
                    && stateBreakoutId === breakoutId
                    && joinedAudioOnly
                      ? intl.formatMessage(intlMessages.breakoutReturnAudio)
                      : intl.formatMessage(intlMessages.breakoutJoinAudio)
                  }
                  className={styles.button}
                  onClick={audioAction}
                />
              ),
            ]
            : null
        }
      </div>
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

    const roomItems = breakoutRooms.map(item => (
      <div className={styles.content} key={`breakoutRoomList-${item.breakoutId}`}>
        <span aria-hidden>{intl.formatMessage(intlMessages.breakoutRoom, item.sequence.toString())}</span>
        {waiting && requestedBreakoutId === item.breakoutId ? (
          <span>
            {intl.formatMessage(intlMessages.generatingURL)}
            <span className={styles.connectingAnimation} />
          </span>
        ) : this.renderUserActions(item.breakoutId, item.sequence.toString())}
      </div>
    ));

    return roomItems;
  }

  renderDuration() {
    const { breakoutRooms } = this.props;
    return (
      <span className={styles.duration}>
        <BreakoutRoomContainer
          messageDuration={intlMessages.breakoutDuration}
          breakoutRoom={breakoutRooms[0]}
        />
      </span>
    );
  }

  render() {
    const {
      intl, endAllBreakouts, isModerator, closeBreakoutPanel,
    } = this.props;
    return (
      <div className={styles.panel}>
        <Button
          icon="left_arrow"
          label={intl.formatMessage(intlMessages.breakoutTitle)}
          aria-label={intl.formatMessage(intlMessages.breakoutAriaTitle)}
          className={styles.header}
          onClick={closeBreakoutPanel}
        />
        {this.renderBreakoutRooms()}
        {this.renderDuration()}
        {
          isModerator
            ? (
              <Button
                color="primary"
                size="lg"
                label={intl.formatMessage(intlMessages.endAllBreakouts)}
                className={styles.endButton}
                onClick={endAllBreakouts}
              />
            ) : null
        }
      </div>
    );
  }
}

export default injectIntl(BreakoutRoom);
