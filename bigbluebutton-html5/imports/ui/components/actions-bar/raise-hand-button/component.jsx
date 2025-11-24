import React from 'react';
import { defineMessages } from 'react-intl';
import PropTypes from 'prop-types';
import withShortcutHelper from '/imports/ui/components/shortcut-help/service';
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

  const label = raiseHand ? intlMessages.notRaiseHandLabel : intlMessages.raiseHandLabel;

  return (
    <Styled.RaiseHandButton
      data-test={raiseHand ? 'lowerHandBtn' : 'raiseHandBtn'}
      icon="hand"
      label={intl.formatMessage(label)}
      description="Reactions"
      onKeyPress={() => { }}
      onClick={() => handleRaiseHandButtonClick()}
      color={raiseHand ? 'primary' : 'default'}
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
