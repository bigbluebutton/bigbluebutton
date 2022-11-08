import React, { PureComponent } from 'react';
import { findDOMNode } from 'react-dom';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl } from 'react-intl';
import _ from 'lodash';
import { AutoSizer,CellMeasurer, CellMeasurerCache } from 'react-virtualized';
import Styled from './styles';
import ChatLogger from '/imports/ui/components/chat/chat-logger/ChatLogger';
import TimeWindowChatItem from './time-window-chat-item/container';
import { convertRemToPixels } from '/imports/utils/dom-utils';

const CHAT_CONFIG = Meteor.settings.public.chat;
const SYSTEM_CHAT_TYPE = CHAT_CONFIG.type_system;
const CHAT_CLEAR_MESSAGE = CHAT_CONFIG.system_messages_keys.chat_clear;

const propTypes = {
  scrollPosition: PropTypes.number,
  chatId: PropTypes.string.isRequired,
  handleScrollUpdate: PropTypes.func.isRequired,
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  id: PropTypes.string.isRequired,
};

const defaultProps = {
  scrollPosition: null,
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
class TimeWindowList extends PureComponent {
  constructor(props) {
    super(props);
    this.cache = new CellMeasurerCache({
      fixedWidth: true,
      minHeight: 18,
      keyMapper: (rowIndex) => {
        const { timeWindowsValues } = this.props;
        const timewindow = timeWindowsValues[rowIndex];

        const key = timewindow?.key;
        const contentCount = timewindow?.content?.length;
        return `${key}-${contentCount}`;
      },
    });
    this.userScrolledBack = false;
    this.handleScrollUpdate = _.debounce(this.handleScrollUpdate.bind(this), 150);
    this.rowRender = this.rowRender.bind(this);
    this.forceCacheUpdate = this.forceCacheUpdate.bind(this);
    this.systemMessagesResized = {};

    this.state = {
      scrollArea: null,
      shouldScrollToPosition: false,
      scrollPosition: 0,
      userScrolledBack: false,
      lastMessage: {},
      fontsLoaded: false,
    };
    this.systemMessageIndexes = [];

    this.listRef = null;
    this.virualRef = null;

    this.lastWidth = 0;

    document.fonts.onloadingdone = () => this.setState({fontsLoaded: true});
  }

  componentDidMount() {
    const { scrollPosition: scrollProps } = this.props;

    this.setState({
      scrollPosition: scrollProps,
    });
  }

  componentDidUpdate(prevProps) {
    ChatLogger.debug('TimeWindowList::componentDidUpdate', { ...this.props }, { ...prevProps });
    if (this.virualRef) {
      if (this.virualRef.style.direction !== document.documentElement.dir) {
        this.virualRef.style.direction = document.documentElement.dir;
      }
    }

    const {
      userSentMessage,
      setUserSentMessage,
      timeWindowsValues,
      chatId,
      syncing,
      syncedPercent,
      lastTimeWindowValuesBuild,
      scrollPosition: scrollProps,
      count,
    } = this.props;

    const { userScrolledBack } = this.state;

    if((count > 0 && !userScrolledBack) || userSentMessage || !scrollProps) {
      const lastItemIndex = timeWindowsValues.length - 1;

      this.setState({
        scrollPosition: lastItemIndex,
      }, ()=> this.handleScrollUpdate(lastItemIndex));
    }

    const {
      timeWindowsValues: prevTimeWindowsValues,
      chatId: prevChatId,
      syncing: prevSyncing,
      syncedPercent: prevSyncedPercent
    } = prevProps;

    if (prevChatId !== chatId) {
      this.setState({
        scrollPosition: scrollProps,
      });
    }

    const prevTimeWindowsLength = prevTimeWindowsValues.length;
    const timeWindowsValuesLength = timeWindowsValues.length;
    const prevLastTimeWindow = prevTimeWindowsValues[prevTimeWindowsLength - 1];
    const lastTimeWindow = timeWindowsValues[prevTimeWindowsLength - 1];

    if ((lastTimeWindow
      && (prevLastTimeWindow?.content.length !== lastTimeWindow?.content.length))) {
      if (this.listRef) {
        this.cache.clear(timeWindowsValuesLength - 1);
        this.listRef.recomputeRowHeights(timeWindowsValuesLength - 1);
      }
    }

    if (userSentMessage && !prevProps.userSentMessage) {
      this.setState({
        userScrolledBack: false,
      }, () => setUserSentMessage(false));
    }

    // this condition exist to the case where the chat has a single message and the chat is cleared
    // The component List from react-virtualized doesn't have a reference to the list of messages
    // so I need force the update to fix it
    if (
      (lastTimeWindow?.id === `${SYSTEM_CHAT_TYPE}-${CHAT_CLEAR_MESSAGE}`)
      || (prevSyncing && !syncing)
      || (syncedPercent !== prevSyncedPercent)
      || (chatId !== prevChatId)
      || (lastTimeWindowValuesBuild !== prevProps.lastTimeWindowValuesBuild)
    ) {
      this.listRef.forceUpdateGrid();
    }
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

  scrollTo(position = null) {
    if (position) {
      setTimeout(() => this.setState({
        shouldScrollToPosition: true,
        scrollPosition: position,
      }), 200);
    }
  }

  forceCacheUpdate(index) {
    if (index >= 0) {
      this.cache.clear(index);
      this.listRef.recomputeRowHeights(index);
    }
  }

  rowRender({
    index,
    parent,
    style,
    key,
  }) {
    const {
      id,
      timeWindowsValues,
      dispatch,
      chatId,
    } = this.props;

    const { scrollArea } = this.state;
    const message = timeWindowsValues[index];

    ChatLogger.debug('TimeWindowList::rowRender', this.props);
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
          key={`span-${key}-${index}`}
        >
          <TimeWindowChatItem
            key={key}
            message={message}
            messageId={message.id}
            chatAreaId={id}
            scrollArea={scrollArea}
            dispatch={dispatch}
            chatId={chatId}
            height={style.height}
            index={index}
            forceCacheUpdate={this.forceCacheUpdate}
          />
        </span>
      </CellMeasurer>
    );
  }

  renderUnreadNotification() {
    const {
      intl,
      count,
      timeWindowsValues,
    } = this.props;
    const { userScrolledBack } = this.state;

    if (count && userScrolledBack) {
      return (
        <Styled.UnreadButton
          aria-hidden="true"
          color="primary"
          size="sm"
          key="unread-messages"
          label={intl.formatMessage(intlMessages.moreMessages)}
          onClick={() => {
            const lastItemIndex = timeWindowsValues.length - 1;
            this.handleScrollUpdate(lastItemIndex);

            this.setState({
              scrollPosition: lastItemIndex,
              userScrolledBack: false,
            });
          }}
        />
      );
    }

    return null;
  }

  render() {
    const {
      timeWindowsValues,
      width,
    } = this.props;
    const {
      scrollArea,
      scrollPosition,
      userScrolledBack,
    } = this.state;
    ChatLogger.debug('TimeWindowList::render', {...this.props},  {...this.state}, new Date());

    const shouldAutoScroll = !!(
      scrollPosition
      && timeWindowsValues.length >= scrollPosition
      && !userScrolledBack
    );

    const paddingValue = convertRemToPixels(2);

    return (
      [
        <Styled.MessageListWrapper
          onMouseDown={() => {
            this.setState({
              userScrolledBack: true,
            });
          }}
          onWheel={(e) => {
            if (e.deltaY < 0) {
              this.setState({
                userScrolledBack: true,
              });
              this.userScrolledBack = true
            }
          }}
          key="chat-list"
          data-test="chatMessages"
          aria-live="polite"
          ref={node => this.messageListWrapper = node}
        >
          <AutoSizer disableWidth>
            {({ height }) => {
              if (width !== this.lastWidth) {
                this.lastWidth = width;
                this.cache.clearAll();
              }
              return (
                <Styled.MessageList
                  ref={(ref) => {
                    if (ref !== null) {
                      this.listRef = ref;

                      if (!scrollArea) {
                        this.setState({ scrollArea: findDOMNode(this.listRef) });
                      }
                    }
                  }}
                  isScrolling
                  rowHeight={this.cache.rowHeight}
                  rowRenderer={this.rowRender}
                  rowCount={timeWindowsValues.length}
                  height={height}
                  width={width - paddingValue}
                  overscanRowCount={0}
                  deferredMeasurementCache={this.cache}
                  scrollToIndex={shouldAutoScroll ? scrollPosition : undefined}
                  onRowsRendered={({ stopIndex }) => {
                    this.handleScrollUpdate(stopIndex);
                  }}
                  onScroll={({ clientHeight, scrollHeight, scrollTop }) => {
                    const scrollSize = scrollTop + clientHeight;
                    if (scrollSize >= scrollHeight) {
                      this.setState({
                        userScrolledBack: false,
                      });
                    }
                  }}
                />
              );
            }}
          </AutoSizer>
        </Styled.MessageListWrapper>,
        this.renderUnreadNotification(),
      ]
    );
  }
}

TimeWindowList.propTypes = propTypes;
TimeWindowList.defaultProps = defaultProps;

export default injectIntl(TimeWindowList);
