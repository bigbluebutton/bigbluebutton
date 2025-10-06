import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl } from 'react-intl';
import * as PluginSdk from 'bigbluebutton-html-plugin-sdk';
import { NavBarItemType } from 'bigbluebutton-html-plugin-sdk/dist/cjs/extensible-areas/nav-bar-item/enums';
import Styled from './styles';
import RecordingIndicator from './nav-bar-graphql/recording-indicator/component';
import TalkingIndicator from '/imports/ui/components/nav-bar/nav-bar-graphql/talking-indicator/component';
import ConnectionStatusButton from '/imports/ui/components/connection-status/button/container';
import ConnectionStatus from '/imports/ui/components/connection-status/component';
import ConnectionStatusService from '/imports/ui/components/connection-status/service';
import OptionsDropdownContainer from './options-dropdown/container';
import TimerIndicatorContainer from '/imports/ui/components/timer/indicator/component';
import browserInfo from '/imports/utils/browserInfo';
import deviceInfo from '/imports/utils/deviceInfo';
import { PANELS, ACTIONS, LAYOUT_TYPE } from '../layout/enums';
import Button from '/imports/ui/components/common/button/component';
import LeaveMeetingButtonContainer from './leave-meeting-button/container';
import { getSettingsSingletonInstance } from '/imports/ui/services/settings';
import Tooltip from '/imports/ui/components/common/tooltip/component';
import SessionDetailsModal from '/imports/ui/components/session-details/component';
import Icon from '/imports/ui/components/common/icon/icon-ts/component';
import getStorageSingletonInstance from '../../services/storage';

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
  leaveMeetingLabel: {
    id: 'app.navBar.leaveMeetingBtnLabel',
    description: 'Leave meeting button label',
  },
  openDetailsTooltip: {
    id: 'app.navBar.openDetailsTooltip',
    description: 'Open details tooltip',
  },
  sessionControlLabel: {
    id: 'app.navBar.sessionControlLabel',
    description: 'label for screen reader to jump to leave button and options menu',
  },
  speakersListLabel: {
    id: 'app.navBar.speakersListLabel',
    description: 'label for screen reader to jump to speakers list',
  },
});

const propTypes = {
  presentationTitle: PropTypes.string,
  hasUnreadMessages: PropTypes.bool,
  shortcuts: PropTypes.string,
  breakoutNum: PropTypes.number,
  breakoutName: PropTypes.string,
  meetingName: PropTypes.string,
  pluginNavBarItems: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string,
  })).isRequired,
};

const defaultProps = {
  presentationTitle: 'Default Room Title',
  hasUnreadMessages: false,
  shortcuts: '',
};

const renderPluginItems = (pluginItems) => {
  if (pluginItems !== undefined) {
    return (
      <>
        {
          pluginItems.map((pluginItem) => {
            let returnComponent;
            switch (pluginItem.type) {
              case NavBarItemType.BUTTON:
                returnComponent = (
                  <Styled.PluginComponentWrapper
                    key={`${pluginItem.id}-${pluginItem.type}`}
                  >
                    <Button
                      disabled={pluginItem.disabled}
                      icon={pluginItem.icon}
                      label={pluginItem.label}
                      aria-label={pluginItem.tooltip}
                      color="primary"
                      tooltip={pluginItem.tooltip}
                      onClick={pluginItem.onClick}
                    />
                  </Styled.PluginComponentWrapper>
                );
                break;
              case NavBarItemType.INFO:
                returnComponent = (
                  <Styled.PluginComponentWrapper
                    key={`${pluginItem.id}-${pluginItem.type}`}
                    tooltip={pluginItem.tooltip}
                  >
                    <Styled.PluginInfoComponent>
                      {pluginItem.label}
                    </Styled.PluginInfoComponent>
                  </Styled.PluginComponentWrapper>
                );
                break;
              default:
                returnComponent = null;
                break;
            }
            if (pluginItem.hasSeparator) {
              switch (pluginItem.position) {
                case PluginSdk.NavBarItemPosition.RIGHT:
                  returnComponent = (
                    <>
                      {returnComponent}
                      <Styled.PluginSeparatorWrapper key={`${pluginItem.id}-${pluginItem.type}-separator`}>
                        |
                      </Styled.PluginSeparatorWrapper>
                    </>
                  );
                  break;
                default:
                  returnComponent = (
                    <>
                      <Styled.PluginSeparatorWrapper key={`${pluginItem.id}-${pluginItem.type}-separator`}>
                        |
                      </Styled.PluginSeparatorWrapper>
                      {returnComponent}
                    </>
                  );
                  break;
              }
            }
            return returnComponent;
          })
        }
      </>
    );
  }
  return (<></>);
};

class NavBar extends Component {
  constructor(props) {
    super(props);

    this.handleToggleUserList = this.handleToggleUserList.bind(this);
    this.splitPluginItems = this.splitPluginItems.bind(this);
    this.setModalIsOpen = this.setModalIsOpen.bind(this);

    const ShownId = getStorageSingletonInstance().getItem('alreadyShowSessionDetailsOnJoin');

    this.state = {
      isModalOpen: props.showSessionDetailsOnJoin && !(ShownId === props.meetingId),
    };
  }

