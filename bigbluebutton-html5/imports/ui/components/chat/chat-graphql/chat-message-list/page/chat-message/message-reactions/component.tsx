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
    user: {
      name: string;
      userId: string;
    };
  }[];
  sendReaction(reactionEmoji: string): void;
  deleteReaction(reactionEmoji: string): void;
}

const ChatMessageReactions: React.FC<ChatMessageReactionsProps> = (props) => {
  const { reactions, sendReaction, deleteReaction } = props;

  const { data: currentUser } = useCurrentUser((u) => ({ userId: u.userId }));
  const intl = useIntl();

  if (reactions.length === 0) return null;

  const reactionItems: Record<string, { count: number; userNames: string[]; reactedByMe: boolean }> = {};

  reactions.forEach((reaction) => {
    if (!reactionItems[reaction.reactionEmoji]) {
      reactionItems[reaction.reactionEmoji] = {
        count: 0,
        userNames: [],
        reactedByMe: false,
      };
    }

    reactionItems[reaction.reactionEmoji].count += 1;
    if (reaction.user.userId === currentUser?.userId) {
      reactionItems[reaction.reactionEmoji].reactedByMe = true;
    } else {
      reactionItems[reaction.reactionEmoji].userNames.push(reaction.user.name);
    }
  });

  return (
    <Styled.ReactionsWrapper>
      {Object.keys(reactionItems).map((emoji) => {
        const details = reactionItems[emoji];
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
                  deleteReaction(emoji);
                } else {
                  sendReaction(emoji);
                }
              }}
            >
              {/* @ts-ignore */}
              <em-emoji
                size={parseFloat(
                  window.getComputedStyle(document.documentElement).fontSize,
                )}
                native={emoji}
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
