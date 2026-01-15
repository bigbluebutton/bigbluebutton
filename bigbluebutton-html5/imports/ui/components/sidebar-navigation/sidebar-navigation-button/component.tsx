/* eslint-disable jsx-a11y/no-access-key */
import React, { useCallback, memo } from 'react';
import KEYS from '/imports/utils/keys';
import { layoutDispatch } from '/imports/ui/components/layout/context';
import { ACTIONS, PANELS } from '/imports/ui/components/layout/enums';
import TooltipContainer from '/imports/ui/components/common/tooltip/container';
import Icon from '/imports/ui/components/common/icon/component';
import { SidebarNavigationButtonProps } from './types';
import Styled from './styles';

const SidebarNavigationButton: React.FC<SidebarNavigationButtonProps> = ({
  panel,
  isOpened = false,
  iconName,
  label,
  hasNotification = false,
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

  const togglePanel = useCallback(() => {
    const willOpen = !isOpened;

    if (onToggle) {
      onToggle(willOpen);
    }

    layoutContextDispatch({
      type: ACTIONS.SET_SIDEBAR_CONTENT_IS_OPEN,
      value: willOpen,
    });

    layoutContextDispatch({
      type: ACTIONS.SET_SIDEBAR_CONTENT_PANEL,
      value: willOpen ? panel : PANELS.NONE,
    });
  }, [layoutContextDispatch, isOpened, panel, onToggle]);

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
        $disabled={isDisabled}
        $locked={isLocked}
      >
        {children}
        <Icon iconName={iconName} />
      </Styled.ListItem>
    </TooltipContainer>
  );
};

export default memo(SidebarNavigationButton);
