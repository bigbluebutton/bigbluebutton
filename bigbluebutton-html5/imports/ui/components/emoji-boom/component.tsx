import React, { useEffect } from 'react';
import { useEmojiThrow } from './hooks';
import type { ReactionItem } from './types';

interface EmojiBoomProps {
  emojiSize: number;
  numberOfEmojis: number;
  sourceId: string;
  userId?: string;
  reactions: ReactionItem[] | null;
}

const EmojiBoomComponent: React.FC<EmojiBoomProps> = ({
  reactions, emojiSize, numberOfEmojis, sourceId, userId,
}) => {
  const { throwEmoji } = useEmojiThrow();

  const createEmojiBoom = (reaction: ReactionItem) => {
    throwEmoji(
      reaction.reactionEmoji,
      reaction.user.nameSortable,
      reaction.user.color,
      reaction.user.isModerator,
      sourceId,
      numberOfEmojis,
      emojiSize,
    );
  };

  useEffect(() => {
    if (reactions) {
      const filteredReactions = userId == null
        ? reactions
        : reactions.filter((reaction) => reaction.userId === userId);

      filteredReactions.forEach(createEmojiBoom);
    }
  }, [reactions, userId]);

  return <div id="reactionAnimationContainer" data-test="reactionAnimationContainer" />;
};

export default EmojiBoomComponent;
