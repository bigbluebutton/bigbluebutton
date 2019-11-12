import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Session } from 'meteor/session';
import { withModalMounter } from '/imports/ui/components/modal/service';
import BreakoutJoinConfirmation from '/imports/ui/components/breakout-join-confirmation/container';

const BREAKOUT_MODAL_DELAY = 200;

const propTypes = {
  mountModal: PropTypes.func.isRequired,
  currentBreakoutUser: PropTypes.shape({
    insertedTime: PropTypes.number.isRequired,
  }),
  getBreakoutByUser: PropTypes.func.isRequired,
  breakoutUserIsIn: PropTypes.shape({
    sequence: PropTypes.number.isRequired,
  }),
  breakouts: PropTypes.arrayOf(PropTypes.shape({
    freeJoin: PropTypes.bool.isRequired,
  })),
};

const defaultProps = {
  currentBreakoutUser: undefined,
  breakoutUserIsIn: undefined,
  breakouts: [],
};

const openBreakoutJoinConfirmation = (breakout, breakoutName, mountModal) => mountModal(
  <BreakoutJoinConfirmation
    breakout={breakout}
    breakoutName={breakoutName}
  />,
);

const closeBreakoutJoinConfirmation = mountModal => mountModal(null);

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
      mountModal,
      currentBreakoutUser,
      getBreakoutByUser,
      breakoutUserIsIn,
    } = this.props;

    const {
      didSendBreakoutInvite,
    } = this.state;

    const hadBreakouts = oldProps.breakouts.length > 0;
    const hasBreakouts = breakouts.length > 0;
    if (!hasBreakouts && hadBreakouts) {
      closeBreakoutJoinConfirmation(mountModal);
    }

    if (hasBreakouts && !breakoutUserIsIn) {
      // Have to check for freeJoin breakouts first because currentBreakoutUser will
      // populate after a room has been joined
      const freeJoinBreakout = breakouts.find(breakout => breakout.freeJoin);
      if (freeJoinBreakout) {
        if (!didSendBreakoutInvite) {
          this.inviteUserToBreakout(freeJoinBreakout);
          this.setState({ didSendBreakoutInvite: true });
        }
      } else if (currentBreakoutUser) {
        const currentInsertedTime = currentBreakoutUser.insertedTime;
        const oldCurrentUser = oldProps.currentBreakoutUser || {};
        const oldInsertedTime = oldCurrentUser.insertedTime;
        if (currentInsertedTime !== oldInsertedTime) {
          const breakoutRoom = getBreakoutByUser(currentBreakoutUser);
          const breakoutId = Session.get('lastBreakoutOpened');
          if (breakoutRoom.breakoutId !== breakoutId) {
            this.inviteUserToBreakout(breakoutRoom);
          }
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
