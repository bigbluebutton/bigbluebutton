import React, { useState } from 'react';
import PropTypes from 'prop-types';
import data from '@emoji-mart/data';
import { init } from 'emoji-mart';
import Styled from './styles';

const DISABLED_INTERVAL = Meteor.settings.public.app.emojiRain.intervalEmojis;

const propTypes = {
  onEmojiSelect: PropTypes.func.isRequired,
};

const defaultProps = {
};

const emojisToInclude = [
  // reactions
  '😄', '😅', '😂', '😉', '😍', '😜',
  '🤪', '🤨', '😒', '🙄', '😬', '😔',
  '😴', '😕', '😟', '😯', '😳', '😰',
  '😥', '😭', '😱', '😡', '💀', '💩',
  '🤡', '👌', '👍', '👎', '👊', '👏',
  '🙌', '🙏', '💪', '👀', '❤️', '💙',
];

const ReactionsPicker = (props) => {
  const {
    onEmojiSelect,
  } = props;

  const [selected, setSelected] = useState(null);

  const onEmojiClick = (native) => {
    onEmojiSelect({ native });
    setSelected(native);

    setTimeout(() => {
      setSelected(null);
    }, DISABLED_INTERVAL);
  };

  init({ data });

  return (
    <>
      {emojisToInclude.map((native) => (
        <Styled.EmojiWrapper emoji={native} selected={selected}>
          <em-emoji
            key={native}
            native={native}
            size="30"
            disabled={!!selected}
            onClick={() => !selected && onEmojiClick(native)}
          />
        </Styled.EmojiWrapper>
      ))}
    </>
  );
};

ReactionsPicker.propTypes = propTypes;
ReactionsPicker.defaultProps = defaultProps;

export default ReactionsPicker;
