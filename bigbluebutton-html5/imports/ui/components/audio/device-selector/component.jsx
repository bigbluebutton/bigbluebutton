import React, { Component } from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import logger from '/imports/startup/client/logger';
import browserInfo from '/imports/utils/browserInfo';
import {
  defineMessages,
} from 'react-intl';
import Styled from './styles';

const propTypes = {
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  kind: PropTypes.oneOf(['audioinput', 'audiooutput']),
  onChange: PropTypes.func.isRequired,
  blocked: PropTypes.bool,
  deviceId: PropTypes.string,
};

const defaultProps = {
  kind: 'audioinput',
  blocked: false,
  deviceId: '',
};

const intlMessages = defineMessages({
  fallbackInputLabel: {
    id: 'app.audio.audioSettings.fallbackInputLabel',
    description: 'Audio input device label',
  },
  fallbackOutputLabel: {
    id: 'app.audio.audioSettings.fallbackOutputLabel',
    description: 'Audio output device label',
  },
  defaultOutputDeviceLabel: {
    id: 'app.audio.audioSettings.defaultOutputDeviceLabel',
    description: 'Default output device label',
  },
  findingDevicesLabel: {
    id: 'app.audio.audioSettings.findingDevicesLabel',
    description: 'Finding devices label',
  },
  noDeviceFoundLabel: {
    id: 'app.audio.noDeviceFound',
    description: 'No audio device found',
  },
});

class DeviceSelector extends Component {
  constructor(props) {
    super(props);

    this.handleSelectChange = this.handleSelectChange.bind(this);

    this.state = {
      devices: [],
      options: [],
    };
  }

  componentDidMount() {
    const { blocked } = this.props;

    if (!blocked) this.enumerate();
  }

  componentDidUpdate(prevProps) {
    const { blocked } = this.props;

    if (prevProps.blocked === true && blocked === false) this.enumerate();
  }

  handleEnumerateDevicesSuccess(deviceInfos) {
    const { kind } = this.props;

    const devices = deviceInfos.filter((d) => d.kind === kind);
    logger.info({
      logCode: 'audiodeviceselector_component_enumeratedevices_success',
      extraInfo: {
        deviceKind: kind,
        devices,
      },
    }, 'Success on enumerateDevices() for audio');
    this.setState({
      devices,
      options: devices.map((d, i) => ({
        label: d.label || this.getFallbackLabel(i),
        value: d.deviceId,
        key: _.uniqueId('device-option-'),
      })),
    });
  }

  handleSelectChange(event) {
    const { value } = event.target;
    const { onChange } = this.props;
    const { devices } = this.state;
    const selectedDevice = devices.find((d) => d.deviceId === value);
    onChange(selectedDevice.deviceId, selectedDevice, event);
  }

  getFallbackLabel(index) {
    const { intl, kind } = this.props;
    const label = kind === 'audioinput' ? intlMessages.fallbackInputLabel : intlMessages.fallbackOutputLabel;

    return intl.formatMessage(label, { 0: index });
  }

  enumerate() {
    const { kind } = this.props;

    navigator.mediaDevices
      .enumerateDevices()
      .then(this.handleEnumerateDevicesSuccess.bind(this))
      .catch(() => {
        logger.error({
          logCode: 'audiodeviceselector_component_enumeratedevices_error',
          extraInfo: {
            deviceKind: kind,
          },
        }, 'Error on enumerateDevices(): ');
      });
  }

  render() {
    const {
      intl, kind, blocked, deviceId,
    } = this.props;

    const { options } = this.state;

    let notFoundOption;

    if (blocked) {
      notFoundOption = <option value="finding">{intl.formatMessage(intlMessages.findingDevicesLabel)}</option>;
    } else if (kind === 'audiooutput' && !('setSinkId' in HTMLMediaElement.prototype)) {
      const defaultOutputDeviceLabel = intl.formatMessage(intlMessages.defaultOutputDeviceLabel);
      notFoundOption = <option value="not-found">{defaultOutputDeviceLabel}</option>;
    } else {
      const noDeviceFoundLabel = intl.formatMessage(intlMessages.noDeviceFoundLabel);
      notFoundOption = <option value="not-found">{noDeviceFoundLabel}</option>;
    }

    return (
      <Styled.Select
        value={deviceId}
        onChange={this.handleSelectChange}
        disabled={!options.length}
      >
        {
          options.length
            ? options.map((option) => (
              <option
                key={option.key}
                value={option.value}
              >
                {option.label}
              </option>
            ))
            : notFoundOption
        }
      </Styled.Select>
    );
  }
}

DeviceSelector.propTypes = propTypes;
DeviceSelector.defaultProps = defaultProps;

export default DeviceSelector;
