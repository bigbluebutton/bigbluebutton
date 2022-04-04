import React, { Component } from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import logger from '/imports/startup/client/logger';
import browserInfo from '/imports/utils/browserInfo';
import {
  defineMessages, injectIntl, FormattedMessage,
} from 'react-intl';

const propTypes = {
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  kind: PropTypes.oneOf(['audioinput', 'audiooutput']),
  onChange: PropTypes.func.isRequired,
  value: PropTypes.string,
};

const defaultProps = {
  kind: 'audioinput',
  value: undefined,
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
      value: props.value,
      devices: [],
      options: [],
    };
  }

  componentDidMount() {
    const { kind } = this.props;
    const handleEnumerateDevicesSuccess = (deviceInfos) => {
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
    };

    navigator.mediaDevices
      .enumerateDevices()
      .then(handleEnumerateDevicesSuccess)
      .catch(() => {
        logger.error({
          logCode: 'audiodeviceselector_component_enumeratedevices_error',
          extraInfo: {
            deviceKind: kind,
          },
        }, 'Error on enumerateDevices(): ');
      });
  }

  getFallbackLabel(index) {
    const { intl, kind } = this.props;
    const label = kind === 'audioinput' ? intlMessages.fallbackInputLabel : intlMessages.fallbackOutputLabel;

    return intl.formatMessage(label, { 0: index });
  }

  handleSelectChange(event) {
    const { value } = event.target;
    const { onChange } = this.props;
    const { devices } = this.state;
    this.setState({ value }, () => {
      const selectedDevice = devices.find((d) => d.deviceId === value);
      onChange(selectedDevice.deviceId, selectedDevice, event);
    });
  }

  render() {
    const {
      intl, kind, ...props
    } = this.props;

    const { options, value } = this.state;
    const { isSafari } = browserInfo;

    let notFoundOption;

    if (kind === 'audiooutput' && isSafari) {
      const defaultOutputDeviceLabel = intl.formatMessage(intlMessages.defaultOutputDeviceLabel);
      notFoundOption = <option value="not-found">{defaultOutputDeviceLabel}</option>;
    } else {
      const noDeviceFoundLabel = intl.formatMessage(intlMessages.noDeviceFoundLabel);
      notFoundOption = <option value="not-found">{noDeviceFoundLabel}</option>;
    }

    return (
      <select
        {...props}
        value={value}
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
      </select>
    );
  }
}

DeviceSelector.propTypes = propTypes;
DeviceSelector.defaultProps = defaultProps;

export default DeviceSelector;
