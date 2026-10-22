import React, { Component } from 'react';
import { defineMessages, injectIntl, IntlShape } from 'react-intl';
import * as PluginSdk from 'bigbluebutton-html-plugin-sdk';
import Styled from './styles';
import TalkingIndicator from '/imports/ui/components/nav-bar/nav-bar-graphql/talking-indicator/component';
import NavBarTopRow from './top-row/component';
import TimerIndicatorContainer from '/imports/ui/components/timer/indicator/component';
import SessionDetailsModal from '/imports/ui/components/session-details/component';
import SessionStorage from '../../services/storage/session';
import { ModalPriority, ModalRegistration } from '../../core/singletons/modalController';
import { Output } from '/imports/ui/components/layout/layoutTypes';

const intlMessages = defineMessages({
  defaultBreakoutName: {
    id: 'app.createBreakoutRoom.room',
    description: 'default breakout room name',
  },
  speakersListLabel: {
    id: 'app.navBar.speakersListLabel',
    description: 'label for screen reader to jump to speakers list',
  },
});

interface NavBarProps {
  intl: IntlShape;
  presentationTitle?: string;
  breakoutNum?: number;
  breakoutName?: string;
  meetingName?: string;
  pluginNavBarItems: PluginSdk.NavBarInterface[];
  amIModerator?: boolean;
  style: Output['navBar'];
  main?: string;
  meetingId: string;
  isDirectLeaveButtonEnabled: boolean;
  isConnected: boolean;
  hideTopRow: boolean;
  showSessionDetailsOnJoin: boolean;
}

interface SplitPluginItems {
  leftPluginItems: PluginSdk.NavBarInterface[];
  centerPluginItems: PluginSdk.NavBarInterface[];
  rightPluginItems: PluginSdk.NavBarInterface[];
}

interface RenderedModalProps {
  onRequestClose: () => void;
  priority: ModalPriority;
  setIsOpen: (value: boolean) => void;
  isOpen: boolean;
}

class NavBar extends Component<NavBarProps> {
  private setModalIsOpen: (value: boolean) => void;

  private openSessionDetails: () => void;

  private interval?: ReturnType<typeof setInterval>;

  constructor(props: NavBarProps) {
    super(props);

    this.splitPluginItems = this.splitPluginItems.bind(this);
    this.setModalIsOpen = () => {};
    this.openSessionDetails = () => this.setModalIsOpen(true);
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
          roomNumber: breakoutNum,
        });

        if (breakoutName === defaultBreakoutName) {
          document.title = `${breakoutNum} - ${meetingName}`;
        } else {
          document.title = `${breakoutName} - ${meetingName}`;
        }
      }
    }
  }

  componentDidUpdate() {
    const {
      showSessionDetailsOnJoin,
      meetingId,
    } = this.props;
    const ShownId = SessionStorage.getItem('alreadyShowSessionDetailsOnJoin');
    // when hiding navbar setModalIsOpen might be undefined and crash
    if (this.setModalIsOpen && showSessionDetailsOnJoin && ShownId !== meetingId) {
      this.setModalIsOpen(true);
    }
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  splitPluginItems(): SplitPluginItems {
    const { pluginNavBarItems } = this.props;

    return pluginNavBarItems.reduce<SplitPluginItems>((result, item) => {
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

  static renderModal(
    isOpen: boolean,
    setIsOpen: (value: boolean) => void,
    priority: ModalPriority,
    ModalComponent: React.ComponentType<RenderedModalProps>,
    otherOptions?: Record<string, unknown>,
  ) {
    return isOpen ? (
      <ModalComponent
        // eslint-disable-next-line react/jsx-props-no-spreading
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
      presentationTitle = 'Default Room Title',
      amIModerator,
      style,
      main,
      isDirectLeaveButtonEnabled,
      isConnected,
      hideTopRow,
    } = this.props;
    const { leftPluginItems, centerPluginItems, rightPluginItems } = this.splitPluginItems();

    const APP_CONFIG = window.meetingClientSettings?.public?.app;
    const enableTalkingIndicator = APP_CONFIG?.enableTalkingIndicator;

    return (
      <Styled.Navbar
        className="bbb-navbar"
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
          <NavBarTopRow
            intl={intl}
            presentationTitle={presentationTitle}
            onTitleClick={this.openSessionDetails}
            sessionDetailsModal={(
              <ModalRegistration id="SessionDetailsModal" priority="low">
                {
                  ({
                    isOpen,
                    open,
                    close,

                  }) => {
                    this.setModalIsOpen = (value) => {
                      if (!value) {
                        const { meetingId } = this.props;
                        SessionStorage.setItem('alreadyShowSessionDetailsOnJoin', meetingId);
                      }
                      if (value) open();
                      else close();
                    };
                    return NavBar.renderModal(isOpen, this.setModalIsOpen, 'low', SessionDetailsModal);
                  }
                }
              </ModalRegistration>
            )}
            leftPluginItems={leftPluginItems}
            centerPluginItems={centerPluginItems}
            rightPluginItems={rightPluginItems}
            amIModerator={amIModerator}
            isDirectLeaveButtonEnabled={isDirectLeaveButtonEnabled}
            isConnected={isConnected}
          />
        )}
        <Styled.Bottom className="bbb-navbar__bottom">
          <h2 className="sr-only">{intl.formatMessage(intlMessages.speakersListLabel)}</h2>
          {enableTalkingIndicator ? <TalkingIndicator /> : null}
          <TimerIndicatorContainer />
        </Styled.Bottom>
      </Styled.Navbar>
    );
  }
}

export default injectIntl(NavBar);
