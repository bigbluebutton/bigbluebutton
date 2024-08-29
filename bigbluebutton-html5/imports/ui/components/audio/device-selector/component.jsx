import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  defineMessages,
} from 'react-intl';
import Styled from './styles';
import { uniqueId } from '/imports/utils/string-utils';

const propTypes = {
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  kind: PropTypes.oneOf(['audioinput', 'audiooutput']),
  onChange: PropTypes.func.isRequired,
  blocked: PropTypes.bool,
  deviceId: PropTypes.string,
  devices: PropTypes.arrayOf(PropTypes.shape({
    deviceId: PropTypes.string,
    label: PropTypes.string,
  })),
  supportsTransparentListenOnly: PropTypes.bool.isRequired,
};

const defaultProps = {
  kind: 'audioinput',
  blocked: false,
  deviceId: '',
  devices: [],
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
  noMicListenOnlyLabel: {
    id: 'app.audio.audioSettings.noMicListenOnly',
    description: 'No microphone, listen only mode label',
  },
});

class DeviceSelector extends Component {
  constructor(props) {
    super(props);

    this.handleSelectChange = this.handleSelectChange.bind(this);
  }

  handleSelectChange(event) {
    const { value } = event.target;
    const { devices, onChange } = this.props;
    const selectedDeviceId = (value === 'listen-only')
      ? value
      : devices.find((d) => d.deviceId === value)?.deviceId;

    onChange(selectedDeviceId);
  }

  getFallbackLabel(index) {
    const { intl, kind } = this.props;
    const label = kind === 'audioinput' ? intlMessages.fallbackInputLabel : intlMessages.fallbackOutputLabel;

    return intl.formatMessage(label, { 0: index });
  }

  render() {
    const {
      intl,
      kind,
      blocked,
      deviceId,
      devices,
      supportsTransparentListenOnly,
    } = this.props;

    const options = devices.map((d, i) => ({
      label: d.label || this.getFallbackLabel(i),
      value: d.deviceId,
      key: uniqueId('device-option-'),
    }));

    if (kind === 'audioinput' && supportsTransparentListenOnly && !blocked) {
      options.push({
        label: intl.formatMessage(intlMessages.noMicListenOnlyLabel),
        value: 'listen-only',
        key: uniqueId('device-option-'),
      });
    }

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
