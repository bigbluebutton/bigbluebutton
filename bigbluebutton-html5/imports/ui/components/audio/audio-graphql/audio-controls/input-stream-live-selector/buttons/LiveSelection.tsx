/* eslint-disable @typescript-eslint/ban-types */
import React, { useCallback, useContext } from 'react';
import deviceInfo from '/imports/utils/deviceInfo';
import { defineMessages, useIntl } from 'react-intl';
import { useShortcut } from '/imports/ui/core/hooks/useShortcut';
import BBBMenu from '/imports/ui/components/common/menu/component';
import { MenuSeparatorItemType, MenuOptionItemType } from '/imports/ui/components/common/menu/menuTypes';
import * as PluginSdk from 'bigbluebutton-html-plugin-sdk';
import { AudioSettingsDropdownItemType } from 'bigbluebutton-html-plugin-sdk/dist/cjs/extensible-areas/audio-settings-dropdown-item/enums';
import Styled from '../styles';
import {
  handleLeaveAudio,
  liveChangeInputDevice,
  liveChangeOutputDevice,
  notify,
  truncateDeviceName,
} from '../service';
import MuteToggle from './muteToggle';
import ListenOnly from './listenOnly';
import { PluginsContext } from '/imports/ui/components/components-data/plugin-context/context';

const AUDIO_INPUT = 'audioinput';
const AUDIO_OUTPUT = 'audiooutput';
const SET_SINK_ID_SUPPORTED = 'setSinkId' in HTMLMediaElement.prototype;

const intlMessages = defineMessages({
  defaultOutputDeviceLabel: {
    id: 'app.audio.audioSettings.defaultOutputDeviceLabel',
    description: 'Default output device label',
  },
  loading: {
    id: 'app.audio.loading',
    description: 'Loading audio dropdown item label',
  },
  noDeviceFound: {
    id: 'app.audio.noDeviceFound',
    description: 'No device found',
  },
  microphones: {
    id: 'app.audio.microphones',
    description: 'Input audio dropdown item label',
  },
  speakers: {
    id: 'app.audio.speakers',
    description: 'Output audio dropdown item label',
  },
  leaveAudio: {
    id: 'app.audio.leaveAudio',
    description: 'Leave audio dropdown item label',
  },
  changeAudioDevice: {
    id: 'app.audio.changeAudioDevice',
    description: 'Change audio device button label',
  },
  deviceChangeFailed: {
    id: 'app.audioNotification.deviceChangeFailed',
    description: 'Device change failed',
  },
  fallbackInputLabel: {
    id: 'app.audio.audioSettings.fallbackInputLabel',
    description: 'Audio input device label',
  },
  fallbackOutputLabel: {
    id: 'app.audio.audioSettings.fallbackOutputLabel',
    description: 'Audio output device label',
  },
  fallbackNoPermissionLabel: {
    id: 'app.audio.audioSettings.fallbackNoPermission',
    description: 'No permission to access audio devices label',
  },
  audioSettingsTitle: {
    id: 'app.audio.audioSettings.titleLabel',
    description: 'Audio settings button label',
  },
  noMicListenOnlyLabel: {
    id: 'app.audio.audioSettings.noMicListenOnly',
    description: 'No microphone (listen only) label',
  },
});

interface MuteToggleProps {
  talking: boolean;
  muted: boolean;
  disabled: boolean;
  isAudioLocked: boolean;
  toggleMuteMicrophone: (muted: boolean, toggleVoice: (userId: string, muted: boolean) => void) => void;
  away: boolean;
}

interface LiveSelectionProps extends MuteToggleProps {
  listenOnly: boolean;
  inputDevices: MediaDeviceInfo[];
  outputDevices: MediaDeviceInfo[];
  inputDeviceId: string;
  outputDeviceId: string;
  meetingIsBreakout: boolean;
  away: boolean;
  openAudioSettings: (props?: { unmuteOnExit?: boolean }) => void;
  supportsTransparentListenOnly: boolean;
}

