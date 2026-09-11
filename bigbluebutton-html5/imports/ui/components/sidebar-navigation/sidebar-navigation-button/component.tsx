/* eslint-disable jsx-a11y/no-access-key */
import React, { useCallback, memo } from 'react';
import KEYS from '/imports/utils/keys';
import resolveIcon from '/imports/ui/components/plugins/plugin-icon/utils';
import { layoutDispatch, layoutSelect, layoutSelectInput } from '/imports/ui/components/layout/context';
import { Input, Layout } from '/imports/ui/components/layout/layoutTypes';
import {
  ACTIONS, DEVICE_TYPE, PANELS,
} from '/imports/ui/components/layout/enums';
import TooltipContainer from '/imports/ui/components/common/tooltip/container';
import { SidebarNavigationButtonProps } from './types';
import Styled from './styles';
import { useIsMultiFunctionalModeEnabled } from '/imports/ui/services/features';

const SidebarNavigationButton: React.FC<SidebarNavigationButtonProps> = ({
  panel,
  isOpened = false,
  iconName,
  label,
  hasNotification = false,
  hasPrivateNotification = false,
  isDisabled = false,
  isLocked = false,
  accessKey,
  dataTest,
  id,
  onClick,
  onKeyDown,
  onToggle,
  children,
  ariaDescribedBy,
}) => {
  const layoutContextDispatch = layoutDispatch();
  // Same source of truth as the rail scrollbox gutter (deviceType === MOBILE, i.e.
  // width <= 599px), so the icon width and the gutter switch at the same threshold
  // and the 600-640px band no longer dips the icons to the mobile size (issue 25564).
  const deviceType = layoutSelect((i: Layout) => i.deviceType);
  const isMobile = deviceType === DEVICE_TYPE.MOBILE;
  const sidebarContentAuxiliaryInput = layoutSelectInput((i: Input) => i.sidebarContentAuxiliary);
  const {
    sidebarContentPanel: sidebarContentPanelAuxiliary,
    isOpen: isAuxiliaryOpen,
  } = sidebarContentAuxiliaryInput;
  const isInAuxiliaryPanel = isAuxiliaryOpen && sidebarContentPanelAuxiliary === panel;
  const isMultiFunctionalModeEnabled = useIsMultiFunctionalModeEnabled();

  const togglePanel = useCallback(() => {
    const willOpen = !isOpened;

    if (onToggle) {
      onToggle(willOpen);
    }

    if (isMultiFunctionalModeEnabled && isInAuxiliaryPanel) {
      layoutContextDispatch({
        type: ACTIONS.SET_SIDEBAR_CONTENT_AUXILIARY_IS_OPEN,
        value: willOpen,
      });
    } else {
      layoutContextDispatch({
        type: ACTIONS.SET_SIDEBAR_CONTENT_IS_OPEN,
        value: willOpen,
      });

      layoutContextDispatch({
        type: ACTIONS.SET_SIDEBAR_CONTENT_PANEL,
        value: willOpen ? panel : PANELS.NONE,
      });
    }
  }, [layoutContextDispatch, isOpened, panel, onToggle, isInAuxiliaryPanel, isMultiFunctionalModeEnabled]);

  const handleClick = useCallback(() => {
    if (isDisabled) return;

    if (onClick) {
      onClick();
    } else if (panel) {
      togglePanel();
    }
  }, [onClick, togglePanel, isDisabled, panel]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (isDisabled) return;

    if (onKeyDown) {
      onKeyDown(e);
    } else if (e.key === KEYS.ENTER) {
      if (onClick) {
        onClick();
      } else if (panel) {
        togglePanel();
      }
    }
  }, [onKeyDown, togglePanel, isDisabled, onClick, panel]);

  return (
    <TooltipContainer
      title={label}
      position="right"
    >
      <Styled.ListItem
        id={id}
        accessKey={accessKey}
        aria-label={label}
        aria-describedby={ariaDescribedBy}
        aria-expanded={isOpened}
        $active={isOpened}
        role="button"
        tabIndex={isDisabled ? -1 : 0}
        data-test={dataTest}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        $hasNotification={hasNotification}
        $hasPrivateNotification={hasPrivateNotification}
        $disabled={isDisabled}
        $locked={isLocked}
        $isMobile={isMobile}
      >
        {resolveIcon(iconName)}
        {children}
      </Styled.ListItem>
    </TooltipContainer>
  );
};

export default memo(SidebarNavigationButton);
