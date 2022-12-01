import React, { PureComponent } from 'react';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import PropTypes from 'prop-types';
import { defineMessages } from 'react-intl';
import Styled from './styles';
import { findDOMNode } from 'react-dom';
import ChatListItemContainer from '../../chat-list-item/container';
import { injectIntl } from 'react-intl';
import { ACTIONS } from '/imports/ui/components/layout/enums';
import Icon from '/imports/ui/components/common/icon/component';
import TooltipContainer from '/imports/ui/components/common/tooltip/container';

const propTypes = {
  activeChats: PropTypes.arrayOf(String).isRequired,
  compact: PropTypes.bool.isRequired,
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  roving: PropTypes.func.isRequired,
  layoutContextDispatch: PropTypes.func.isRequired,
};

const intlMessages = defineMessages({
  messagesTitle: {
    id: 'app.userList.messagesTitle',
    description: 'Title for the messages list',
  },
  toggleCompactView: {
    id: 'app.userList.toggleCompactView.label',
    description: 'Title for the compact userlist toggle button',
  },
});

class UserMessages extends PureComponent {
  constructor() {
    super();

    this.state = {
      selectedChat: null,
    };

    this.activeChatRefs = [];

    this.changeState = this.changeState.bind(this);
    this.rove = this.rove.bind(this);
  }

  componentDidMount() {
    const { compact } = this.props;
    if (!compact) {
      this._msgsList.addEventListener(
        'keydown',
        this.rove,
      );
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const { selectedChat } = this.state;

    if (selectedChat && selectedChat !== prevState.selectedChat) {
      const { firstChild } = selectedChat;
      if (firstChild) firstChild.focus();
    }
  }

  getActiveChats() {
    const {
      activeChats,
      compact,
    } = this.props;

    let index = -1;

    return activeChats.map(chat => (
      <CSSTransition
        classNames={"transition"}
        appear
        enter
        exit={false}
        timeout={0}
        component="div"
        key={chat.userId}
      >
        <Styled.ListTransition ref={(node) => { this.activeChatRefs[index += 1] = node; }}>
          <ChatListItemContainer
            compact={compact}
            chat={chat}
            tabIndex={-1}
          />
        </Styled.ListTransition>
      </CSSTransition>
    ));
  }

  changeState(ref) {
    this.setState({ selectedChat: ref });
  }

  rove(event) {
    const { roving } = this.props;
    const { selectedChat } = this.state;
    const msgItemsRef = findDOMNode(this._msgItems);
    roving(event, this.changeState, msgItemsRef, selectedChat);
  }

  render() {
    const {
      intl,
      layoutContextDispatch,
      compact,
    } = this.props;

    return (
      <Styled.Messages>
          {
            !compact ? (
            <Styled.Container>
              <Styled.MessagesTitle data-test="messageTitle">
                {intl.formatMessage(intlMessages.messagesTitle)}
              </Styled.MessagesTitle>
              <Styled.MinimizeButton
                size="md"
                color="light"
                label={intl.formatMessage(intlMessages.toggleCompactView)}
                hideLabel
                circle
                icon="left_arrow"
                onClick={() => {
                  layoutContextDispatch({
                    type: ACTIONS.SET_SIDEBAR_NAVIGATION_IS_COMPACT,
                    value: !compact,
                  });
                }}
              />
            </Styled.Container>
            ) : (
              <>
                <Styled.ScrollableList>
                  <Styled.List compact={compact}>
                    <TooltipContainer title={intl.formatMessage(intlMessages.toggleCompactView)}>
                      <Styled.ListItem
                        $compact={compact}
                        onClick={() => {
                          layoutContextDispatch({
                            type: ACTIONS.SET_SIDEBAR_NAVIGATION_IS_COMPACT,
                            value: !compact,
                          });
                        }}
                      >
                        <Icon iconName="right_arrow" />
                      </Styled.ListItem>
                    </TooltipContainer>
                  </Styled.List>
                </Styled.ScrollableList>
                <Styled.Separator />
              </>
            )
          }
        <Styled.ScrollableList
          role="tabpanel"
          tabIndex={0}
          ref={(ref) => { this._msgsList = ref; }}
        >
          <Styled.List aria-live="polite" compact={compact}>
            <TransitionGroup ref={(ref) => { this._msgItems = ref; }}>
              {this.getActiveChats()}
            </TransitionGroup>
          </Styled.List>
        </Styled.ScrollableList>
      </Styled.Messages>
    );
  }
}

UserMessages.propTypes = propTypes;

export default injectIntl(UserMessages);
