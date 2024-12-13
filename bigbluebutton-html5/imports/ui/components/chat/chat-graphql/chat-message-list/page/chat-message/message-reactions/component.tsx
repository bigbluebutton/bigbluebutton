import React from 'react';
import emojiData from '@emoji-mart/data';
import Styled from './styles';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import ReactionItem from './reaction-item/component';

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
  shortcodes: string;
}

const sortByCount = (r1: ReactionItem, r2: ReactionItem) => r2.count - r1.count;
const sortByLeastRecent = (r1: ReactionItem, r2: ReactionItem) => r1.leastRecent - r2.leastRecent;

const ChatMessageReactions: React.FC<ChatMessageReactionsProps> = (props) => {
  const {
    reactions, sendReaction, deleteReaction, chatId, messageId,
  } = props;

  const { data: currentUser } = useCurrentUser((u) => ({ userId: u.userId }));

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
        // @ts-ignore
        shortcodes: emojiData.emojis[reactionEmojiId].skins[0].shortcodes,
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
      {Object.values(reactionItems).sort(sortByLeastRecent).sort(sortByCount).map((details) => (
        <ReactionItem
          chatId={chatId}
          count={details.count}
          deleteReaction={deleteReaction}
          messageId={messageId}
          reactedByMe={details.reactedByMe}
          reactionEmoji={details.reactionEmoji}
          reactionEmojiId={details.reactionEmojiId}
          sendReaction={sendReaction}
          shortcodes={details.shortcodes}
          userNames={details.userNames}
          key={details.reactionEmojiId}
        />
      ))}
    </Styled.ReactionsWrapper>
  );
};

export default ChatMessageReactions;
