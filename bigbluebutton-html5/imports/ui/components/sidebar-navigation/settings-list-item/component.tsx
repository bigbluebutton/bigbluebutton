import React, { useState } from 'react';
import TooltipContainer from '/imports/ui/components/common/tooltip/container';
import { defineMessages, useIntl } from 'react-intl';
import Icon from '/imports/ui/components/common/icon/component';
import Styled from '../styles';
import SettingsContainer from '/imports/ui/components/settings/container';

const intlMessages = defineMessages({
  settingsLabel: {
    id: 'app.userList.settingsTitle',
    description: 'Title for the settings modal',
  },
});

const SettingsListItem = () => {
  const intl = useIntl();
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  const openSettingsModal = () => {
    setIsSettingsModalOpen(true);
  };

  const label = intl.formatMessage(intlMessages.settingsLabel);

  return (
    <>
      <TooltipContainer title={label} position="right">
        <Styled.ListItem
          id="settings-toggle-button"
          aria-label={label}
          aria-describedby="settings"
          role="button"
          tabIndex={0}
          data-test="settingsSidebarButton"
          onClick={openSettingsModal}
          // @ts-ignore
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              openSettingsModal();
            }
          }}
        >
          <Icon iconName="settings" />
        </Styled.ListItem>
      </TooltipContainer>

      {isSettingsModalOpen && (
        <SettingsContainer
          isOpen={isSettingsModalOpen}
          setIsOpen={setIsSettingsModalOpen}
        />
      )}
    </>
  );
};

export default SettingsListItem;
