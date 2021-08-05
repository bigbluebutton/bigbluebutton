import React, { Component } from 'react';
import logger from '/imports/startup/client/logger';
import Auth from '/imports/ui/services/auth';
import { defineMessages, injectIntl } from 'react-intl';
import PropTypes from 'prop-types';
import Button from '/imports/ui/components/button/component';
import ButtonEmoji from '/imports/ui/components/button/button-emoji/ButtonEmoji';
import Dropdown from '/imports/ui/components/dropdown/component';
import withShortcutHelper from '/imports/ui/components/shortcut-help/service';
import cx from 'classnames';

import { styles } from '../styles';

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

  renderDeviceList(deviceKind, list, callback, title, currentDeviceId,
    renderSeparator = true) {
    const {
      intl,
    } = this.props;

    const listLenght = list ? list.length : -1;

    const listTitle = [
      <Dropdown.DropdownListTitle key={`audioDeviceList-${deviceKind}`}>
        {title}
      </Dropdown.DropdownListTitle>,
    ];

    const deviceList = (listLenght > 0)
      ? list.map((device) => (
        <Dropdown.DropdownListItem
          key={`${device.deviceId}-${deviceKind}`}
          label={InputStreamLiveSelector.truncateDeviceName(device.label)}
          onClick={() => this.onDeviceListClick(device.deviceId, deviceKind,
            callback)}
          className={(device.deviceId === currentDeviceId)
            ? styles.selectedDevice : ''}
        />
      ))
      : [
        <Dropdown.DropdownListItem
          key={`noDeviceFoundKey-${deviceKind}-`}
          className={styles.disableDeviceSelection}
          label={
            listLenght < 0
              ? intl.formatMessage(intlMessages.loading)
              : intl.formatMessage(intlMessages.noDeviceFound)
          }
        />,
      ];

    const listSeparator = [
      <Dropdown.DropdownListSeparator key={`audioDeviceListSeparator-${deviceKind}`} />,
    ];

    return listTitle.concat(deviceList).concat(
      renderSeparator ? listSeparator : [],
    );
  }

  render() {
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
      shortcuts,
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

    const dropdownListComplete = inputDeviceList.concat(outputDeviceList);

    return (
      <Dropdown>
        <Dropdown.DropdownTrigger>
          <Button
            aria-label={intl.formatMessage(intlMessages.leaveAudio)}
            label={intl.formatMessage(intlMessages.leaveAudio)}
            accessKey={shortcuts.leaveaudio}
            hideLabel
            color="primary"
            icon={isListenOnly ? 'listen' : 'audio_on'}
            size="lg"
            circle
            onClick={() => handleLeaveAudio()}
          >
            <ButtonEmoji
              emoji="device_list_selector"
              label={intl.formatMessage(intlMessages.changeAudioDevice)}
            />
          </Button>
        </Dropdown.DropdownTrigger>
        <Dropdown.DropdownContent className={styles.dropdownContent}>
          <Dropdown.DropdownList className={cx(styles.scrollableList, styles.dropdownListContainer)}>
            {dropdownListComplete}
          </Dropdown.DropdownList>
        </Dropdown.DropdownContent>
      </Dropdown>
    );
  }
}

InputStreamLiveSelector.propTypes = propTypes;

export default withShortcutHelper(injectIntl(InputStreamLiveSelector),
  ['leaveAudio']);
