/* eslint-disable jsx-a11y/no-access-key */
import React, { useCallback, memo } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import cx from 'classnames';
import KEYS from '/imports/utils/keys';
import resolveIcon from '/imports/ui/components/plugins/plugin-icon/utils';
import { layoutDispatch, layoutSelectInput } from '/imports/ui/components/layout/context';
import { Input } from '/imports/ui/components/layout/layoutTypes';
import { ACTIONS, PANELS } from '/imports/ui/components/layout/enums';
import TooltipContainer from '/imports/ui/components/common/tooltip/container';
import useShortcutTooltip from '/imports/ui/core/hooks/useShortcutTooltip';
import { SidebarNavigationButtonProps } from './types';
import Styled from './styles';
import { useIsMultiFunctionalModeEnabled } from '/imports/ui/services/features';

const intlMessages = defineMessages({
  newNotifications: {
    id: 'app.sidebarNavigation.button.newNotifications',
    description: 'Spoken state of a sidebar button that shows a notification badge',
  },
  ariaLabelWithState: {
    id: 'app.sidebarNavigation.button.ariaLabelWithState',
    description: 'Accessible name of a sidebar button with its notification state',
  },
  ariaLabelWithCount: {
    id: 'app.sidebarNavigation.button.ariaLabelWithCount',
    description: 'Accessible name of a sidebar button with the number shown on it',
  },
  ariaLabelWithCountAndState: {
    id: 'app.sidebarNavigation.button.ariaLabelWithCountAndState',
    description: 'Accessible name of a sidebar button with the number shown on it and its notification state',
  },
});

const SidebarNavigationButton: React.FC<SidebarNavigationButtonProps> = ({
  panel,
  isOpened = false,
  iconName,
  label,
  hasNotification = false,
  hasPrivateNotification = false,
  notificationLabel,
  badgeLabel,
  count,
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
  const intl = useIntl();
  const layoutContextDispatch = layoutDispatch();
  const sidebarContentAuxiliaryInput = layoutSelectInput((i: Input) => i.sidebarContentAuxiliary);
  const {
    sidebarContentPanel: sidebarContentPanelAuxiliary,
    isOpen: isAuxiliaryOpen,
  } = sidebarContentAuxiliaryInput;
  const isInAuxiliaryPanel = isAuxiliaryOpen && sidebarContentPanelAuxiliary === panel;
  const isMultiFunctionalModeEnabled = useIsMultiFunctionalModeEnabled();
  const withShortcut = useShortcutTooltip();

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

  // The badge is drawn with CSS and the count is replaced by aria-label, so both
  // have to be part of the accessible name.
  let state: string | undefined;
  if (badgeLabel) {
    state = badgeLabel;
  } else if (hasNotification || hasPrivateNotification) {
    state = notificationLabel ?? intl.formatMessage(intlMessages.newNotifications);
  }
  const hasCount = count !== undefined;
  let ariaLabel = label;
  if (hasCount && state) {
    ariaLabel = intl.formatMessage(intlMessages.ariaLabelWithCountAndState, { label, count, state });
  } else if (hasCount) {
    ariaLabel = intl.formatMessage(intlMessages.ariaLabelWithCount, { label, count });
  } else if (state) {
    ariaLabel = intl.formatMessage(intlMessages.ariaLabelWithState, { label, state });
  }

  return (
    <TooltipContainer
      title={withShortcut(label, accessKey)}
      position="right"
    >
      <Styled.ListItem
        id={id}
        className={cx('bbb-navigation__item', {
          'bbb-navigation__item--active': isOpened,
          'bbb-navigation__item--notification': hasNotification || hasPrivateNotification,
          'bbb-navigation__item--disabled': isDisabled,
          'bbb-navigation__item--locked': isLocked,
        })}
        accessKey={accessKey}
        aria-label={ariaLabel}
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
      >
        {resolveIcon(iconName)}
        {children}
      </Styled.ListItem>
    </TooltipContainer>
  );
};

export default memo(SidebarNavigationButton);
