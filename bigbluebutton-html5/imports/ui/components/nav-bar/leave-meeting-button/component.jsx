import React, { PureComponent } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import PropTypes from 'prop-types';
import EndMeetingConfirmationContainer from '/imports/ui/components/end-meeting-confirmation/container';
import BBBMenu from '/imports/ui/components/common/menu/component';
import { colorDanger, colorWhite } from '/imports/ui/stylesheets/styled-components/palette';
import Styled from './styles';
import Session from '/imports/ui/services/storage/in-memory';

const intlMessages = defineMessages({
  leaveMeetingBtnLabel: {
    id: 'app.navBar.leaveMeetingBtnLabel',
    description: 'Leave meeting button label',
  },
  leaveMeetingBtnDesc: {
    id: 'app.navBar.leaveMeetingBtnDesc',
    description: 'Describes the leave meeting button',
  },
  leaveSessionLabel: {
    id: 'app.navBar.optionsDropdown.leaveSessionLabel',
    description: 'Leave session button label',
  },
  leaveSessionDesc: {
    id: 'app.navBar.optionsDropdown.leaveSessionDesc',
    description: 'Describes leave session option',
  },
  endMeetingLabel: {
    id: 'app.navBar.optionsDropdown.endMeetingForAllLabel',
    description: 'End meeting button label',
  },
  endMeetingDesc: {
    id: 'app.navBar.optionsDropdown.endMeetingDesc',
    description: 'Describes settings option closing the current meeting',
  },
});

const propTypes = {
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  amIModerator: PropTypes.bool,
  isBreakoutRoom: PropTypes.bool,
  connected: PropTypes.bool.isRequired,
  isDropdownOpen: PropTypes.bool,
  ismobile: PropTypes.bool.isRequired,
  userLeaveMeeting: PropTypes.func.isRequired,
};

const defaultProps = {
  amIModerator: false,
  isBreakoutRoom: false,
  isDropdownOpen: false,
};

class LeaveMeetingButton extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      isEndMeetingConfirmationModalOpen: false,
    };

    // Set the logout code to 680 because it's not a real code and can be matched on the other side
    this.LOGOUT_CODE = '680';

    this.setEndMeetingConfirmationModalIsOpen = this
      .setEndMeetingConfirmationModalIsOpen.bind(this);
    this.leaveSession = this.leaveSession.bind(this);
  }

  setEndMeetingConfirmationModalIsOpen(value) {
    this.setState({ isEndMeetingConfirmationModalOpen: value });
  }

  leaveSession() {
    const { userLeaveMeeting } = this.props;

    userLeaveMeeting();
    // we don't check askForFeedbackOnLogout here,
    // it is checked in meeting-ended component
    Session.setItem('codeError', this.LOGOUT_CODE);
  }

  renderMenuItems() {
    const {
      intl, amIModerator, isBreakoutRoom, connected,
    } = this.props;

    const allowedToEndMeeting = amIModerator && !isBreakoutRoom;

    const { allowLogout: allowLogoutSetting } = window.meetingClientSettings.public.app;

    this.menuItems = [];

    if (allowLogoutSetting && connected) {
      this.menuItems.push(
        {
          key: 'list-item-logout',
          dataTest: 'directLogoutButton',
          icon: 'logout',
          label: intl.formatMessage(intlMessages.leaveSessionLabel),
          description: intl.formatMessage(intlMessages.leaveSessionDesc),
          onClick: () => this.leaveSession(),
        },
      );
    }

    if (allowedToEndMeeting && connected) {
      const customStyles = { background: colorDanger, color: colorWhite };

      this.menuItems.push(
        {
          key: 'list-item-end-meeting',
          dataTest: 'endMeetingButton',
          icon: 'close',
          label: intl.formatMessage(intlMessages.endMeetingLabel),
          description: intl.formatMessage(intlMessages.endMeetingDesc),
          customStyles,
          onClick: () => this.setEndMeetingConfirmationModalIsOpen(true),
        },
      );
    }

    return this.menuItems;
  }

  // eslint-disable-next-line class-methods-use-this
  renderModal(
    isOpen,
    setIsOpen,
    priority,
    Component,
    otherOptions,
  ) {
    return isOpen ? (
      <Component
        {...{
          ...otherOptions,
          onRequestClose: () => setIsOpen(false),
          priority,
          setIsOpen,
          isOpen,
        }}
      />
    ) : null;
  }

  render() {
    const {
      intl,
      isDropdownOpen,
      ismobile,
      isRTL,
    } = this.props;

    const { isEndMeetingConfirmationModalOpen } = this.state;

    const customStyles = { top: '1rem' };

    return (
      <>
        <BBBMenu
          customStyles={!ismobile ? customStyles : null}
          trigger={(
            <Styled.LeaveButton
              state={isDropdownOpen ? 'open' : 'closed'}
              ismobile={ismobile.toString()}
              aria-label={intl.formatMessage(intlMessages.leaveMeetingBtnLabel)}
              label={intl.formatMessage(intlMessages.leaveMeetingBtnLabel)}
              tooltipLabel={intl.formatMessage(intlMessages.leaveMeetingBtnLabel)}
              description={intl.formatMessage(intlMessages.leaveMeetingBtnDesc)}
              data-test="leaveMeetingDropdown"
              icon="logout"
              color="danger"
              size="lg"
              hideLabel
              // FIXME: Without onClick react proptypes keep warning
              // even after the DropdownTrigger inject an onClick handler
              onClick={() => null}
            />
          )}
          actions={this.renderMenuItems()}
          opts={{
            id: 'app-leave-meeting-menu',
            keepMounted: true,
            transitionDuration: 0,
            elevation: 3,
            getcontentanchorel: null,
            fullwidth: 'true',
            anchorOrigin: { vertical: 'bottom', horizontal: isRTL ? 'left' : 'right' },
            transformorigin: { vertical: 'top', horizontal: isRTL ? 'left' : 'right' },
          }}
        />
        {this.renderModal(isEndMeetingConfirmationModalOpen,
          this.setEndMeetingConfirmationModalIsOpen,
          'low', EndMeetingConfirmationContainer)}
      </>
    );
  }
}

LeaveMeetingButton.propTypes = propTypes;
LeaveMeetingButton.defaultProps = defaultProps;
export default injectIntl(LeaveMeetingButton);
