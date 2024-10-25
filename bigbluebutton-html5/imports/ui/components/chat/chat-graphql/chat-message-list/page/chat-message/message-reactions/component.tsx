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
  sendReaction(reactionEmoji: string, reactionEmojiId: string): void;
  deleteReaction(reactionEmoji: string, reactionEmojiId: string): void;
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
  const { reactions, sendReaction, deleteReaction } = props;

  const { data: currentUser } = useCurrentUser((u) => ({ userId: u.userId }));
  const intl = useIntl();

  if (reactions.length === 0) return null;

  const reactionItems: Record<
    string,
    ReactionItem
  > = {};

  reactions.forEach((reaction) => {
    if (!reactionItems[reaction.reactionEmojiId]) {
      const reactedByMe = reaction.user.userId === currentUser?.userId;
      reactionItems[reaction.reactionEmojiId] = {
        count: 1,
        userNames: reactedByMe ? [] : [reaction.user.name],
        reactedByMe,
        reactionEmoji: reaction.reactionEmoji,
        reactionEmojiId: reaction.reactionEmojiId,
        leastRecent: new Date(reaction.createdAt).getTime(),
      };
      return;
    }

    reactionItems[reaction.reactionEmojiId].count += 1;
    if (reaction.user.userId === currentUser?.userId) {
      reactionItems[reaction.reactionEmojiId].reactedByMe = true;
    } else {
      reactionItems[reaction.reactionEmojiId].userNames.push(reaction.user.name);
    }
  });

  return (
    <Styled.ReactionsWrapper>
      {Object.values(reactionItems).sort(sortByLeastRecent).sort(sortByCount).map((details) => {
        let label = intl.formatMessage(intlMessages.reactedBy);
        if (details.userNames.length) {
          const users = details.userNames.join(', ');
          label += ` ${users}`;

          if (details.reactedByMe) {
            label += ` ${intl.formatMessage(intlMessages.and)} ${intl.formatMessage(intlMessages.you)}`;
          }
        } else if (details.reactedByMe) {
          label += ` ${intl.formatMessage(intlMessages.you)}`;
        }

        return (
          <TooltipContainer title={label}>
            <Styled.EmojiWrapper
              highlighted={details.reactedByMe}
              onClick={() => {
                if (details.reactedByMe) {
                  deleteReaction(details.reactionEmoji, details.reactionEmojiId);
                } else {
                  sendReaction(details.reactionEmoji, details.reactionEmojiId);
                }
              }}
            >
              <em-emoji
                size={parseFloat(
                  window.getComputedStyle(document.documentElement).fontSize,
                )}
                emoji={{
                  id: details.reactionEmojiId,
                  native: details.reactionEmoji,
                }}
                native={details.reactionEmoji}
              />
              <span>{details.count}</span>
            </Styled.EmojiWrapper>
          </TooltipContainer>
        );
      })}
    </Styled.ReactionsWrapper>
  );
};

export default ChatMessageReactions;
