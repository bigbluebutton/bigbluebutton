import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Session } from 'meteor/session';
import { withModalMounter } from '/imports/ui/components/common/modal/service';
import BreakoutJoinConfirmation from '/imports/ui/components/breakout-join-confirmation/container';
import BreakoutService from '../service';

const BREAKOUT_MODAL_DELAY = 200;

const propTypes = {
  mountModal: PropTypes.func.isRequired,
  lastBreakoutReceived: PropTypes.shape({
    breakoutUrlData: PropTypes.object.isRequired,
  }),
  breakoutRoomsUserIsIn: PropTypes.shape({
    sequence: PropTypes.number.isRequired,
  }),
  breakouts: PropTypes.arrayOf(PropTypes.shape({
    freeJoin: PropTypes.bool.isRequired,
  })),
};

const defaultProps = {
  lastBreakoutReceived: undefined,
  breakoutRoomsUserIsIn: undefined,
  breakouts: [],
};

const openBreakoutJoinConfirmation = (breakout, breakoutName, mountModal) => mountModal(
  <BreakoutJoinConfirmation
    breakout={breakout}
    breakoutName={breakoutName}
  />,
);

class BreakoutRoomInvitation extends Component {
  constructor(props) {
    super(props);

    this.state = {
      didSendBreakoutInvite: false,
    };
  }

  componentDidMount() {
    // use dummy old data on mount so it works if no data changes
    this.checkBreakouts({ breakouts: [] });
  }

  componentDidUpdate(oldProps) {
    this.checkBreakouts(oldProps);
  }

  checkBreakouts(oldProps) {
    const {
      breakouts,
      lastBreakoutReceived,
      breakoutRoomsUserIsIn,
    } = this.props;

    const {
      didSendBreakoutInvite,
    } = this.state;

    const hasBreakoutsAvailable = breakouts.length > 0;

    if (hasBreakoutsAvailable
      && !breakoutRoomsUserIsIn
      && BreakoutService.checkInviteModerators()) {
      const freeJoinRooms = breakouts.filter((breakout) => breakout.freeJoin);

      if (lastBreakoutReceived) {
        const lastBreakoutIdOpened = Session.get('lastBreakoutIdOpened');
        const oldLastBktReceivedInsertedTime = (typeof oldProps.lastBreakoutReceived === 'object') ? oldProps.lastBreakoutReceived.breakoutUrlData.insertedTime : 0;

        // check if user has a new invitation
        if (lastBreakoutReceived.breakoutUrlData.insertedTime !== oldLastBktReceivedInsertedTime
        // or check if user just left a room and was invited to another room in last 15 secs
        || (typeof oldProps.breakoutRoomsUserIsIn === 'object'
            && !breakoutRoomsUserIsIn
            && lastBreakoutReceived.breakoutId !== lastBreakoutIdOpened
          && lastBreakoutReceived.breakoutUrlData.insertedTime > (new Date().getTime()) - 15000)
        ) {
          this.inviteUserToBreakout(lastBreakoutReceived);
        }
      } else if (freeJoinRooms.length > 0 && !didSendBreakoutInvite) {
        const maxSeq = Math.max(...freeJoinRooms.map(((room) => room.sequence)));
        // Check if received all rooms and Pick a room randomly
        if (maxSeq === freeJoinRooms.length) {
          const randomRoom = freeJoinRooms[Math.floor(Math.random() * freeJoinRooms.length)];
          this.inviteUserToBreakout(randomRoom);
          this.setState({ didSendBreakoutInvite: true });
        }
      }
    }

    if (!hasBreakoutsAvailable && didSendBreakoutInvite) {
      this.setState({ didSendBreakoutInvite: false });
    }
  }

  inviteUserToBreakout(breakout) {
    Session.set('lastBreakoutIdInvited', breakout.breakoutId);
    const {
      mountModal,
    } = this.props;
    // There's a race condition on page load with modals. Only one modal can be shown at a
    // time and new ones overwrite old ones. We delay the opening of the breakout modal
    // because it should always be on top if breakouts are running.
    setTimeout(() => {
      openBreakoutJoinConfirmation.call(this, breakout, breakout.name, mountModal);
    }, BREAKOUT_MODAL_DELAY);
  }

  render() {
    return null;
  }
}

BreakoutRoomInvitation.propTypes = propTypes;
BreakoutRoomInvitation.defaultProps = defaultProps;

export default withModalMounter(BreakoutRoomInvitation);
