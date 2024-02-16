import React, { Component } from 'react';
import PropTypes from 'prop-types';
import withShortcutHelper from '/imports/ui/components/shortcut-help/service';
import { defineMessages, injectIntl } from 'react-intl';
import Styled from './styles';
import RecordingIndicator from './recording-indicator/container';
import TalkingIndicatorContainer from '/imports/ui/components/nav-bar/talking-indicator/container';
import ConnectionStatusButton from '/imports/ui/components/connection-status/button/container';
import ConnectionStatusService from '/imports/ui/components/connection-status/service';
import { addNewAlert } from '/imports/ui/components/screenreader-alert/service';
import SettingsDropdownContainer from './settings-dropdown/container';
import TimerIndicatorContainer from '/imports/ui/components/timer/indicator/container';
import browserInfo from '/imports/utils/browserInfo';
import deviceInfo from '/imports/utils/deviceInfo';
import { PANELS, ACTIONS } from '../layout/enums';
import { isEqual } from 'radash';
import LeaveMeetingButtonContainer from './leave-meeting-button/container';

const intlMessages = defineMessages({
  toggleUserListLabel: {
    id: 'app.navBar.userListToggleBtnLabel',
    description: 'Toggle button label',
  },
  toggleUserListAria: {
    id: 'app.navBar.toggleUserList.ariaLabel',
    description: 'description of the lists inside the userlist',
  },
  newMessages: {
    id: 'app.navBar.toggleUserList.newMessages',
    description: 'label for toggleUserList btn when showing red notification',
  },
  newMsgAria: {
    id: 'app.navBar.toggleUserList.newMsgAria',
    description: 'label for new message screen reader alert',
  },
  defaultBreakoutName: {
    id: 'app.createBreakoutRoom.room',
    description: 'default breakout room name',
  },
});

const propTypes = {
  presentationTitle: PropTypes.string,
  hasUnreadMessages: PropTypes.bool,
  shortcuts: PropTypes.string,
  breakoutNum: PropTypes.number,
  breakoutName: PropTypes.string,
  meetingName: PropTypes.string,
};

const defaultProps = {
  presentationTitle: 'Default Room Title',
  hasUnreadMessages: false,
  shortcuts: '',
};

class NavBar extends Component {
  constructor(props) {
    super(props);

    this.state = {
        acs: props.activeChats,
    }

    this.handleToggleUserList = this.handleToggleUserList.bind(this);
  }

