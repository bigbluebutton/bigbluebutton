import React, { Component } from 'react';
import logger from '/imports/startup/client/logger';
import Auth from '/imports/ui/services/auth';
import Settings from '/imports/ui/services/settings';
import { defineMessages, injectIntl } from 'react-intl';
import PropTypes from 'prop-types';
import Button from '/imports/ui/components/common/button/component';
import BBBMenu from '/imports/ui/components/common/menu/component';
import withShortcutHelper from '/imports/ui/components/shortcut-help/service';

import Styled from './styles';

const AUDIO_INPUT = 'audioinput';
const AUDIO_OUTPUT = 'audiooutput';
const DEFAULT_DEVICE = 'default';
const DEVICE_LABEL_MAX_LENGTH = 40;

const intlMessages = defineMessages({
  changeAudioDevice: {
    id: 'app.audio.changeAudioDevice',
    description: 'Change audio device button label',
  },
  leaveAudio: {
    id: 'app.audio.leaveAudio',
    description: 'Leave audio dropdown item label',
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
  muteAudio: {
    id: 'app.actionsBar.muteLabel',
    description: 'Mute audio button label',
  },
  unmuteAudio: {
    id: 'app.actionsBar.unmuteLabel',
    description: 'Unmute audio button label',
  },
});

const propTypes = {
  liveChangeInputDevice: PropTypes.func.isRequired,
  handleLeaveAudio: PropTypes.func.isRequired,
  liveChangeOutputDevice: PropTypes.func.isRequired,
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  shortcuts: PropTypes.objectOf(PropTypes.string).isRequired,
  currentInputDeviceId: PropTypes.string.isRequired,
  currentOutputDeviceId: PropTypes.string.isRequired,
  isListenOnly: PropTypes.bool.isRequired,
  isAudioConnected: PropTypes.bool.isRequired,
  _enableDynamicDeviceSelection: PropTypes.bool.isRequired,
  handleToggleMuteMicrophone: PropTypes.func.isRequired,
  muted: PropTypes.bool.isRequired,
  disable: PropTypes.bool.isRequired,
  talking: PropTypes.bool,
};

const defaultProps = {
  talking: false,
};

class InputStreamLiveSelector extends Component {
  static truncateDeviceName(deviceName) {
    if (deviceName && (deviceName.length <= DEVICE_LABEL_MAX_LENGTH)) {
      return deviceName;
    }
    return `${deviceName.substring(0, DEVICE_LABEL_MAX_LENGTH - 3)}...`;
  }

  constructor(props) {
    super(props);
    this.updateDeviceList = this.updateDeviceList.bind(this);
    this.renderDeviceList = this.renderDeviceList.bind(this);
    this.renderListenOnlyButton = this.renderListenOnlyButton.bind(this);
    this.renderMuteToggleButton = this.renderMuteToggleButton.bind(this);
    this.renderButtonsWithSelectorDevice = this.renderButtonsWithSelectorDevice.bind(this);
    this.renderButtonsWithoutSelectorDevice = this.renderButtonsWithoutSelectorDevice.bind(this);
    this.state = {
      audioInputDevices: null,
      audioOutputDevices: null,
      selectedInputDeviceId: null,
      selectedOutputDeviceId: null,
    };
  }

  componentDidMount() {
    this.updateDeviceList().then(() => {
      navigator.mediaDevices
        .addEventListener('devicechange', this.updateDeviceList);
      this.setCurrentDevices();
    });
  }

  componentWillUnmount() {
    navigator.mediaDevices.removeEventListener('devicechange',
      this.updateDeviceList);
  }

  onDeviceListClick(deviceId, deviceKind, callback) {
    if (!deviceId) return;

    if (deviceKind === AUDIO_INPUT) {
      this.setState({ selectedInputDeviceId: deviceId });
      callback(deviceId);
    } else {
      this.setState({ selectedOutputDeviceId: deviceId });
      callback(deviceId, true);
    }
  }

  setCurrentDevices() {
    const {
      currentInputDeviceId,
      currentOutputDeviceId,
    } = this.props;

    const {
      audioInputDevices,
      audioOutputDevices,
    } = this.state;

    if (!audioInputDevices
      || !audioInputDevices[0]
      || !audioOutputDevices
      || !audioOutputDevices[0]) return;

    const _currentInputDeviceId = audioInputDevices.find(
      (d) => d.deviceId === currentInputDeviceId,
    ) ? currentInputDeviceId : audioInputDevices[0].deviceId;

    const _currentOutputDeviceId = audioOutputDevices.find(
      (d) => d.deviceId === currentOutputDeviceId,
    ) ? currentOutputDeviceId : audioOutputDevices[0].deviceId;

    this.setState({
      selectedInputDeviceId: _currentInputDeviceId,
      selectedOutputDeviceId: _currentOutputDeviceId,
    });
  }

  fallbackInputDevice(fallbackDevice) {
    if (!fallbackDevice || !fallbackDevice.deviceId) return;

    const {
      liveChangeInputDevice,
    } = this.props;

    logger.info({
      logCode: 'audio_device_live_selector',
      extraInfo: {
        userId: Auth.userID,
        meetingId: Auth.meetingID,
      },
    }, 'Current input device was removed. Fallback to default device');
    this.setState({ selectedInputDeviceId: fallbackDevice.deviceId });
    liveChangeInputDevice(fallbackDevice.deviceId);
  }

  fallbackOutputDevice(fallbackDevice) {
    if (!fallbackDevice || !fallbackDevice.deviceId) return;

    const {
      liveChangeOutputDevice,
    } = this.props;

    logger.info({
      logCode: 'audio_device_live_selector',
      extraInfo: {
        userId: Auth.userID,
        meetingId: Auth.meetingID,
      },
    }, 'Current output device was removed. Fallback to default device');
    this.setState({ selectedOutputDeviceId: fallbackDevice.deviceId });
    liveChangeOutputDevice(fallbackDevice.deviceId, true);
  }

  updateRemovedDevices(audioInputDevices, audioOutputDevices) {
    const {
      selectedInputDeviceId,
      selectedOutputDeviceId,
    } = this.state;

    if (selectedInputDeviceId
      && (selectedInputDeviceId !== DEFAULT_DEVICE)
      && !audioInputDevices.find((d) => d.deviceId === selectedInputDeviceId)) {
      this.fallbackInputDevice(audioInputDevices[0]);
    }

    if (selectedOutputDeviceId
      && (selectedOutputDeviceId !== DEFAULT_DEVICE)
      && !audioOutputDevices.find((d) => d.deviceId === selectedOutputDeviceId)) {
      this.fallbackOutputDevice(audioOutputDevices[0]);
    }
  }

  updateDeviceList() {
    const {
      isAudioConnected,
    } = this.props;

    return navigator.mediaDevices.enumerateDevices()
      .then((devices) => {
        const audioInputDevices = devices.filter((i) => i.kind === AUDIO_INPUT);
        const audioOutputDevices = devices.filter((i) => i.kind === AUDIO_OUTPUT);

        this.setState({
          audioInputDevices,
          audioOutputDevices,
        });

        if (isAudioConnected) {
          this.updateRemovedDevices(audioInputDevices, audioOutputDevices);
        }
      });
  }

  renderDeviceList(deviceKind, list, callback, title, currentDeviceId) {
    const {
      intl,
    } = this.props;
    const listLength = list ? list.length : -1;
    const listTitle = [
      {
        key: `audioDeviceList-${deviceKind}`,
        label: title,
        iconRight: (deviceKind === 'audioinput') ? 'unmute' : 'volume_level_2',
        disabled: true,
        customStyles: Styled.DisabledLabel,
        divider: true,
      },
    ];

    const deviceList = (listLength > 0)
      ? list.map((device) => (
        {
          key: `${device.deviceId}-${deviceKind}`,
          label: InputStreamLiveSelector.truncateDeviceName(device.label),
          customStyles: (device.deviceId === currentDeviceId) && Styled.SelectedLabel,
          iconRight: (device.deviceId === currentDeviceId) ? 'check' : null,
          onClick: () => this.onDeviceListClick(device.deviceId, deviceKind, callback),
        }
      ))
      : [
        {
          key: `noDeviceFoundKey-${deviceKind}-`,
          label: listLength < 0
            ? intl.formatMessage(intlMessages.loading)
            : intl.formatMessage(intlMessages.noDeviceFound),
        },
      ];
    return listTitle.concat(deviceList);
  }

  renderMuteToggleButton() {
    const {
      intl,
      shortcuts,
      handleToggleMuteMicrophone,
      muted,
      disable,
      talking,
    } = this.props;

    const label = muted ? intl.formatMessage(intlMessages.unmuteAudio)
      : intl.formatMessage(intlMessages.muteAudio);

    const { animations } = Settings.application;

    return (
      <Styled.MuteToggleButton
        onClick={(e) => {
          e.stopPropagation();
          handleToggleMuteMicrophone();
        }}
        disabled={disable}
        hideLabel
        label={label}
        aria-label={label}
        color={!muted ? 'primary' : 'default'}
        ghost={muted}
        icon={muted ? 'mute' : 'unmute'}
        size="lg"
        circle
        accessKey={shortcuts.togglemute}
        talking={talking || undefined}
        animations={animations}
        data-test="toggleMicrophoneButton"
      />
    );
  }

  renderListenOnlyButton() {
    const {
      handleLeaveAudio,
      intl,
      shortcuts,
      isListenOnly,
    } = this.props;

    return (
      <Button
        aria-label={intl.formatMessage(intlMessages.leaveAudio)}
        label={intl.formatMessage(intlMessages.leaveAudio)}
        accessKey={shortcuts.leaveaudio}
        data-test="leaveAudio"
        hideLabel
        color="primary"
        icon={isListenOnly ? 'listen' : 'volume_level_2'}
        size="lg"
        circle
        onClick={(e) => {
          e.stopPropagation();
          handleLeaveAudio();
        }}
      />
    );
  }

  renderButtonsWithSelectorDevice() {
    const {
      audioInputDevices,
      audioOutputDevices,
      selectedInputDeviceId,
      selectedOutputDeviceId,
    } = this.state;

    const {
      liveChangeInputDevice,
      handleLeaveAudio,
      liveChangeOutputDevice,
      intl,
      currentInputDeviceId,
      currentOutputDeviceId,
      isListenOnly,
    } = this.props;

    const inputDeviceList = !isListenOnly
      ? this.renderDeviceList(
        AUDIO_INPUT,
        audioInputDevices,
        liveChangeInputDevice,
        intl.formatMessage(intlMessages.microphones),
        selectedInputDeviceId || currentInputDeviceId,
      ) : [];

    const outputDeviceList = this.renderDeviceList(
      AUDIO_OUTPUT,
      audioOutputDevices,
      liveChangeOutputDevice,
      intl.formatMessage(intlMessages.speakers),
      selectedOutputDeviceId || currentOutputDeviceId,
      false,
    );

    const leaveAudioOption = {
      iconRight: 'logout',
      label: intl.formatMessage(intlMessages.leaveAudio),
      key: 'leaveAudioOption',
      customStyles: Styled.DangerColor,
      dividerTop: true,
      onClick: () => handleLeaveAudio(),
    };

    const dropdownListComplete = inputDeviceList.concat(outputDeviceList).concat(leaveAudioOption);

    return (
      <BBBMenu
        trigger={(
          <>
            {isListenOnly
              ? this.renderListenOnlyButton()
              : this.renderMuteToggleButton()}
            <Styled.AudioDropdown
              emoji="device_list_selector"
              label={intl.formatMessage(intlMessages.changeAudioDevice)}
              hideLabel
              tabIndex={0}
            />
          </>
        )}
        actions={dropdownListComplete}
      />
    );
  }

  renderButtonsWithoutSelectorDevice() {
    const { isListenOnly } = this.props;
    return isListenOnly
      ? this.renderListenOnlyButton()
      : (
        <>
          {this.renderMuteToggleButton()}
          {this.renderListenOnlyButton()}
        </>
      );
  }

  render() {
    const { _enableDynamicDeviceSelection } = this.props;

    return _enableDynamicDeviceSelection
      ? this.renderButtonsWithSelectorDevice()
      : this.renderButtonsWithoutSelectorDevice();
  }
}

InputStreamLiveSelector.propTypes = propTypes;
InputStreamLiveSelector.defaultProps = defaultProps;

export default withShortcutHelper(injectIntl(InputStreamLiveSelector),
  ['leaveAudio']);
