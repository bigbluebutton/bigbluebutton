import React, { useId } from 'react';
import { capitalize } from 'radash';
import TooltipContainer from '/imports/ui/components/common/tooltip/container';
import { defineMessages, useIntl } from 'react-intl';
import Styled from './styles';

const intlMessages = defineMessages({
  reactionLabel: {
    id: 'app.chat.toolbar.reactions.reactionLabel',
  },
  you: {
    id: 'app.chat.toolbar.reactions.youLabel',
  },
  and: {
    id: 'app.chat.toolbar.reactions.andLabel',
  },
});

interface ReactionItemProps {
  count: number;
  userNames: string[];
  reactedByMe: boolean;
  reactionEmoji: string;
  reactionEmojiId: string;
  shortcodes: string;
  sendReaction(reactionEmoji: string, reactionEmojiId: string, chatId: string, messageId: string): void;
  deleteReaction(reactionEmoji: string, reactionEmojiId: string, chatId: string, messageId: string): void;
  chatId: string;
  messageId: string;
}

const ReactionItem: React.FC<ReactionItemProps> = (props) => {
  const {
    count,
    reactedByMe,
    reactionEmoji,
    reactionEmojiId,
    userNames,
    shortcodes,
    chatId,
    messageId,
    deleteReaction,
    sendReaction,
  } = props;

  const intl = useIntl();
  const id = useId();

  let usersLabel = '';
  if (userNames.length) {
    const users = userNames.join(', ');
    usersLabel += users;

    if (reactedByMe) {
      usersLabel += ` ${intl.formatMessage(intlMessages.and)} ${intl.formatMessage(intlMessages.you)}`;
    }
  } else if (reactedByMe) {
    usersLabel += capitalize(intl.formatMessage(intlMessages.you));
  }

  const label = intl.formatMessage(intlMessages.reactionLabel, {
    userName: usersLabel,
    reaction: shortcodes,
  });

  return (
    <TooltipContainer title={label} key={reactionEmojiId}>
      <Styled.EmojiWrapper
        data-test="messageReactionItem"
        tabIndex={-1}
        aria-describedby={id}
        highlighted={reactedByMe}
        onClick={() => {
          if (reactedByMe) {
            deleteReaction(reactionEmoji, reactionEmojiId, chatId, messageId);
          } else {
            sendReaction(reactionEmoji, reactionEmojiId, chatId, messageId);
          }
        }}
      >
        <em-emoji
          size={parseFloat(
            window.getComputedStyle(document.documentElement).fontSize,
          )}
          emoji={{
            id: reactionEmojiId,
            native: reactionEmoji,
          }}
          native={reactionEmoji}
        />
        <span>{count}</span>
        <span className="sr-only" id={id}>{label}</span>
      </Styled.EmojiWrapper>
    </TooltipContainer>
  );
};

export default ReactionItem;