  renderModal(isOpen, setIsOpen, priority, Component, otherOptions) {
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
          roomNumber: breakoutNum,
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

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  setModalIsOpen(isOpen) {
    if (!isOpen) {
      const { meetingId } = this.props;
      getStorageSingletonInstance().setItem('alreadyShowSessionDetailsOnJoin', meetingId);
    }
    this.setState({ isModalOpen: isOpen });
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

  splitPluginItems() {
    const { pluginNavBarItems } = this.props;

    return pluginNavBarItems.reduce((result, item) => {
      switch (item.position) {
        case PluginSdk.NavBarItemPosition.LEFT:
          result.leftPluginItems.push(item);
          break;
        case PluginSdk.NavBarItemPosition.CENTER:
          result.centerPluginItems.push(item);
          break;
        case PluginSdk.NavBarItemPosition.RIGHT:
          result.rightPluginItems.push(item);
          break;
        default:
          break;
      }
      return result;
    }, {
      leftPluginItems: [],
      centerPluginItems: [],
      rightPluginItems: [],
    });
  }

  render() {
    const {
      hasUnreadMessages,
      hasUnreadNotes,
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
      hideTopRow,
    } = this.props;

    const { isModalOpen } = this.state;

    const hasNotification = hasUnreadMessages || (hasUnreadNotes && !isPinned);

    let ariaLabel = intl.formatMessage(intlMessages.toggleUserListAria);
    ariaLabel += hasNotification ? (` ${intl.formatMessage(intlMessages.newMessages)}`) : '';

    const isExpanded = sidebarNavigation.isOpen;
    const { isPhone } = deviceInfo;

    const { leftPluginItems, centerPluginItems, rightPluginItems } = this.splitPluginItems();

    const Settings = getSettingsSingletonInstance();
    const { selectedLayout } = Settings.application;
    const shouldShowNavBarToggleButton = selectedLayout !== LAYOUT_TYPE.CAMERAS_ONLY
      && selectedLayout !== LAYOUT_TYPE.PRESENTATION_ONLY
      && selectedLayout !== LAYOUT_TYPE.PARTICIPANTS_AND_CHAT_ONLY
      && selectedLayout !== LAYOUT_TYPE.MEDIA_ONLY;
    const shouldShowNavbar = LAYOUT_TYPE.PLUGINS_ONLY !== selectedLayout;

    const APP_CONFIG = window.meetingClientSettings?.public?.app;
    const enableTalkingIndicator = APP_CONFIG?.enableTalkingIndicator;

    return shouldShowNavbar && (
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
        {!hideTopRow && (
          <Styled.Top>
            <Styled.Left>
              {shouldShowNavBarToggleButton && isExpanded && document.dir === 'ltr'
                && <Styled.ArrowLeft iconName="left_arrow" />}
              {shouldShowNavBarToggleButton && !isExpanded && document.dir === 'rtl'
                && <Styled.ArrowLeft iconName="left_arrow" />}
              {shouldShowNavBarToggleButton && (
                <Styled.NavbarToggleButton
                  tooltipplacement="right"
                  onClick={this.handleToggleUserList}
                  color={isPhone && isExpanded ? 'primary' : 'dark'}
                  size="md"
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
              )}
              {shouldShowNavBarToggleButton && !isExpanded && document.dir === 'ltr'
                && <Styled.ArrowRight iconName="right_arrow" />}
              {shouldShowNavBarToggleButton && isExpanded && document.dir === 'rtl'
                && <Styled.ArrowRight iconName="right_arrow" />}
              {renderPluginItems(leftPluginItems)}
            </Styled.Left>
            <Styled.Center>
              <Styled.PresentationTitle
                data-test="presentationTitle"
                id="presentationTitle"
                onClick={() => this.setModalIsOpen(true)}
              >
                <Tooltip title={intl.formatMessage(intlMessages.openDetailsTooltip)}>
                  <span>
                    {presentationTitle}
                    <Icon iconName="device_list_selector" />
                  </span>
                </Tooltip>
              </Styled.PresentationTitle>
              {this.renderModal(isModalOpen, this.setModalIsOpen, 'low', SessionDetailsModal)}
              <RecordingIndicator
                amIModerator={amIModerator}
                currentUserId={currentUserId}
              />
              {renderPluginItems(centerPluginItems)}
            </Styled.Center>
            <Styled.Right>
              <h2 className="sr-only">{intl.formatMessage(intlMessages.sessionControlLabel)}</h2>
              {renderPluginItems(rightPluginItems)}
              {ConnectionStatusService.isEnabled() ? <ConnectionStatusButton /> : null}
              {ConnectionStatusService.isEnabled() ? <ConnectionStatus /> : null}
              {isDirectLeaveButtonEnabled && isMeteorConnected
                ? <LeaveMeetingButtonContainer amIModerator={amIModerator} /> : null}
              <OptionsDropdownContainer
                amIModerator={amIModerator}
                isDirectLeaveButtonEnabled={isDirectLeaveButtonEnabled}
              />
            </Styled.Right>
          </Styled.Top>
        )}
        <Styled.Bottom>
          <h2 className="sr-only">{intl.formatMessage(intlMessages.speakersListLabel)}</h2>
          {enableTalkingIndicator ? <TalkingIndicator amIModerator={amIModerator} /> : null}
          <TimerIndicatorContainer />
        </Styled.Bottom>
      </Styled.Navbar>
    );
  }
}

NavBar.propTypes = propTypes;
NavBar.defaultProps = defaultProps;
export default injectIntl(NavBar);
