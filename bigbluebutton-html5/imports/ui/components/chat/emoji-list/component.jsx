import React from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import PropTypes from 'prop-types';
import { Emoji, emojiIndex } from 'emoji-mart';
import Styled from './styles';

const intlMessages = defineMessages({
  list: {
    id: 'app.chat.emojiList.list',
    description: 'Emoji list',
  },
  select: {
    id: 'app.chat.emojiList.selectEmoji',
    description: 'Select specific emoji',
  },
});

const propTypes = {
  emojiKey: PropTypes.string,
  focusedEmojiListItem: PropTypes.number,
  onSelect: PropTypes.func,
  onUpdate: PropTypes.func,
  setFocusedItem: PropTypes.func,
};

const defaultProps = {
  emojiKey: '',
  focusedEmojiListItem: 0,
  onSelect: () => {},
  onUpdate: () => {},
  setFocusedItem: () => {},
};

class EmojiList extends React.Component {
  constructor(props) {
    super(props);

    this.componentDidMount = this.handleFocusedItem.bind(this);
    this.componentDidUpdate = this.handleFocusedItem.bind(this);
  }

  handleFocusedItem(prevProps = {}) {
    const {
      focusedEmojiListItem,
      setFocusedItem,
    } = this.props;
    const {
      focusedEmojiListItem: prevFocusedEmojiListItem,
    } = prevProps;

    if (focusedEmojiListItem > this.emojis.length - 1) {
      setFocusedItem(0);
    }

    if (focusedEmojiListItem < 0) {
      setFocusedItem(this.emojis.length - 1);
    }

    const focusedItemRef = this.itemRefs[focusedEmojiListItem];
    const listRef = this.listRef;
    const isOutOfView = (focusedItemRef?.offsetTop <
      (listRef?.scrollTop + focusedItemRef?.clientHeight / 2))
      || (focusedItemRef?.offsetTop >
        (listRef?.scrollTop + listRef?.clientHeight - focusedItemRef?.clientHeight / 2));

    if (isOutOfView) {
      if (prevFocusedEmojiListItem && prevFocusedEmojiListItem < focusedEmojiListItem) {
        focusedItemRef?.scrollIntoView?.(false);
      } else if ( prevFocusedEmojiListItem && prevFocusedEmojiListItem > focusedEmojiListItem) {
        focusedItemRef?.scrollIntoView?.();
      }
    }
  }

  handleSelectEmoji(emoji, event) {
    const { onSelect } = this.props;
    event.stopPropagation();
    onSelect(emoji);
  }

  render() {
    const {
      emojiKey,
      focusedEmojiListItem,
      intl,
      onEmpty,
      onUpdate,
    } = this.props;
  
    this.emojis = emojiIndex.search(emojiKey);
    this.itemRefs = [];
    this.listRef = null;

    if (this.emojis && this.emojis.length > 0) {
      return (
        <Styled.EmojiList
          as="ul"
          ref={(ref) => this.listRef = ref}
          aria-label={intl.formatMessage(intlMessages.list)}
          tabIndex={0}
        >
          {this.emojis.map((emoji, index) => {
            const focused = focusedEmojiListItem === index;

            if (focused) setTimeout(() => { onUpdate(emoji); }, 0);

            return (
              <Styled.EmojiItem
                key={emoji.id}
                onClick={this.handleSelectEmoji.bind(this, emoji)}
                focused={focused}
                ref={(ref) => this.itemRefs[index] = ref}
                tabIndex={0}
                aria-label={`${intl.formatMessage(intlMessages.select)} ${emoji.name}`}
              >
                <Emoji
                  emoji={emoji}
                  size={24}
                  native
                />
                <div>
                  {emoji.colons}
                </div>
              </Styled.EmojiItem>
            );
          })}
        </Styled.EmojiList>
      );
    }
  
    setTimeout(() => {
      onEmpty();
    }, 0);
    return null;
  }
};

EmojiList.propTypes = propTypes;
EmojiList.defaultProps = defaultProps;

export default injectIntl(EmojiList);
