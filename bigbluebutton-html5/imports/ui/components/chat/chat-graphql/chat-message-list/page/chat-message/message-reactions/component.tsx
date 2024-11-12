import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import Styled from './styles';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import TooltipContainer from '/imports/ui/components/common/tooltip/container';

const intlMessages = defineMessages({
  reactedBy: {
    id: 'app.chat.toolbar.reactions.reactedByLabel',
  },
  you: {
    id: 'app.chat.toolbar.reactions.youLabel',
  },
  and: {
    id: 'app.chat.toolbar.reactions.andLabel',
  },
  findAReaction: {
    id: 'app.chat.toolbar.reactions.findReactionButtonLabel',
  },
});

interface ChatMessageReactionsProps {
  reactions: {
    createdAt: string;
    reactionEmoji: string;
    reactionEmojiId: string;
    user: {
      name: string;
      userId: string;
    };
  }[];
  sendReaction(reactionEmoji: string, reactionEmojiId: string, chatId: string, messageId: string): void;
  deleteReaction(reactionEmoji: string, reactionEmojiId: string, chatId: string, messageId: string): void;
  chatId: string;
  messageId: string;
}

type ReactionItem = {
  count: number;
  userNames: string[];
  reactedByMe: boolean;
  reactionEmoji: string;
  reactionEmojiId: string;
  leastRecent: number;
}

const sortByCount = (r1: ReactionItem, r2: ReactionItem) => r2.count - r1.count;
const sortByLeastRecent = (r1: ReactionItem, r2: ReactionItem) => r1.leastRecent - r2.leastRecent;

const ChatMessageReactions: React.FC<ChatMessageReactionsProps> = (props) => {
  const {
    reactions, sendReaction, deleteReaction, chatId, messageId,
  } = props;

  const { data: currentUser } = useCurrentUser((u) => ({ userId: u.userId }));
  const intl = useIntl();

  if (reactions.length === 0) return null;

  const reactionItems = reactions.reduce((previousValue, reaction) => {
    const newValue = { ...previousValue };
    const {
      createdAt,
      reactionEmoji,
      reactionEmojiId,
      user,
    } = reaction;

    if (!newValue[reactionEmojiId]) {
      const reactedByMe = user.userId === currentUser?.userId;
      newValue[reactionEmojiId] = {
        count: 1,
        userNames: reactedByMe ? [] : [user.name],
        reactedByMe,
        reactionEmoji,
        reactionEmojiId,
        leastRecent: new Date(createdAt).getTime(),
      };
      return newValue;
    }

    newValue[reactionEmojiId].count += 1;
    if (user.userId === currentUser?.userId) {
      newValue[reactionEmojiId].reactedByMe = true;
    } else {
      newValue[reactionEmojiId].userNames.push(user.name);
    }

    return newValue;
  }, {} as Record<string, ReactionItem>);

  return (
    <Styled.ReactionsWrapper>
      {Object.values(reactionItems).sort(sortByLeastRecent).sort(sortByCount).map((details) => {
        const {
          count,
          reactedByMe,
          reactionEmoji,
          reactionEmojiId,
          userNames,
        } = details;
        let label = intl.formatMessage(intlMessages.reactedBy);
        if (userNames.length) {
          const users = userNames.join(', ');
          label += ` ${users}`;

          if (reactedByMe) {
            label += ` ${intl.formatMessage(intlMessages.and)} ${intl.formatMessage(intlMessages.you)}`;
          }
        } else if (reactedByMe) {
          label += ` ${intl.formatMessage(intlMessages.you)}`;
        }

        return (
          <TooltipContainer title={label} key={reactionEmojiId}>
            <Styled.EmojiWrapper
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
            </Styled.EmojiWrapper>
          </TooltipContainer>
        );
      })}
    </Styled.ReactionsWrapper>
  );
};

export default ChatMessageReactions;
