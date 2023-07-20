import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, defineMessages } from 'react-intl';
import { Emoji } from 'emoji-mart';
import 'emoji-mart/css/emoji-mart.css';
import Styled from './styles';

const propTypes = {
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  onEmojiSelect: PropTypes.func.isRequired,
};

const intlMessages = defineMessages({
  raiseHandLabel: {
    id: 'app.actionsBar.reactions.raiseHand',
    description: 'raise Hand Label',
  },
  notRaiseHandLabel: {
    id: 'app.actionsBar.reactions.lowHand',
    description: 'not Raise Hand Label',
  },
});

const reactions = [
  {
    id: 'smiley',
    native: '😃',
  },
  {
    id: 'neutral_face',
    native: '😐',
  },
  {
    id: 'slightly_frowning_face',
    native: '🙁',
  },
  {
    id: '+1',
    native: '👍',
  },
  {
    id: '-1',
    native: '👎',
  },
  {
    id: 'clap',
    native: '👏',
  },
];

const ReactionsPicker = (props) => {
  const {
    intl,
    onReactionSelect,
    onRaiseHand,
    raiseHand,
    isMobile,
    currentUserReaction,
  } = props;

  const RaiseHandButtonLabel = () => {
    if (isMobile) return null;

    return raiseHand
      ? intl.formatMessage(intlMessages.notRaiseHandLabel)
      : intl.formatMessage(intlMessages.raiseHandLabel);
  };

  const emojiProps = {
    native: true,
    size: '1.5rem',
  };

  return (
    <Styled.Wrapper isMobile={isMobile}>
      {reactions.map(({ id, native }) => (
        <Styled.ButtonWrapper active={currentUserReaction === native}>
          <Emoji key={id} emoji={{ id }} onClick={() => onReactionSelect(native)} {...emojiProps} />
        </Styled.ButtonWrapper>
      ))}
      <Styled.Separator isMobile={isMobile} />
      <Styled.RaiseHandButtonWrapper onClick={() => onRaiseHand()} active={raiseHand}>
        <Emoji key='hand' emoji={{ id: 'hand' }} {...emojiProps} />
        {RaiseHandButtonLabel()}
      </Styled.RaiseHandButtonWrapper>
    </Styled.Wrapper>
  );
};

ReactionsPicker.propTypes = propTypes;

export default injectIntl(ReactionsPicker);
