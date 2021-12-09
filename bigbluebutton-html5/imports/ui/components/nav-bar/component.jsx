import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withModalMounter } from '/imports/ui/components/modal/service';
import withShortcutHelper from '/imports/ui/components/shortcut-help/service';
import { defineMessages, injectIntl } from 'react-intl';
import Styled from './styles';
import RecordingIndicator from './recording-indicator/container';
import TalkingIndicatorContainer from '/imports/ui/components/nav-bar/talking-indicator/container';
import ConnectionStatusButton from '/imports/ui/components/connection-status/button/container';
import ConnectionStatusService from '/imports/ui/components/connection-status/service';
import SettingsDropdownContainer from './settings-dropdown/container';
import browserInfo from '/imports/utils/browserInfo';
import deviceInfo from '/imports/utils/deviceInfo';
import { PANELS, ACTIONS } from '../layout/enums';

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
});

const propTypes = {
  presentationTitle: PropTypes.string,
  hasUnreadMessages: PropTypes.bool,
  shortcuts: PropTypes.string,
};

const defaultProps = {
  presentationTitle: 'Default Room Title',
  hasUnreadMessages: false,
  shortcuts: '',
};

class NavBar extends Component {
  constructor(props) {
    super(props);

    this.handleToggleUserList = this.handleToggleUserList.bind(this);
  }

  componentDidMount() {
    const {
      shortcuts: TOGGLE_USERLIST_AK,
    } = this.props;

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
      intl,
      shortcuts: TOGGLE_USERLIST_AK,
      mountModal,
      presentationTitle,
      amIModerator,
      style,
      main,
      sidebarNavigation,
    } = this.props;

    const hasNotification = hasUnreadMessages || hasUnreadNotes;

    let ariaLabel = intl.formatMessage(intlMessages.toggleUserListAria);
    ariaLabel += hasNotification ? (` ${intl.formatMessage(intlMessages.newMessages)}`) : '';

    const isExpanded = sidebarNavigation.isOpen;

    return (
      <Styled.Navbar
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
<<<<<<< HEAD
        <Styled.Top>
          <Styled.Left>
            {!isExpanded ? null
              : <Styled.ArrowLeft iconName="left_arrow" />}
            <Styled.NavbarToggleButton
=======
        <div className={styles.top}>
          <div className={styles.left}>
            {isExpanded && document.dir === 'ltr'
              && <Icon iconName="left_arrow" className={styles.arrowLeft} />}
            {!isExpanded && document.dir === 'rtl'
              && <Icon iconName="left_arrow" className={styles.arrowLeft} />}
            <Button
>>>>>>> 07cfcd376a44aceb543bcb8f098cf34d73b6b8bf
              onClick={this.handleToggleUserList}
              ghost
              circle
              hideLabel
              data-test={hasNotification ? 'hasUnreadMessages' : null}
              label={intl.formatMessage(intlMessages.toggleUserListLabel)}
              tooltipLabel={intl.formatMessage(intlMessages.toggleUserListLabel)}
              aria-label={ariaLabel}
              icon="user"
              aria-expanded={isExpanded}
              accessKey={TOGGLE_USERLIST_AK}
              hasNotification={hasNotification}
            />
<<<<<<< HEAD
            {isExpanded ? null
              : <Styled.ArrowRight iconName="right_arrow" />}
          </Styled.Left>
          <Styled.Center>
            <Styled.PresentationTitle>{presentationTitle}</Styled.PresentationTitle>
=======
            {!isExpanded && document.dir === 'ltr'
              && <Icon iconName="right_arrow" className={styles.arrowRight} />}
            {isExpanded && document.dir === 'rtl'
              && <Icon iconName="right_arrow" className={styles.arrowRight} />}
          </div>
          <div className={styles.center}>
            <h1 className={styles.presentationTitle}>{presentationTitle}</h1>

>>>>>>> 07cfcd376a44aceb543bcb8f098cf34d73b6b8bf
            <RecordingIndicator
              mountModal={mountModal}
              amIModerator={amIModerator}
            />
          </Styled.Center>
          <Styled.Right>
            {ConnectionStatusService.isEnabled() ? <ConnectionStatusButton /> : null}
            <SettingsDropdownContainer amIModerator={amIModerator} />
          </Styled.Right>
        </Styled.Top>
        <Styled.Bottom>
          <TalkingIndicatorContainer amIModerator={amIModerator} />
        </Styled.Bottom>
      </Styled.Navbar>
    );
  }
}

NavBar.propTypes = propTypes;
NavBar.defaultProps = defaultProps;
export default withShortcutHelper(withModalMounter(injectIntl(NavBar)), 'toggleUserList');
