import React, { Component } from 'react';
import { findDOMNode } from 'react-dom';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl } from 'react-intl';
import _ from 'lodash';
import Button from '/imports/ui/components/button/component';
import {
  List, AutoSizer, CellMeasurer, CellMeasurerCache,
} from 'react-virtualized';
import { styles } from './styles';
import MessageListItem from './message-list-item/component';

const propTypes = {
  messages: PropTypes.arrayOf(PropTypes.object).isRequired,
  scrollPosition: PropTypes.number,
  chatId: PropTypes.string.isRequired,
  hasUnreadMessages: PropTypes.bool.isRequired,
  partnerIsLoggedOut: PropTypes.bool.isRequired,
  handleScrollUpdate: PropTypes.func.isRequired,
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  id: PropTypes.string.isRequired,
  lastReadMessageTime: PropTypes.number,
  handleReadMessage: PropTypes.func.isRequired,
};

const defaultProps = {
  scrollPosition: null,
  lastReadMessageTime: 0,
};

const intlMessages = defineMessages({
  moreMessages: {
    id: 'app.chat.moreMessages',
    description: 'Chat message when the user has unread messages below the scroll',
  },
  emptyLogLabel: {
    id: 'app.chat.emptyLogLabel',
    description: 'aria-label used when chat log is empty',
  },
});

class MessageList extends Component {
  static getDerivedStateFromProps(props, state) {
    const { messages: propMessages } = props;
    const { messages: stateMessages } = state;

    if (propMessages.length !== 3 && propMessages.length < stateMessages.length) return null;

    return {
      messages: propMessages,
    };
  }

  constructor(props) {
    super(props);
    this.cache = new CellMeasurerCache({
      fixedWidth: true,
      minWidth: 75,
    });

    this.shouldScrollBottom = false;
    this.lastKnowScrollPosition = 0;
    this.ticking = false;
    this.handleScrollChange = _.debounce(this.handleScrollChange.bind(this), 150);
    this.handleScrollUpdate = _.debounce(this.handleScrollUpdate.bind(this), 150);
    this.rowRender = this.rowRender.bind(this);
    this.resizeRow = this.resizeRow.bind(this);

    this.scrollToBottom = this.scrollToBottom.bind(this);
    this.state = {
      scrollArea: null,
      shouldScrollToBottom: true,
      shouldScrollToPosition: false,
      scrollPosition: 0,
      messages: [],
    };

    this.listRef = null;
  }

  componentDidMount() {
    const {
      scrollPosition,
    } = this.props;
    this.scrollTo(scrollPosition);
  }

