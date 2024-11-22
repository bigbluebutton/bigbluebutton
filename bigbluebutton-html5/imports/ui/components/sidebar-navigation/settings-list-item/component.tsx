import React from 'react';
import TooltipContainer from '/imports/ui/components/common/tooltip/container';
import { defineMessages, useIntl } from 'react-intl';
import Icon from '/imports/ui/components/common/icon/component';
import { PANELS, ACTIONS } from '../../layout/enums';
import { layoutDispatch, layoutSelectInput } from '/imports/ui/components/layout/context';
import { Input } from '/imports/ui/components/layout/layoutTypes';
import Styled from '../styles';

const intlMessages = defineMessages({
  settingsLabel: {
    id: 'app.userList.settingsTitle',
    description: 'Title for the settings panel',
  },
});

const SettingsListItem = () => {
  const CURRENT_PANEL = PANELS.SETTINGS;
  const intl = useIntl();
  const layoutContextDispatch = layoutDispatch();
  const sidebarContent = layoutSelectInput((i: Input) => i.sidebarContent);
  const { sidebarContentPanel } = sidebarContent;

  const toggleSettingsPanel = () => {
    layoutContextDispatch({
      type: ACTIONS.SET_SIDEBAR_CONTENT_IS_OPEN,
      value: sidebarContentPanel !== CURRENT_PANEL,
    });
    layoutContextDispatch({
      type: ACTIONS.SET_SIDEBAR_CONTENT_PANEL,
      value: sidebarContentPanel === CURRENT_PANEL
        ? PANELS.NONE
        : CURRENT_PANEL,
    });
  };

  const label = intl.formatMessage(intlMessages.settingsLabel);

  return (
    <TooltipContainer
      title={label}
      position="right"
    >
      <Styled.ListItem
        id="settings-toggle-button"
        aria-label={label}
        aria-describedby="settings"
        active={sidebarContentPanel === CURRENT_PANEL}
        role="button"
        tabIndex={0}
        data-test="settingsSidebarButton"
        onClick={toggleSettingsPanel}
        // @ts-ignore
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            toggleSettingsPanel();
          }
        }}
      >
        <Icon iconName="settings" />
      </Styled.ListItem>
    </TooltipContainer>
  );
};

export default SettingsListItem;
