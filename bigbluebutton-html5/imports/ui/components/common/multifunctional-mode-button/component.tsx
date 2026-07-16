import React, { useCallback } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { layoutDispatch, layoutSelectInput, layoutSelectOutput } from '/imports/ui/components/layout/context';
import { Input, Output } from '/imports/ui/components/layout/layoutTypes';
import { ACTIONS } from '/imports/ui/components/layout/enums';
import { isMobile } from '/imports/utils/deviceInfo';
import Styled from './styles';
import { useIsMultiFunctionalModeEnabled } from '/imports/ui/services/features';

const intlMessages = defineMessages({
  enableMultiFunctionalMode: {
    id: 'app.enableMultiFunctionalMode',
    description: 'Enable multi-functional mode button label',
  },
  disableMultiFunctionalMode: {
    id: 'app.disableMultiFunctionalMode',
    description: 'Disable multi-functional mode button label',
  },
});

interface MultifunctionalModeButtonProps {
  panelId: string;
}

const MultifunctionalModeButton: React.FC<MultifunctionalModeButtonProps> = ({ panelId }) => {
  const intl = useIntl();
  const layoutContextDispatch = layoutDispatch();
  const sidebarContentAuxiliaryInput = layoutSelectInput((i: Input) => i.sidebarContentAuxiliary);
  const {
    sidebarContentPanel: sidebarContentPanelAuxiliary,
    isOpen: isAuxiliaryOpen,
  } = sidebarContentAuxiliaryInput;
  const beingRenderedInAuxiliaryPanel = isAuxiliaryOpen && sidebarContentPanelAuxiliary === panelId;
  const sidebarContentAuxiliaryOutput = layoutSelectOutput((i: Output) => i.sidebarContentAuxiliary);
  const { display } = sidebarContentAuxiliaryOutput;
  const isFeatureEnabled = useIsMultiFunctionalModeEnabled();
  const isEnabled = isAuxiliaryOpen && display;

  const toggleMultiFunctionalMode = useCallback(() => {
    layoutContextDispatch({
      type: ACTIONS.SET_SIDEBAR_CONTENT_AUXILIARY_IS_OPEN,
      value: !display,
    });
  }, [layoutContextDispatch, display]);

  if (isMobile || beingRenderedInAuxiliaryPanel || !isFeatureEnabled) return null;
  const label = !isEnabled
    ? intl.formatMessage(intlMessages.enableMultiFunctionalMode)
    : intl.formatMessage(intlMessages.disableMultiFunctionalMode);

  return (
    <Styled.TriggerStyled
      label={label}
      aria-label={label}
      hideLabel
      icon="add_column"
      data-test="enableMultiFunctionalMode"
      onClick={toggleMultiFunctionalMode}
      $active={display}
    />
  );
};

export default MultifunctionalModeButton;
