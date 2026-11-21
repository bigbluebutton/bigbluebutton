import React, { useMemo, useRef } from 'react';
import EmojiRain from './component';
import { getEmojisToRain } from './queries';
import useDeduplicatedSubscription from '../../core/hooks/useDeduplicatedSubscription';

const EmojiRainContainer = () => {
  const nowDate = useRef(new Date().toUTCString());

  const {
    data: emojisToRainData,
  } = useDeduplicatedSubscription(getEmojisToRain, {
    variables: {
      initialCursor: nowDate.current,
    },
  });
  // Keyed on the subscription data so a re-render of the parent does not
  // hand EmojiRain a new array and replay the reactions of the last second.
  const reactions = useMemo(() => {
    const emojisArray = emojisToRainData?.user_reaction_stream || [];
    return emojisArray.map((reaction) => ({
      reaction: reaction.reactionEmoji,
      creationDate: new Date(reaction.createdAt),
    }));
  }, [emojisToRainData]);

  return <EmojiRain reactions={reactions} />;
};

export default EmojiRainContainer;