  componentDidMount() {
    const {
      shortcuts: TOGGLE_USERLIST_AK,
      intl,
      breakoutNum,
      breakoutName,
      meetingName,
    } = this.props;

    if (breakoutNum && breakoutNum > 0) {
      if (breakoutName && meetingName) {
        const defaultBreakoutName = intl.formatMessage(intlMessages.defaultBreakoutName, {
          0: breakoutNum,
        });

        if (breakoutName === defaultBreakoutName) {
          document.title = `${breakoutNum} - ${meetingName}`;
        } else {
          document.title = `${breakoutName} - ${meetingName}`;
        }
      }
    }

    const { isFirefox } = browserInfo;
    const { isMacos } = deviceInfo;

    // accessKey U does not work on firefox for macOS for some unknown reason
    if (isMacos && isFirefox && TOGGLE_USERLIST_AK === 'U') {
      document.addEventListener('keyup', (event) => {
        const { key, code } = event;
        const eventKey = key?.toUpperCase();
        const eventCode = code;
        if (event?.altKey && (eventKey === TOGGLE_USERLIST_AK || eventCode === `Key${TOGGLE_USERLIST_AK}`)) {
          this.handleToggleUserList();
        }
      });
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (!isEqual(prevProps.activeChats, this.props.activeChats)) {
      this.setState({ acs: this.props.activeChats})
    }
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  handleToggleUserList() {
    const {
      sidebarNavigation,
      sidebarContent,
      layoutContextDispatch,
    } = this.props;

    if (sidebarNavigation.isOpen) {
      if (sidebarContent.isOpen) {
        layoutContextDispatch({
          type: ACTIONS.SET_SIDEBAR_CONTENT_IS_OPEN,
          value: false,
        });
        layoutContextDispatch({
          type: ACTIONS.SET_SIDEBAR_CONTENT_PANEL,
          value: PANELS.NONE,
        });
        layoutContextDispatch({
          type: ACTIONS.SET_ID_CHAT_OPEN,
          value: '',
        });
      }

      layoutContextDispatch({
        type: ACTIONS.SET_SIDEBAR_NAVIGATION_IS_OPEN,
        value: false,
      });
      layoutContextDispatch({
        type: ACTIONS.SET_SIDEBAR_NAVIGATION_PANEL,
        value: PANELS.NONE,
      });
    } else {
      layoutContextDispatch({
        type: ACTIONS.SET_SIDEBAR_NAVIGATION_IS_OPEN,
        value: true,
      });
      layoutContextDispatch({
        type: ACTIONS.SET_SIDEBAR_NAVIGATION_PANEL,
        value: PANELS.USERLIST,
      });
    }
  }

  render() {
    const {
      hasUnreadMessages,
      hasUnreadNotes,
      activeChats,
      intl,
      shortcuts: TOGGLE_USERLIST_AK,
      presentationTitle,
      amIModerator,
      style,
      main,
      isPinned,
      sidebarNavigation,
      currentUserId,
      isDirectLeaveButtonEnabled,
      isMeteorConnected,
    } = this.props;

    const hasNotification = hasUnreadMessages || (hasUnreadNotes && !isPinned);

    let ariaLabel = intl.formatMessage(intlMessages.toggleUserListAria);
    ariaLabel += hasNotification ? (` ${intl.formatMessage(intlMessages.newMessages)}`) : '';

    const isExpanded = sidebarNavigation.isOpen;
    const { isPhone } = deviceInfo;


    const { acs } = this.state;

    activeChats.map((c, i) => {
      if (c?.unreadCounter > 0 && c?.unreadCounter !== acs[i]?.unreadCounter) {
        addNewAlert(`${intl.formatMessage(intlMessages.newMsgAria, { 0: c.name })}`);
      }
    });

    return (
      <Styled.Navbar
        id="Navbar"
        style={
          main === 'new'
            ? {
              position: 'absolute',
              top: style.top,
              left: style.left,
              height: style.height,
              width: style.width,
            }
            : {
              position: 'relative',
              height: style.height,
              width: '100%',
            }
        }
      >
        <Styled.Top>
          <Styled.Left>
            {isExpanded && document.dir === 'ltr'
              && <Styled.ArrowLeft iconName="left_arrow" />}
            {!isExpanded && document.dir === 'rtl'
              && <Styled.ArrowLeft iconName="left_arrow" />}
            <Styled.NavbarToggleButton
              onClick={this.handleToggleUserList}
              color={isPhone && isExpanded ? 'primary' : 'dark'}
              size='md'
              circle
              hideLabel
              data-test={hasNotification ? 'hasUnreadMessages' : 'toggleUserList'}
              label={intl.formatMessage(intlMessages.toggleUserListLabel)}
              tooltipLabel={intl.formatMessage(intlMessages.toggleUserListLabel)}
              aria-label={ariaLabel}
              icon="user"
              aria-expanded={isExpanded}
              accessKey={TOGGLE_USERLIST_AK}
              hasNotification={hasNotification}
            />
            {!isExpanded && document.dir === 'ltr'
              && <Styled.ArrowRight iconName="right_arrow" />}
            {isExpanded && document.dir === 'rtl'
              && <Styled.ArrowRight iconName="right_arrow" />}
          </Styled.Left>
          <Styled.Center>
            <Styled.PresentationTitle data-test="presentationTitle">
              {presentationTitle}
            </Styled.PresentationTitle>
            <RecordingIndicator
              amIModerator={amIModerator}
              currentUserId={currentUserId}
            />
          </Styled.Center>
          <Styled.Right>
            {ConnectionStatusService.isEnabled() ? <ConnectionStatusButton /> : null}
            {isDirectLeaveButtonEnabled && isMeteorConnected
              ? <LeaveMeetingButtonContainer amIModerator={amIModerator} />
              : null}
            <SettingsDropdownContainer
              amIModerator={amIModerator}
              isDirectLeaveButtonEnabled={isDirectLeaveButtonEnabled}
            />
          </Styled.Right>
        </Styled.Top>
        <Styled.Bottom>
          <TalkingIndicatorContainer amIModerator={amIModerator} />
          <TimerIndicatorContainer />
        </Styled.Bottom>
      </Styled.Navbar>
    );
  }
}

NavBar.propTypes = propTypes;
NavBar.defaultProps = defaultProps;
export default withShortcutHelper(injectIntl(NavBar), 'toggleUserList');
