import React from 'react';
import { defineMessages } from 'react-intl';
import PropTypes from 'prop-types';
import { convertRemToPixels } from '/imports/utils/dom-utils';
import data from '@emoji-mart/data';
import withShortcutHelper from '/imports/ui/components/shortcut-help/service';
import { init } from 'emoji-mart';
import { SET_RAISE_HAND } from '/imports/ui/core/graphql/mutations/userMutations';
import { useMutation } from '@apollo/client';
import Styled from './styles';

const RaiseHandButton = (props) => {
  const {
    intl,
    userId,
    raiseHand,
    shortcuts,
  } = props;

  // initialize emoji-mart data, need for the new version
  init({ data });

  const [setRaiseHand] = useMutation(SET_RAISE_HAND);

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

  const handleRaiseHandButtonClick = () => {
    setRaiseHand({
      variables: {
        userId,
        raiseHand: !raiseHand,
      },
    });
    document.activeElement.blur();
  };

  const emojiProps = {
    size: convertRemToPixels(1.5),
    padding: '4px',
  };

  const handReaction = {
    id: 'hand',
    native: '✋',
  };

  const icon = !raiseHand ? 'hand' : null;

  const customIcon = raiseHand
    ? (
      <em-emoji
        key={handReaction.id}
        native={handReaction.native}
        emoji={handReaction}
        {...emojiProps}
      />
    )
    : null;

  const label = raiseHand ? intlMessages.notRaiseHandLabel : intlMessages.raiseHandLabel;

  return (
    <Styled.RaiseHandButton
      data-test="reactionsButton"
      icon={icon}
      customIcon={customIcon}
      label={intl.formatMessage(label)}
      description="Reactions"
      ghost={!raiseHand}
      onKeyPress={() => { }}
      onClick={() => handleRaiseHandButtonClick()}
      color={customIcon ? 'primary' : 'default'}
      accessKey={shortcuts.raisehand}
      hideLabel
      circle
      size="lg"
    />
  );
};

const propTypes = {
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  userId: PropTypes.string.isRequired,
  raiseHand: PropTypes.bool,
  shortcuts: PropTypes.shape({
    raisehand: PropTypes.string,
  }).isRequired,
};

RaiseHandButton.propTypes = propTypes;

export default withShortcutHelper(RaiseHandButton, ['raiseHand']);
