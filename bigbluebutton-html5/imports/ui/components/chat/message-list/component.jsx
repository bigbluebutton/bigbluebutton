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
import MessageListItemContainer from './message-list-item/container';

const propTypes = {
  messages: PropTypes.arrayOf(PropTypes.object).isRequired,
  scrollPosition: PropTypes.number,
  chatId: PropTypes.string.isRequired,
  hasUnreadMessages: PropTypes.bool.isRequired,
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
  constructor(props) {
    super(props);
    this.cache = new CellMeasurerCache({
      fixedWidth: true,
      minHeight: 18,
    });
    
    this.userScrolledBack = false;
    this.handleScrollUpdate = _.debounce(this.handleScrollUpdate.bind(this), 150);
    this.rowRender = this.rowRender.bind(this);
    this.resizeRow = this.resizeRow.bind(this);
    this.systemMessagesResized = {};

    this.state = {
      scrollArea: null,
      shouldScrollToPosition: false,
      scrollPosition: 0,
      userScrolledBack: false,
    };

    this.listRef = null;
    this.virualRef = null;

    this.lastWidth = 0;

    this.scrollInterval = null;
  }

  componentDidMount() {
    const {
      scrollPosition,
    } = this.props;
    this.scrollTo(scrollPosition);

    const { childNodes } = this.messageListWrapper;
    this.virualRef = childNodes ? childNodes[0].firstChild : null;

    if (this.virualRef) {
      this.virualRef.style.direction = document.documentElement.dir;
    }
  
    this.scrollInterval = setInterval(() => {
      const {
        scrollArea,
      } = this.state;

      if (scrollArea.scrollTop + scrollArea.offsetHeight === scrollArea.scrollHeight) {
        this.setState({
          userScrolledBack: false,
        });
      }
    }, 100);

  }

  componentDidUpdate(prevProps) {
    if (this.virualRef) {
      if (this.virualRef.style.direction !== document.documentElement.dir) {
        this.virualRef.style.direction = document.documentElement.dir;
      }
    }

    const {
      scrollPosition,
      chatId,
      messages,
    } = this.props;
    const {
      scrollPosition: prevScrollPosition,
      messages: prevMessages,
      chatId: prevChatId,
    } = prevProps;

    if (prevChatId !== chatId) {
      this.cache.clearAll();
      setTimeout(() => this.scrollTo(scrollPosition), 300);
    } else if (prevMessages && messages) {
      if (prevMessages.length > messages.length) {
        // the chat has been cleared
        this.cache.clearAll();
      } else {
        prevMessages.forEach((prevMessage, index) => {
          const newMessage = messages[index];
          if (newMessage.content.length > prevMessage.content.length
              || newMessage.id !== prevMessage.id) {
            this.resizeRow(index);
          }
        });
      }
    }

    if (prevMessages.length < messages.length) {
      // this.resizeRow(prevMessages.length - 1);
      // messages.forEach((i, idx) => this.resizeRow(idx));
    }
  }

  componentWillUnmount() {
    clearInterval(this.scrollInterval);
  }

  handleScrollUpdate(position, target) {
    const {
      handleScrollUpdate,
    } = this.props;

    if (position !== null && position + target?.offsetHeight === target?.scrollHeight) {
      // I used one because the null value is used to notify that
      // the user has sent a message and the message list should scroll to bottom
      handleScrollUpdate(1);
      return;
    }

    handleScrollUpdate(position || 1);
  }

  resizeRow(idx) {
    this.cache.clear(idx);
    if (this.listRef) {
      this.listRef.recomputeRowHeights(idx);
      //    this.listRef.forceUpdate();
    }
  }

  scrollTo(position = null) {
    if (position) {
      setTimeout(() => this.setState({
        shouldScrollToPosition: true,
        scrollPosition: position,
      }), 200);
    }
  }

  rowRender({
    index,
    parent,
    style,
    key,
  }) {
    const {
      messages,
      handleReadMessage,
      lastReadMessageTime,
      id,
    } = this.props;
    const { scrollArea } = this.state;
    const message = messages[index];

    // it's to get an accurate size of the welcome message because it changes after initial render

    if (message.sender === null && !this.systemMessagesResized[index]) {
      setTimeout(() => this.resizeRow(index), 500);
      this.systemMessagesResized[index] = true;
    }

    return (
      <CellMeasurer
        key={key}
        cache={this.cache}
        columnIndex={0}
        parent={parent}
        rowIndex={index}
      >
        <span
          style={style}
          key={key}
        >
          <MessageListItemContainer
            style={style}
            handleReadMessage={handleReadMessage}
            key={key}
            message={message}
            messageId={message.id}
            chatAreaId={id}
            lastReadMessageTime={lastReadMessageTime}
            scrollArea={scrollArea}
          />
        </span>
      </CellMeasurer>
    );
  }

  renderUnreadNotification() {
    const {
      intl,
      hasUnreadMessages,
      scrollPosition,
    } = this.props;
    const { userScrolledBack } = this.state;

    if (hasUnreadMessages && userScrolledBack) {
      return (
        <Button
          aria-hidden="true"
          className={styles.unreadButton}
          color="primary"
          size="sm"
          key="unread-messages"
          label={intl.formatMessage(intlMessages.moreMessages)}
          onClick={()=> this.setState({
            userScrolledBack: false,
          })}
        />
      );
    }

    return null;
  }

  render() {
    const {
      messages,
    } = this.props;
    const {
      scrollArea,
      userScrolledBack,
    } = this.state;
 
    return (
      [<div 
        onMouseDown={()=> {
          this.setState({
            userScrolledBack: true,
          });
        }}
        onWheel={(e) => {
          console.log('caiu aqui');
          if (e.deltaY < 0) {
            this.setState({
              userScrolledBack: true,
            });
            this.userScrolledBack = true
          }
        }}
        className={styles.messageListWrapper}
        key="chat-list"
        data-test="chatMessages"
        ref={node => this.messageListWrapper = node}
      >
        <AutoSizer>
          {({ height, width }) => {
            if (width !== this.lastWidth) {
              this.lastWidth = width;
              this.cache.clearAll();
            }

            return (
              <List
                ref={(ref) => {
                  if (ref !== null) {
                    this.listRef = ref;

                    if (!scrollArea) {
                      this.setState({ scrollArea: findDOMNode(this.listRef) });
                    }
                  }
                }}
                isScrolling={true}
                rowHeight={this.cache.rowHeight}
                className={styles.messageList}
                rowRenderer={this.rowRender}
                rowCount={messages.length}
                height={height}
                width={width}
                overscanRowCount={5}
                deferredMeasurementCache={this.cache}
                scrollToIndex={!userScrolledBack ? messages.length - 1 : undefined}
              />
            );
          }}
        </AutoSizer>
      </div>,
      this.renderUnreadNotification()]
    );
  }
}

MessageList.propTypes = propTypes;
MessageList.defaultProps = defaultProps;

export default injectIntl(MessageList);
