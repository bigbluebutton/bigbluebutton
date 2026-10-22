import React from 'react';
import { defineMessages, IntlShape } from 'react-intl';
import deviceInfo from '/imports/utils/deviceInfo';
import withShortcutHelper from '/imports/ui/services/shortcuts/withShortcutHelper';
import { SET_RAISE_HAND } from '/imports/ui/core/graphql/mutations/userMutations';
import { useMutation } from '@apollo/client';
import { listItemBgHover } from '/imports/ui/stylesheets/styled-components/palette';
import { useBarPriorityEntries } from '/imports/ui/core/hooks/useBarPriorityEntries';
import Styled from './styles';

interface RaiseHandButtonProps {
  intl: IntlShape;
  userId: string;
  raiseHand?: boolean;
  shortcuts: Record<string, string>;
  isOverflowed?: boolean;
}

const RaiseHandButton = (props: RaiseHandButtonProps) => {
  const {
    intl,
    userId,
    raiseHand,
    shortcuts,
    isOverflowed = false,
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
    (document.activeElement as HTMLElement | null)?.blur();
  };

  const label = raiseHand ? intlMessages.notRaiseHandLabel : intlMessages.raiseHandLabel;

  useBarPriorityEntries('actionsBar', 'raiseHand', [{
    key: 'raiseHand',
    label: intl.formatMessage(label),
    icon: 'hand',
    onClick: handleRaiseHandButtonClick,
    dataTest: raiseHand ? 'lowerHandOption' : 'raiseHandOption',
    active: raiseHand,
  }]);

  return (
    <Styled.RaiseHandButton
      data-test={raiseHand ? 'lowerHandBtn' : 'raiseHandBtn'}
      icon="hand"
      label={intl.formatMessage(label)}
      description="Reactions"
      onKeyPress={() => { }}
      onClick={() => handleRaiseHandButtonClick()}
      color={raiseHand ? 'primary' : 'default'}
      // Chromium still fires the access key of an inert element, so a collapsed button drops it.
      accessKey={isOverflowed ? undefined : shortcuts.raisehand}
      hideLabel
      circle
      size={deviceInfo.isMobile ? 'md' : 'lg'}
      hoverColor={listItemBgHover}
    />
  );
};

export default withShortcutHelper(RaiseHandButton, ['raiseHand']);