export const LiveSelection: React.FC<LiveSelectionProps> = ({
  listenOnly,
  inputDevices,
  outputDevices,
  inputDeviceId,
  outputDeviceId,
  meetingIsBreakout,
  talking,
  muted,
  disabled,
  isAudioLocked,
  toggleMuteMicrophone,
  away,
  openAudioSettings,
  supportsTransparentListenOnly,
}) => {
  const intl = useIntl();

  const leaveAudioShourtcut = useShortcut('leaveAudio');

  const {
    pluginsExtensibleAreasAggregatedState,
  } = useContext(PluginsContext);
  let audioSettingsDropdownItems = [] as PluginSdk.AudioSettingsDropdownInterface[];
  if (pluginsExtensibleAreasAggregatedState.audioSettingsDropdownItems) {
    audioSettingsDropdownItems = [
      ...pluginsExtensibleAreasAggregatedState.audioSettingsDropdownItems,
    ];
  }

  const getFallbackLabel = (device: MediaDeviceInfo, index: number) => {
    const baseLabel = device?.kind === AUDIO_OUTPUT
      ? intlMessages.fallbackOutputLabel
      : intlMessages.fallbackInputLabel;
    let label = intl.formatMessage(baseLabel, { index });

    if (!device?.deviceId) {
      label = `${label} ${intl.formatMessage(intlMessages.fallbackNoPermissionLabel)}`;
    }

    return label;
  };

  const shouldTreatAsMicrophone = () => !listenOnly || supportsTransparentListenOnly;

  const renderDeviceList = useCallback((
    deviceKind: string,
    list: MediaDeviceInfo[],
    callback: Function,
    title: string,
    currentDeviceId: string,
  ) => {
    const listLength = list ? list.length : -1;
    const listTitle = [
      {
        key: `audioDeviceList-${deviceKind}`,
        label: title,
        icon: (deviceKind === 'audioinput') ? 'unmute' : 'listen',
        disabled: true,
        customStyles: Styled.DisabledLabel,
        onClick: () => {},
      } as MenuOptionItemType,
    ];

    let deviceList: MenuOptionItemType[] = [];

    if (listLength > 0) {
      deviceList = list.map((device, index) => {
        // If the device is the first in the list and there's no
        // currentDeviceId, the user hasn't explicitly selected a device and we
        // couldn't infer it. In this case, consider the first device as the
        // system default - as specified in "Media Capture and Streams API",
        // Section 9.2, enumerateDevices algorithm.
        const isCurrentDevice = (device.deviceId === currentDeviceId)
          || (!currentDeviceId && index === 0);

        return {
          key: `${device.deviceId}-${deviceKind}`,
          dataTest: `${deviceKind}-${index + 1}`,
          label: truncateDeviceName(device.label || getFallbackLabel(device, index + 1)),
          customStyles: isCurrentDevice ? Styled.SelectedLabel : Styled.DeviceLabel,
          iconStyles: isCurrentDevice ? Styled.SelectedLabelIcon : null,
          iconRight: isCurrentDevice ? 'check' : null,
          onClick: () => onDeviceListClick(device.deviceId, deviceKind, callback),
        } as MenuOptionItemType;
      });
    } else if (deviceKind === AUDIO_OUTPUT && !SET_SINK_ID_SUPPORTED && listLength === 0) {
      // If the browser doesn't support setSinkId, show the chosen output device
      // as a placeholder Default - like it's done in audio/device-selector
      deviceList = [
        {
          key: `defaultDeviceKey-${deviceKind}`,
          label: intl.formatMessage(intlMessages.defaultOutputDeviceLabel),
          customStyles: Styled.SelectedLabel,
          iconRight: 'check',
          disabled: true,
        } as MenuOptionItemType,
      ];
    } else {
      deviceList = [
        {
          key: `noDeviceFoundKey-${deviceKind}-`,
          label: listLength < 0
            ? intl.formatMessage(intlMessages.loading)
            : intl.formatMessage(intlMessages.noDeviceFound),
        } as MenuOptionItemType,
      ];
    }

    if (deviceKind === AUDIO_INPUT && supportsTransparentListenOnly) {
      // "None" option for audio input devices - aka listen-only
      const listenOnly = deviceKind === AUDIO_INPUT
        && currentDeviceId === 'listen-only';

      deviceList.push({
        key: `listenOnly-${deviceKind}`,
        dataTest: `${deviceKind}-listenOnly`,
        label: intl.formatMessage(intlMessages.noMicListenOnlyLabel),
        customStyles: listenOnly ? Styled.SelectedLabel : Styled.DeviceLabel,
        iconStyles: listenOnly ? Styled.SelectedLabelIcon : null,
        iconRight: listenOnly ? 'check' : null,
        onClick: () => onDeviceListClick('listen-only', deviceKind, callback),
      } as MenuOptionItemType);
    }

    return listTitle.concat(deviceList);
  }, []);

  const onDeviceListClick = useCallback((deviceId: string, deviceKind: string, callback: Function) => {
    if (!deviceId) {
      // If there's no deviceId in an audio input device, it means
      // the user doesn't have permission to access it. If we support
      // transparent listen-only, fire the mount AudioSettings modal to
      // acquire permission and let the user configure their stuff.
      if (deviceKind === AUDIO_INPUT && supportsTransparentListenOnly) {
        openAudioSettings({ unmuteOnExit: true });
      }

      return;
    }

    if (!deviceId) return;
    if (deviceKind === AUDIO_INPUT) {
      callback(deviceId).catch(() => {
        notify(intl.formatMessage(intlMessages.deviceChangeFailed), true);
      });
    } else {
      callback(deviceId, true).catch(() => {
        notify(intl.formatMessage(intlMessages.deviceChangeFailed), true);
      });
    }
  }, []);

  const inputDeviceList = shouldTreatAsMicrophone()
    ? renderDeviceList(
      AUDIO_INPUT,
      inputDevices,
      liveChangeInputDevice,
      intl.formatMessage(intlMessages.microphones),
      inputDeviceId,
    ) : [];

  const outputDeviceList = renderDeviceList(
    AUDIO_OUTPUT,
    outputDevices,
    liveChangeOutputDevice,
    intl.formatMessage(intlMessages.speakers),
    outputDeviceId,
  );

  const audioSettingsOption = {
    icon: 'settings',
    label: intl.formatMessage(intlMessages.audioSettingsTitle),
    key: 'audioSettingsOption',
    dataTest: 'input-selector-audio-settings',
    customStyles: Styled.AudioSettingsOption,
    dividerTop: true,
    onClick: () => openAudioSettings(),
  } as MenuOptionItemType;

  const leaveAudioOption = {
    icon: 'logout',
    label: intl.formatMessage(intlMessages.leaveAudio),
    key: 'leaveAudioOption',
    dataTest: 'leaveAudio',
    customStyles: Styled.DangerColor,
    onClick: () => handleLeaveAudio(meetingIsBreakout),
  };
  const dropdownListComplete = inputDeviceList
    .concat({
      key: 'separator-01',
      isSeparator: true,
    } as MenuSeparatorItemType)
    .concat(outputDeviceList)
    .concat({
      key: 'separator-02',
      isSeparator: true,
    } as MenuSeparatorItemType);
  if (shouldTreatAsMicrophone()) dropdownListComplete.push(audioSettingsOption);
  dropdownListComplete.push(leaveAudioOption);

  audioSettingsDropdownItems.forEach((audioSettingsDropdownItem:
    PluginSdk.AudioSettingsDropdownInterface) => {
    switch (audioSettingsDropdownItem.type) {
      case AudioSettingsDropdownItemType.OPTION: {
        const audioSettingsDropdownOption = audioSettingsDropdownItem as PluginSdk.AudioSettingsDropdownOption;
        dropdownListComplete.push({
          label: audioSettingsDropdownOption.label,
          iconRight: audioSettingsDropdownOption.icon,
          onClick: audioSettingsDropdownOption.onClick,
          key: audioSettingsDropdownOption.id,
        });
        break;
      }
      case AudioSettingsDropdownItemType.SEPARATOR: {
        const audioSettingsDropdownSeparator = audioSettingsDropdownItem as PluginSdk.AudioSettingsDropdownOption;
        dropdownListComplete.push({
          isSeparator: true,
          key: audioSettingsDropdownSeparator.id,
        } as MenuSeparatorItemType);
        break;
      }
      default:
        break;
    }
  });

  const customStyles = { top: '-1rem' };
  const { isMobile } = deviceInfo;
  const noInputDevice = inputDeviceId === 'listen-only';

  return (
    <>
      {shouldTreatAsMicrophone() ? (
        // eslint-disable-next-line jsx-a11y/no-access-key
        <span
          style={{ display: 'none' }}
          accessKey={leaveAudioShourtcut}
          onClick={() => handleLeaveAudio(meetingIsBreakout)}
          aria-hidden="true"
        />
      ) : null}
      {(shouldTreatAsMicrophone() && isMobile) && (
        <MuteToggle
          talking={talking}
          muted={muted}
          disabled={disabled || isAudioLocked}
          isAudioLocked={isAudioLocked}
          toggleMuteMicrophone={toggleMuteMicrophone}
          away={away}
          noInputDevice={noInputDevice}
          openAudioSettings={openAudioSettings}
        />
      )}
      <BBBMenu
        customStyles={!isMobile ? customStyles : null}
        trigger={(
          <>
            {shouldTreatAsMicrophone() && !isMobile
              ? (
                <MuteToggle
                  talking={talking}
                  muted={muted}
                  disabled={disabled || isAudioLocked}
                  isAudioLocked={isAudioLocked}
                  toggleMuteMicrophone={toggleMuteMicrophone}
                  away={away}
                  noInputDevice={noInputDevice}
                  openAudioSettings={openAudioSettings}
                />
              )
              : (
                <ListenOnly
                  listenOnly={listenOnly}
                  handleLeaveAudio={handleLeaveAudio}
                  meetingIsBreakout={meetingIsBreakout}
                  actAsDeviceSelector={isMobile}
                />
              )}
            <Styled.AudioDropdown
              data-test="audioDropdownMenu"
              emoji="device_list_selector"
              label={intl.formatMessage(intlMessages.changeAudioDevice)}
              hideLabel
              tabIndex={0}
              rotate
            />
          </>
        )}
        actions={!isAudioLocked ? dropdownListComplete : [leaveAudioOption]}
        opts={{
          id: 'audio-selector-dropdown-menu',
          keepMounted: true,
          transitionDuration: 0,
          elevation: 3,
          getcontentanchorel: null,
          fullwidth: 'true',
          anchorOrigin: { vertical: 'top', horizontal: 'center' },
          transformOrigin: { vertical: 'bottom', horizontal: 'center' },
        }}
      />
    </>
  );
};

export default LiveSelection;
