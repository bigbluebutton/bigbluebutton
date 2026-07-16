import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import Styled from '/imports/ui/components/sidebar-content/styles';
import MultifunctionalModeButton from '../multifunctional-mode-button/component';
import usePanelClose from './usePanelClose';
import { Layout } from '/imports/ui/components/layout/layoutTypes';
import { layoutSelect } from '/imports/ui/components/layout/context';

const intlMessages = defineMessages({
  minimize: {
    id: 'app.sidebarContent.minimizePanelLabel',
    description: 'Generic minimize label for panels',
  },
});

interface PanelHeaderProps {
  /** PANELS enum value for this panel (e.g. PANELS.USERLIST) */
  panelId: string;
  /** Panel title displayed in the header */
  title: string;
  /** data-test attribute forwarded to the header element */
  dataTest?: string;
  /** Accessible label and visible label for the close/minimize button */
  closeButtonLabel?: string;
  /** data-test for the close button */
  closeButtonDataTest?: string;
  /** Extra props forwarded to the close button (e.g. accessKey) */
  closeButtonProps?: Record<string, unknown>;
  /**
   * Called before the layout dispatches the panel-close actions.
   * Use this for panel-specific cleanup (e.g. marking a private chat as hidden).
   * Receives whether the panel is currently rendered in the auxiliary panel.
   */
  onBeforeClose?: (isInAuxiliaryPanel: boolean) => void;
  /**
   * Extra buttons rendered to the right of the MultifunctionalModeButton.
   * The MultifunctionalModeButton is always included automatically.
   */
  customRightButton?: React.ReactElement | null;
}

const PanelHeader: React.FC<PanelHeaderProps> = ({
  panelId,
  title,
  dataTest,
  closeButtonLabel,
  closeButtonDataTest,
  closeButtonProps = {},
  onBeforeClose,
  customRightButton,
}) => {
  const intl = useIntl();
  const { closePanel } = usePanelClose(panelId, onBeforeClose);
  const isRTL = layoutSelect((i: Layout) => i.isRTL);

  const resolvedCloseLabel = closeButtonLabel
    ?? intl.formatMessage(intlMessages.minimize, { panelName: title });

  const multifunctionalModeButton = <MultifunctionalModeButton panelId={panelId} />;
  const rightButton = customRightButton !== undefined
    ? (
      <>
        {multifunctionalModeButton}
        {customRightButton}
      </>
    ) : multifunctionalModeButton;

  return (
    <Styled.HeaderContainer
      isRTL={isRTL}
      data-test={dataTest}
      title={title}
      rightButtonProps={{
        'aria-label': resolvedCloseLabel,
        'data-test': closeButtonDataTest,
        icon: 'minus',
        label: resolvedCloseLabel,
        onClick: closePanel,
        ...closeButtonProps,
      }}
      customRightButton={rightButton}
    />
  );
};

export default PanelHeader;
