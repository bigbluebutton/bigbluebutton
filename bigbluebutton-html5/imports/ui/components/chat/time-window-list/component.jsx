import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl } from 'react-intl';
import _ from 'lodash';
import Styled from './styles';
import ChatLogger from '/imports/ui/components/chat/chat-logger/ChatLogger';
import TimeWindowChatItem from './time-window-chat-item/container';

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

    // Refs
    this.listRef = null;
    this.listInstanceRef = null;

    // Handlers
    this.handleScrollUpdate = _.debounce(this.handleScrollUpdate.bind(this), 150);
    this.handleAtBottomStateChange = this.handleAtBottomStateChange.bind(this);
    this.handleRangeChanged = this.handleRangeChanged.bind(this);

    // Helpers
    this.computeItemKey = this.computeItemKey.bind(this);
    this.setListRef = this.setListRef.bind(this);
    this.setListInstanceRef = this.setListInstanceRef.bind(this);

    // Renders
    this.rowRender = this.rowRender.bind(this);

    this.state = {
      scrollArea: null,
      scrollPosition: 0,
      userScrolledBack: false,
      fontsLoaded: false,
    };

    document.fonts.onloadingdone = () => this.setState({ fontsLoaded: true });
  }

  componentDidMount() {
    const { scrollPosition: scrollPositionProps } = this.props;

    this.setState({ scrollPosition: scrollPositionProps });
  }

  componentDidUpdate(prevProps) {
    ChatLogger.debug('TimeWindowList::componentDidUpdate', { ...this.props }, { ...prevProps });

    const {
      userSentMessage,
      setUserSentMessage,
      timeWindowsValues,
      chatId,
      scrollPosition: scrollPositionProps,
      count,
    } = this.props;

    const {
      userScrolledBack,
      scrollPosition,
    } = this.state;

    if ((count > 0 && !userScrolledBack) || userSentMessage || !scrollPositionProps) {
      const lastItemIndex = timeWindowsValues.length - 1;

      this.setState({
        scrollPosition: lastItemIndex,
      }, () => this.handleScrollUpdate(lastItemIndex));
    }

    const { chatId: prevChatId } = prevProps;

    if (prevChatId !== chatId) {
      this.setState({
        scrollPosition: scrollPositionProps,
      });
    }

    if (userSentMessage && !prevProps.userSentMessage) {
      this.setState({
        userScrolledBack: false,
      }, () => setUserSentMessage(false));
    }

    const shouldAutoScroll = !!(
      scrollPosition
      && timeWindowsValues.length >= scrollPosition
      && !userScrolledBack
    );

    if (shouldAutoScroll && this.listInstanceRef) {
      this.listInstanceRef.scrollToIndex(scrollPosition);
    }
  }

  handleScrollUpdate(position = 1) {
    const { handleScrollUpdate: handleScrollUpdateProps } = this.props;

    handleScrollUpdateProps(position);
  }

  rowRender(index, data) {
    const {
      id,
      dispatch,
      chatId,
    } = this.props;

    const { scrollArea } = this.state;
    const message = data;

    ChatLogger.debug('TimeWindowList::rowRender', this.props);
    return (
      <TimeWindowChatItem
        key={`time-window-chat-item-${index}`}
        message={message}
        messageId={message.id}
        chatAreaId={id}
        scrollArea={scrollArea}
        dispatch={dispatch}
        chatId={chatId}
      />
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

  setListInstanceRef(ref) {
    if (ref !== null) {
      this.listInstanceRef = ref;
    }
  }

  setListRef(ref) {
    const { scrollArea } = this.state;

    if (ref !== null) {
      this.listRef = ref;

      if (!scrollArea) {
        this.setState({ scrollArea: this.listRef });
      }
    }
  }

  handleAtBottomStateChange(atBottom) {
    const { userScrolledBack } = this.state;

    if (atBottom && userScrolledBack) {
      this.setState({ userScrolledBack: false });
    } else if (!atBottom && !userScrolledBack) {
      this.setState({ userScrolledBack: true });
    }
  }

  handleRangeChanged({ endIndex }) {
    this.handleScrollUpdate(endIndex);
  }

  computeItemKey(index) {
    const { timeWindowsValues } = this.props;
    const timeWindowValue = timeWindowsValues[index];
    const key = timeWindowValue?.key;
    const length = timeWindowValue?.content?.length;
    return `${key}-${length}`;
  }

  render() {
    const { timeWindowsValues } = this.props;

    ChatLogger.debug('TimeWindowList::render', { ...this.props },  { ...this.state }, new Date());

    return (
      [
        <Styled.MessageListWrapper
          key="chat-list"
          data-test="chatMessages"
          aria-live="polite"
          ref={node => this.messageListWrapper = node}
          onCopy={(e) => { e.stopPropagation(); }}
        >
          <Styled.MessageList
            ref={this.setListInstanceRef}
            scrollerRef={this.setListRef}
            defaultItemHeight={18}
            itemContent={this.rowRender}
            data={timeWindowsValues}
            overscan={0}
            atBottomThreshold={1}
            atBottomStateChange={this.handleAtBottomStateChange}
            computeItemKey={this.computeItemKey}
            rangeChanged={this.handleRangeChanged}
          />
        </Styled.MessageListWrapper>,
        this.renderUnreadNotification(),
      ]
    );
  }
}

TimeWindowList.propTypes = propTypes;
TimeWindowList.defaultProps = defaultProps;

export default injectIntl(TimeWindowList);
