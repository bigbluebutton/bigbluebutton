import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Session } from 'meteor/session';
import { withModalMounter } from '/imports/ui/components/common/modal/service';
import BreakoutJoinConfirmation from '/imports/ui/components/breakout-join-confirmation/container';
import BreakoutService from '../service';

const BREAKOUT_MODAL_DELAY = 200;

const propTypes = {
  mountModal: PropTypes.func.isRequired,
  currentBreakoutUrlData: PropTypes.shape({
    insertedTime: PropTypes.number.isRequired,
  }),
  breakoutUserIsIn: PropTypes.shape({
    sequence: PropTypes.number.isRequired,
  }),
  breakouts: PropTypes.arrayOf(PropTypes.shape({
    freeJoin: PropTypes.bool.isRequired,
  })),
};

const defaultProps = {
  currentBreakoutUrlData: undefined,
  breakoutUserIsIn: undefined,
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
      currentBreakoutUrlData,
      getBreakoutByUrlData,
      breakoutUserIsIn,
    } = this.props;

    const {
      didSendBreakoutInvite,
    } = this.state;

    const hasBreakouts = breakouts.length > 0;

    if (hasBreakouts && !breakoutUserIsIn && BreakoutService.checkInviteModerators()) {
      const freeJoinRooms = breakouts.filter((breakout) => breakout.freeJoin);

      if (currentBreakoutUrlData) {
        const breakoutRoom = getBreakoutByUrlData(currentBreakoutUrlData);
        const currentInsertedTime = currentBreakoutUrlData.insertedTime;
        const oldCurrentUrlData = oldProps.currentBreakoutUrlData || {};
        const oldInsertedTime = oldCurrentUrlData.insertedTime;
        if (currentInsertedTime !== oldInsertedTime) {
          const lastBreakoutId = Session.get('lastBreakoutOpened');
          if (breakoutRoom.breakoutId !== lastBreakoutId) {
            this.inviteUserToBreakout(breakoutRoom);
          }
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

    if (!hasBreakouts && didSendBreakoutInvite) {
      this.setState({ didSendBreakoutInvite: false });
    }
  }

  inviteUserToBreakout(breakout) {
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
