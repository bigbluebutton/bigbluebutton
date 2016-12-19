import React, { Component, PropTypes } from 'react';

const propTypes = {
  kind: PropTypes.oneOf(['audioinput', 'audiooutput', 'videoinput']),
  onChange: PropTypes.func.isRequired,
};

const defaultProps = {
  kind: 'audioinput',
};

class DeviceSelector extends Component {
  constructor(props) {
    super(props);

    this.handleEnumerateDevicesSuccess = this.handleEnumerateDevicesSuccess.bind(this);
    this.handleEnumerateDevicesError = this.handleEnumerateDevicesError.bind(this);
    this.handleSelectChange = this.handleSelectChange.bind(this);

    this.state = {
      value: undefined,
      devices: [],
      options: [],
    };
  }

  componentDidMount() {
    navigator.mediaDevices
      .enumerateDevices()
      .then(this.handleEnumerateDevicesSuccess)
      .catch(this.handleEnumerateDevicesError);
  }

  handleEnumerateDevicesSuccess(deviceInfos) {
    const devices = deviceInfos.filter(d => d.kind === this.props.kind);

    this.setState({
      devices,
      options: devices.map((d, i) => ({
        label: d.label || `${this.props.kind} - ${i}`,
        value: d.deviceId,
      })),
    });
  }

  handleEnumerateDevicesError(error) {
    console.error(error);
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
    const { kind, handleDeviceChange, ...props } = this.props;
    const { options, value } = this.state;

    return (
      <select
        {...props}
        value={value}
        onChange={this.handleSelectChange}
        disabled={!options.length}>
        {
          options.length ?
            options.map((option, i) => (
              <option
                key={i}
                value={option.value}>
                {option.label}
              </option>
            )) :
            <option value="not-found">{`no ${kind} found`}</option>
        }
      </select>
    );
  }
};

DeviceSelector.propTypes = propTypes;
DeviceSelector.defaultProps = defaultProps;

export default DeviceSelector;
