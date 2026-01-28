import React, { useState, memo, useCallback } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import SettingsContainer from '/imports/ui/components/settings/container';
import SidebarNavigationButton from '/imports/ui/components/sidebar-navigation/sidebar-navigation-button/component';

const intlMessages = defineMessages({
  settingsLabel: {
    id: 'app.userList.settingsTitle',
    description: 'Title for the settings modal',
  },
});

const SettingsListItem = () => {
  const intl = useIntl();
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  const openSettingsModal = useCallback(() => {
    setIsSettingsModalOpen(true);
  }, [setIsSettingsModalOpen]);

  const label = intl.formatMessage(intlMessages.settingsLabel);

  return (
    <>
      <SidebarNavigationButton
        isOpened={isSettingsModalOpen}
        iconName="settings"
        label={label}
        id="settings-toggle-button"
        ariaDescribedBy="settings"
        dataTest="settingsSidebarButton"
        onClick={openSettingsModal}
      />
      {isSettingsModalOpen && (
        <SettingsContainer
          isOpen={isSettingsModalOpen}
          setIsOpen={setIsSettingsModalOpen}
        />
      )}
    </>
  );
};

export default memo(SettingsListItem);
