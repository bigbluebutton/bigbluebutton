import React, { Component } from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { styles } from '../audio-modal/styles';

const propTypes = {
  kind: PropTypes.oneOf(['audioinput', 'audiooutput', 'videoinput']),
  onChange: PropTypes.func.isRequired,
  value: PropTypes.string,
  handleDeviceChange: PropTypes.func,
  className: PropTypes.string,
};

const defaultProps = {
  kind: 'audioinput',
  value: undefined,
  className: null,
  handleDeviceChange: null,
};

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
    const handleEnumerateDevicesSuccess = (deviceInfos) => {
      const devices = deviceInfos.filter(d => d.kind === this.props.kind);

      this.setState({
        devices,
        options: devices.map((d, i) => ({
          label: d.label || `${this.props.kind} - ${i}`,
          value: d.deviceId,
          key: _.uniqueId('device-option-'),
        })),
      });
    };

    navigator.mediaDevices
      .enumerateDevices()
      .then(handleEnumerateDevicesSuccess);
  }

  handleSelectChange(event) {
    const value = event.target.value;
    const { onChange } = this.props;
    this.setState({ value }, () => {
      const selectedDevice = this.state.devices.find(d => d.deviceId === value);
      onChange(selectedDevice.deviceId, selectedDevice, event);
    });
  }

  render() {
    const { kind, handleDeviceChange, className, ...props } = this.props;
    const { options, value } = this.state;

    return (
      <select
        {...props}
        value={value}
        onChange={this.handleSelectChange}
        disabled={!options.length}
        className={cx(styles.select, className)}
      >
        {
          options.length ?
            options.map(option => (
              <option
                key={option.key}
                value={option.value}
              >
                {option.label}
              </option>
            )) :
            <option value="not-found">{`no ${kind} found`}</option>
        }
      </select>
    );
  }
}

DeviceSelector.propTypes = propTypes;
DeviceSelector.defaultProps = defaultProps;

export default DeviceSelector;
