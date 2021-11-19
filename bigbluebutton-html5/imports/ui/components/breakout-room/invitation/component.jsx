import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Session } from 'meteor/session';
import { withModalMounter } from '/imports/ui/components/modal/service';
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
      // Have to check for freeJoin breakouts first because currentBreakoutUrlData will
      // populate after a room has been joined
      const breakoutRoom = getBreakoutByUrlData(currentBreakoutUrlData);
      const freeJoinBreakout = breakouts.find((breakout) => breakout.freeJoin);
      if (freeJoinBreakout) {
        if (!didSendBreakoutInvite) {
          this.inviteUserToBreakout(breakoutRoom || freeJoinBreakout);
          this.setState({ didSendBreakoutInvite: true });
        }
      } else if (currentBreakoutUrlData) {
        const currentInsertedTime = currentBreakoutUrlData.insertedTime;
        const oldCurrentUrlData = oldProps.currentBreakoutUrlData || {};
        const oldInsertedTime = oldCurrentUrlData.insertedTime;
        if (currentInsertedTime !== oldInsertedTime) {
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
