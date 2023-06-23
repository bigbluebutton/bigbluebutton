import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, defineMessages } from 'react-intl';
import { Emoji } from 'emoji-mart';
import 'emoji-mart/css/emoji-mart.css';
import Styled from './styles';
import UserListService from '/imports/ui/components/user-list/service';
import Toggle from '/imports/ui/components/common/switch/component';

const propTypes = {
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  onEmojiSelect: PropTypes.func.isRequired,
};

const intlMessages = defineMessages({
  raiseHandLabel: {
    id: 'app.actionsBar.interactions.raiseHand',
    description: 'raise Hand Label',
  },
  notRaiseHandLabel: {
    id: 'app.actionsBar.interactions.lowHand',
    description: 'not Raise Hand Label',
  },
  presentLabel: {
    id: 'app.actionsBar.interactions.present',
    description: 'present Label',
  },
  awayLabel: {
    id: 'app.actionsBar.interactions.away',
    description: 'away Label',
  },
});

const reactions = [
  {
    id: 'slightly_smiling_face',
    native: '🙂',
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
    userId,
    raiseHand,
    away,
  } = props;

  const handleRaiseHandButtonClick = () => {
    UserListService.setUserRaiseHand(userId, !raiseHand);
  };

  const RaiseHandButtonLabel = () => {
    return raiseHand
      ? intl.formatMessage(intlMessages.notRaiseHandLabel)
      : intl.formatMessage(intlMessages.raiseHandLabel);
  };

  const handleToggleAFK = () => {
    UserListService.setUserAway(userId, !away);
  };

  const ToggleAFKLabel = () => {
    return away
      ? intl.formatMessage(intlMessages.awayLabel)
      : intl.formatMessage(intlMessages.presentLabel);
  };

  return (
    <Styled.Wrapper>
      {reactions.map(({ id, native }) => (
        <Styled.ButtonWrapper>
          <Emoji key={id} emoji={{ id }} size={30} onClick={() => onReactionSelect(native)} />
        </Styled.ButtonWrapper>
      ))}
      <Styled.Separator />
      <Styled.ToggleButtonWrapper>
        <Toggle
          icons={false}
          defaultChecked={away}
          onChange={() => {
            handleToggleAFK();
          }}
          ariaLabel={ToggleAFKLabel()}
          showToggleLabel={false}
        />
        {ToggleAFKLabel()}
      </Styled.ToggleButtonWrapper>
      <Styled.Separator />
      <Styled.RaiseHandButtonWrapper onClick={() => handleRaiseHandButtonClick()} active={raiseHand}>
        <Emoji key='hand' emoji={{ id: 'hand' }} size={30} />
        {RaiseHandButtonLabel()}
      </Styled.RaiseHandButtonWrapper>
    </Styled.Wrapper>
  );
};

ReactionsPicker.propTypes = propTypes;

export default injectIntl(ReactionsPicker);