  componentWillReceiveProps(nextProps) {
    const {
      chatId,
    } = this.props;

    if (chatId !== nextProps.chatId) {
      const { scrollArea } = this.state;
      this.handleScrollUpdate(scrollArea.scrollTop, scrollArea);
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    const {
      chatId,
      hasUnreadMessages,
      partnerIsLoggedOut,
    } = this.props;

    const {
      scrollArea,
    } = this.state;

    if (!scrollArea && nextState.scrollArea) return true;

    const switchingCorrespondent = chatId !== nextProps.chatId;
    const hasNewUnreadMessages = hasUnreadMessages !== nextProps.hasUnreadMessages;

    // check if the messages include <user has left the meeting>
    const lastMessage = nextProps.messages[nextProps.messages.length - 1];
    if (lastMessage) {
      const userLeftIsDisplayed = lastMessage.id.includes('partner-disconnected');
      if (!(partnerIsLoggedOut && userLeftIsDisplayed)) return true;
    }

    if (switchingCorrespondent || hasNewUnreadMessages) return true;

    return false;
  }

  componentDidUpdate(prevProps, prevState) {
    const {
      scrollPosition,
      chatId,
    } = this.props;
    const {
      scrollPosition: prevScrollPosition,
    } = prevProps;

    const {
      scrollArea,
      shouldScrollToPosition,
      scrollPosition: scrollPositionState,
      shouldScrollToBottom,
      messages,
    } = this.state;
    const { messages: prevMessages } = prevState;
    const compareChatId = prevProps.chatId !== chatId;

    if (compareChatId) {
      setTimeout(() => this.scrollTo(scrollPosition), 300);
    }

    if (!shouldScrollToBottom && !scrollPosition && prevScrollPosition) {
      this.scrollToBottom();
    }

    const prevLength = prevProps.messages && !!prevProps.messages.length
      && prevProps.messages[prevProps.messages.length - 1].content.length;

    const currentLength = messages && !!messages.length
      && messages[messages.length - 1].content.length;

    if (!compareChatId && (prevLength !== currentLength && currentLength > prevLength)) {
      this.resizeRow(messages.length - 1);
    }

    if (shouldScrollToPosition && scrollArea.scrollTop === scrollPositionState) {
      this.setState({ shouldScrollToPosition: false });
    }

    if (prevMessages.length < messages.length) {
      this.resizeRow(prevMessages.length - 1);
      // messages.forEach((i, idx) => this.resizeRow(idx));
    }
  }

  handleScrollUpdate(position, target) {
    const {
      handleScrollUpdate,
    } = this.props;

    if (position !== null && position + target.offsetHeight === target.scrollHeight) {
      // I used one because the null value is used to notify that
      // the user has sent a message and the message list should scroll to bottom
      handleScrollUpdate(1);
      return;
    }

    handleScrollUpdate(position || 1);
  }

  handleScrollChange(e) {
    const { scrollArea } = this.state;
    const scrollCursorPosition = e.scrollTop + scrollArea.offsetHeight;
    const shouldScrollBottom = e.scrollTop === null
      || scrollCursorPosition === scrollArea.scrollHeight
      || (scrollArea.scrollHeight - scrollCursorPosition < 1);

    if ((e.scrollTop < this.lastKnowScrollPosition) && !shouldScrollBottom) {
      this.setState({ shouldScrollToBottom: false });
    }
    this.lastKnowScrollPosition = e.scrollTop;

    if (!this.ticking) {
      window.requestAnimationFrame(() => {
        const position = this.lastKnowScrollPosition;
        if (scrollArea) {
          this.handleScrollUpdate(position, scrollArea);
        }
        this.ticking = false;
      });
    }

    this.ticking = true;
  }

  resizeRow(idx) {
    this.cache.clear(idx);
    if (this.listRef) {
      this.listRef.recomputeRowHeights(idx);
      this.listRef.forceUpdate();
    }
  }

  scrollTo(position = null) {
    if (position) {
      setTimeout(() => this.setState({
        shouldScrollToPosition: true,
        shouldScrollToBottom: false,
        scrollPosition: position,
      }), 200);
    }
  }

  rowRender({
    index, parent, style, key,
  }) {
    const {
      messages,
      handleReadMessage,
      lastReadMessageTime,
      id,
    } = this.props;
    const { scrollArea } = this.state;
    const message = messages[index];
    return (
      <CellMeasurer
        key={key}
        cache={this.cache}
        columnIndex={0}
        parent={parent}
        rowIndex={index}
      >
        {
          ({ measure }) => (
            <span
              style={style}
              onLoad={measure}
              key={key}
            >
              <MessageListItem
                style={style}
                handleReadMessage={handleReadMessage}
                key={message.id}
                messages={message.content}
                user={message.sender}
                time={message.time}
                chatAreaId={id}
                lastReadMessageTime={lastReadMessageTime}
                deferredMeasurementCache={this.cache}
                scrollArea={scrollArea}
              />
            </span>
          )
        }
      </CellMeasurer>
    );
  }

  scrollToBottom() {
    this.setState({ shouldScrollToBottom: true });
  }

  renderUnreadNotification() {
    const {
      intl,
      hasUnreadMessages,
      scrollPosition,
    } = this.props;

    if (hasUnreadMessages && scrollPosition !== null) {
      return (
        <Button
          aria-hidden="true"
          className={styles.unreadButton}
          color="primary"
          size="sm"
          label={intl.formatMessage(intlMessages.moreMessages)}
          onClick={this.scrollToBottom}
        />
      );
    }

    return null;
  }

  render() {
    const {
      intl,
      id,
    } = this.props;
    const {
      scrollArea,
      shouldScrollToBottom,
      shouldScrollToPosition,
      scrollPosition,
      messages,
    } = this.state;

    const isEmpty = messages.length === 0;
    return (
      <div className={styles.messageListWrapper}>
        <div
          style={
            {
              height: '100%',
              width: '100%',
            }
          }
          role="log"
          id={id}
          aria-live="polite"
          aria-atomic="false"
          aria-relevant="additions"
          aria-label={isEmpty ? intl.formatMessage(intlMessages.emptyLogLabel) : ''}
        >
          <AutoSizer>
            {({ height, width }) => (
              <List
                ref={(ref) => {
                  if (ref != null) {
                    this.listRef = ref;

                    if (!scrollArea) {
                      this.setState({ scrollArea: findDOMNode(this.listRef) });
                    }
                  }
                }}
                rowHeight={this.cache.rowHeight}
                className={styles.messageList}
                rowRenderer={this.rowRender}
                rowCount={messages.length}
                height={height}
                width={width}
                overscanRowCount={15}
                deferredMeasurementCache={this.cache}
                onScroll={this.handleScrollChange}
                scrollToIndex={shouldScrollToBottom ? messages.length - 1 : undefined}
                scrollTop={
                    (shouldScrollToPosition && scrollPosition)
                    && (scrollArea && scrollArea.scrollHeight >= scrollPosition)
                      ? scrollPosition : undefined
                  }
                scrollToAlignment="start"
              />
            )}
          </AutoSizer>
        </div>
        {this.renderUnreadNotification()}
      </div>
    );
  }
}

MessageList.propTypes = propTypes;
MessageList.defaultProps = defaultProps;

export default injectIntl(MessageList);
