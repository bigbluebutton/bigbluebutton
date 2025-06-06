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
import Button from '/imports/ui/components/common/button/component';
import LeaveMeetingButtonContainer from './leave-meeting-button/container';
import Tooltip from '/imports/ui/components/common/tooltip/component';
import SessionDetailsModal from '/imports/ui/components/session-details/component';
import Icon from '/imports/ui/components/common/icon/icon-ts/component';
import getStorageSingletonInstance from '../../services/storage';

const intlMessages = defineMessages({
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
  breakoutNum: PropTypes.number,
  breakoutName: PropTypes.string,
  meetingName: PropTypes.string,
  pluginNavBarItems: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string,
  })).isRequired,
  sidebarNavigation: PropTypes.shape({
    isOpen: PropTypes.boolean,
  }).isRequired,
  sidebarContent: PropTypes.shape({
    isOpen: PropTypes.boolean,
  }).isRequired,
};

const defaultProps = {
  presentationTitle: 'Default Room Title',
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
      intl,
      presentationTitle,
      amIModerator,
      style,
      main,
      currentUserId,
      isDirectLeaveButtonEnabled,
      hideTopRow,
    } = this.props;

    const { isModalOpen } = this.state;

    const { leftPluginItems, centerPluginItems, rightPluginItems } = this.splitPluginItems();

    const APP_CONFIG = window.meetingClientSettings?.public?.app;
    const enableTalkingIndicator = APP_CONFIG?.enableTalkingIndicator;

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
        {!hideTopRow && (
          <Styled.Top>
            <Styled.Left>
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
                    <Icon iconName="device_list_selector" rotate />
                  </span>
                </Tooltip>
              </Styled.PresentationTitle>
              {this.renderModal(isModalOpen, this.setModalIsOpen, 'low', SessionDetailsModal)}
              {renderPluginItems(centerPluginItems)}
            </Styled.Center>
            <Styled.Right>
              <h2 className="sr-only">{intl.formatMessage(intlMessages.sessionControlLabel)}</h2>
              <RecordingIndicator
                amIModerator={amIModerator}
                currentUserId={currentUserId}
              />
              {renderPluginItems(rightPluginItems)}
              {ConnectionStatusService.isEnabled() ? <ConnectionStatusButton /> : null}
              {ConnectionStatusService.isEnabled() ? <ConnectionStatus /> : null}
              {isDirectLeaveButtonEnabled
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
