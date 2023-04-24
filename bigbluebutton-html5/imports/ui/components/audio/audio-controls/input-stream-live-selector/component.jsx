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
const SET_SINK_ID_SUPPORTED = 'setSinkId' in HTMLMediaElement.prototype;

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
  deviceChangeFailed: {
    id: 'app.audioNotification.deviceChangeFailed',
    description: 'Device change failed',
  },
  defaultOutputDeviceLabel: {
    id: 'app.audio.audioSettings.defaultOutputDeviceLabel',
    description: 'Default output device label',
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
  notify: PropTypes.func.isRequired,
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

    const { intl, notify } = this.props;

    if (deviceKind === AUDIO_INPUT) {
      callback(deviceId).then(() => {
        this.setState({ selectedInputDeviceId: deviceId });
      }).catch((error) => {
        notify(intl.formatMessage(intlMessages.deviceChangeFailed), true);
      });
    } else {
      callback(deviceId, true).then(() => {
        this.setState({ selectedOutputDeviceId: deviceId });
      }).catch((error) => {
        notify(intl.formatMessage(intlMessages.deviceChangeFailed), true);
      });
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
    liveChangeInputDevice(fallbackDevice.deviceId).then(() => {
      this.setState({ selectedInputDeviceId: fallbackDevice.deviceId });
    }).catch((error) => {
      notify(intl.formatMessage(intlMessages.deviceChangeFailed), true);
    });
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
    liveChangeOutputDevice(fallbackDevice.deviceId, true).then(() => {
      this.setState({ selectedOutputDeviceId: fallbackDevice.deviceId });
    }).catch((error) => {
      notify(intl.formatMessage(intlMessages.deviceChangeFailed), true);
    });
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

    let deviceList = [];

    if (listLength > 0) {
      deviceList = list.map((device, index) => (
        {
          key: `${device.deviceId}-${deviceKind}`,
          dataTest: `${deviceKind}-${index + 1}`,
          label: InputStreamLiveSelector.truncateDeviceName(device.label),
          customStyles: (device.deviceId === currentDeviceId) && Styled.SelectedLabel,
          iconRight: (device.deviceId === currentDeviceId) ? 'check' : null,
          onClick: () => this.onDeviceListClick(device.deviceId, deviceKind, callback),
        }
      ));
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
        },
      ];
    } else {
      deviceList = [
        {
          key: `noDeviceFoundKey-${deviceKind}-`,
          label: listLength < 0
            ? intl.formatMessage(intlMessages.loading)
            : intl.formatMessage(intlMessages.noDeviceFound),
        },
      ];
    }

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
        $talking={talking || undefined}
        animations={animations}
        data-test={muted ? 'unmuteMicButton' : 'muteMicButton'}
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
        data-test="leaveListenOnly"
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
      shortcuts,
      isMobile,
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
      icon: 'logout',
      label: intl.formatMessage(intlMessages.leaveAudio),
      key: 'leaveAudioOption',
      dataTest: 'leaveAudio',
      customStyles: Styled.DangerColor,
      dividerTop: true,
      onClick: () => handleLeaveAudio(),
    };

    const dropdownListComplete = inputDeviceList.concat(outputDeviceList).concat(leaveAudioOption);
    const customStyles = { top: '-1rem' };

    return (
      <>
        {!isListenOnly ? (
          <span
            style={{ display: 'none' }}
            accessKey={shortcuts.leaveaudio}
            onClick={() => handleLeaveAudio()}
            aria-hidden="true"
          />
        ) : null}
        <BBBMenu
          customStyles={!isMobile ? customStyles : null}
          trigger={(
            <>
              {isListenOnly
                ? this.renderListenOnlyButton()
                : this.renderMuteToggleButton()}
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
          actions={dropdownListComplete}
          opts={{
            id: 'audio-selector-dropdown-menu',
            keepMounted: true,
            transitionDuration: 0,
            elevation: 3,
            getContentAnchorEl: null,
            fullwidth: 'true',
            anchorOrigin: { vertical: 'top', horizontal: 'center' },
            transformOrigin: { vertical: 'bottom', horizontal: 'center'},
          }}
        />
      </>
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
  ['leaveAudio', 'toggleMute']);
