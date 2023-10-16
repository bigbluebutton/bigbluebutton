import React from 'react';
import PropTypes from 'prop-types';
import data from '@emoji-mart/data';
import { init } from 'emoji-mart';

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

  init({ data });

  return (
    <>
      {emojisToInclude.map((native) => (
        <em-emoji
          key={native}
          native={native}
          size="30"
          onClick={() => onEmojiSelect({ native })}
        />
      ))}
    </>
  );
};

ReactionsPicker.propTypes = propTypes;
ReactionsPicker.defaultProps = defaultProps;

export default ReactionsPicker;
