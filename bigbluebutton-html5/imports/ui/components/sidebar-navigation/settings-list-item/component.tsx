import React, {
  useState, memo, useCallback, useEffect,
} from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { useReactiveVar } from '@apollo/client';
import SettingsContainer from '/imports/ui/components/settings/container';
import SidebarNavigationButton from '/imports/ui/components/sidebar-navigation/sidebar-navigation-button/component';
import { SETTINGS_TABS } from '/imports/ui/components/settings/enums';
import roomModeHandoffVar, { roomModeHandoffTakerVar } from '/imports/ui/components/pre-flight/room-mode/handoff';
import { RoomModeChoice } from '/imports/ui/components/pre-flight/room-mode/settings';

const intlMessages = defineMessages({
  settingsLabel: {
    id: 'app.userList.settingsTitle',
    description: 'Title for the settings modal',
  },
});

const SettingsListItem = () => {
  const intl = useIntl();
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  // A pick the pre-flight could not apply opens the window on the Room modes
  // tab, pre-selected.
  const [roomModeHandoff, setRoomModeHandoff] = useState<RoomModeChoice | null>(null);
  const handoff = useReactiveVar(roomModeHandoffVar);

  // The notice offers the hand-off only while this button is there to take it.
  useEffect(() => {
    roomModeHandoffTakerVar(true);
    return () => {
      roomModeHandoffTakerVar(false);
    };
  }, []);

  useEffect(() => {
    if (!handoff) return;
    roomModeHandoffVar(null);
    setRoomModeHandoff(handoff);
    setIsSettingsModalOpen(true);
  }, [handoff]);

  const openSettingsModal = useCallback(() => {
    setRoomModeHandoff(null);
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
          selectedTab={roomModeHandoff ? SETTINGS_TABS.ROOM_MODE : undefined}
          initialRoomModeChange={roomModeHandoff
            ? { pick: roomModeHandoff.modeId, edits: roomModeHandoff.edits }
            : undefined}
        />
      )}
    </>
  );
};

export default memo(SettingsListItem);
