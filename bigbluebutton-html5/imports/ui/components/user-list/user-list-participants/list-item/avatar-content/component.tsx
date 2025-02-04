// AvatarContent.tsx
import React from 'react';
import Icon from '/imports/ui/components/common/icon/icon-ts/component';
import { AvatarContentProps, EmojiProps } from './types';
import { convertRemToPixels } from '/imports/utils/dom-utils';
import { useIsReactionsEnabled } from '/imports/ui/services/features';

const Emoji: React.FC<EmojiProps> = ({ emoji, native, size }) => (
  <em-emoji emoji={emoji} native={native} size={size} />
);

const AvatarContent: React.FC<AvatarContentProps> = ({ user }) => {
  const isReactionsEnabled = useIsReactionsEnabled();
  const emojiIcons = [
    {
      id: 'hand',
      native: '✋',
    },
    {
      id: 'clock7',
      native: '⏰',
    },
  ];

  const getIconUser = () => {
    const emojiSize = convertRemToPixels(1.3);

    if (user.isDialIn) {
      return <Icon iconName="volume_level_2" />;
    }
    if (user.raiseHand === true) {
      return isReactionsEnabled
        ? (
          <Emoji
            key={emojiIcons[0].id}
            emoji={emojiIcons[0]}
            native={emojiIcons[0].native}
            size={emojiSize}
          />
        ) : <Icon iconName="hand" />;
    }
    if (user.away === true) {
      return isReactionsEnabled
        ? (
          <Emoji
            key="away"
            emoji={emojiIcons[1]}
            native={emojiIcons[1].native}
            size={emojiSize}
          />
        ) : <Icon iconName="time" />;
    }
    if (user.reactionEmoji && user.reactionEmoji !== 'none') {
      return user.reactionEmoji;
    }
    if (user.name && user.avatar.length === 0) {
      return user.name.toLowerCase().slice(0, 2);
    }
    return '';
  };

  const userAvatarFiltered = (user.raiseHand === true || user.away === true || (user.reactionEmoji && user.reactionEmoji !== 'none')) ? '' : user.avatar;
  const avatarContent = user.lastBreakoutRoom?.currentlyInRoom && userAvatarFiltered.length === 0
    ? user.lastBreakoutRoom?.sequence
    : getIconUser();

  return (
    <>
      {avatarContent}
    </>
  );
};

export default AvatarContent;
