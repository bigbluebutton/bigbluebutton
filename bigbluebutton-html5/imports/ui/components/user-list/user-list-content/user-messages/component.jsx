import React, { PureComponent } from 'react';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import PropTypes from 'prop-types';
import { defineMessages } from 'react-intl';
import Styled from './styles';
import { findDOMNode } from 'react-dom';
import ChatListItemContainer from '../../chat-list-item/container';
import { injectIntl } from 'react-intl';

const propTypes = {
  activeChats: PropTypes.arrayOf(String).isRequired,
  compact: PropTypes.bool,
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  roving: PropTypes.func.isRequired,
};

const defaultProps = {
  compact: false,
};

const intlMessages = defineMessages({
  messagesTitle: {
    id: 'app.userList.messagesTitle',
    description: 'Title for the messages list',
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
      compact,
    } = this.props;

    return (
      <Styled.Messages>
        <Styled.Container>
          {
            !compact ? (
              <Styled.MessagesTitle data-test="messageTitle">
                {intl.formatMessage(intlMessages.messagesTitle)}
              </Styled.MessagesTitle>
            ) : (
              <Styled.Separator />
            )
          }
        </Styled.Container>
        <Styled.ScrollableList
          role="tabpanel"
          tabIndex={0}
          ref={(ref) => { this._msgsList = ref; }}
        >
          <Styled.List aria-live="polite">
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
UserMessages.defaultProps = defaultProps;

export default injectIntl(UserMessages);
