import React, { Component } from 'react';
import { Session } from 'meteor/session';
import { withModalMounter } from '/imports/ui/components/modal/service';
import BreakoutJoinConfirmation from '/imports/ui/components/breakout-join-confirmation/container';

const openBreakoutJoinConfirmation = (breakout, breakoutName, mountModal) => mountModal(
  <BreakoutJoinConfirmation
    breakout={breakout}
    breakoutName={breakoutName}
  />,
);

const closeBreakoutJoinConfirmation = mountModal => mountModal(null);

class BreakoutRoomInvitation extends Component {
  componentDidUpdate(oldProps) {
    const {
      breakouts,
      mountModal,
      currentBreakoutUser,
      getBreakoutByUser,
    } = this.props;

    const hadBreakouts = oldProps.breakouts.length;
    const hasBreakouts = breakouts.length;
    if (!hasBreakouts && hadBreakouts) {
      closeBreakoutJoinConfirmation(mountModal);
    }

    if (hasBreakouts && currentBreakoutUser) {
      const currentIsertedTime = currentBreakoutUser.insertedTime;
      const oldCurrentUser = oldProps.currentBreakoutUser || {};
      const oldInsertedTime = oldCurrentUser.insertedTime;

      if (currentIsertedTime !== oldInsertedTime) {
        const breakoutRoom = getBreakoutByUser(currentBreakoutUser);
        const breakoutId = Session.get('lastBreakoutOpened');
        if (breakoutRoom.breakoutId !== breakoutId) {
          this.inviteUserToBreakout(breakoutRoom);
        }
      }
    }
  }

  inviteUserToBreakout(breakout) {
    const {
      mountModal,
    } = this.props;
    openBreakoutJoinConfirmation.call(this, breakout, breakout.name, mountModal);
  }

  render() {
    return null;
  }
}

export default withModalMounter(BreakoutRoomInvitation);
