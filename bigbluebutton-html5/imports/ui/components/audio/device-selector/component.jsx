import React, { Component } from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import cx from 'classnames';
import logger from '/imports/startup/client/logger';
import browser from 'browser-detect';
import { styles } from '../audio-modal/styles';

const propTypes = {
  kind: PropTypes.oneOf(['audioinput', 'audiooutput', 'videoinput']),
  onChange: PropTypes.func.isRequired,
  value: PropTypes.string,
  className: PropTypes.string,
};

const defaultProps = {
  kind: 'audioinput',
  value: undefined,
  className: null,
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
    const { kind } = this.props;
    const handleEnumerateDevicesSuccess = (deviceInfos) => {
      const devices = deviceInfos.filter(d => d.kind === kind);
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
          label: d.label || `${kind} - ${i}`,
          value: d.deviceId,
          key: _.uniqueId('device-option-'),
        })),
      });
    };

    navigator.mediaDevices
      .enumerateDevices()
      .then(handleEnumerateDevicesSuccess)
      .catch((err) => {
        logger.error({
          logCode: 'audiodeviceselector_component_enumeratedevices_error',
          extraInfo: {
            deviceKind: kind,
          },
        }, 'Error on enumerateDevices(): ');
      });
  }

  handleSelectChange(event) {
    const { value } = event.target;
    const { onChange } = this.props;
    const { devices } = this.state;
    this.setState({ value }, () => {
      const selectedDevice = devices.find(d => d.deviceId === value);
      onChange(selectedDevice.deviceId, selectedDevice, event);
    });
  }

  render() {
    const {
      kind, className, ...props
    } = this.props;

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
          options.length
            ? options.map(option => (
              <option
                key={option.key}
                value={option.value}
              >
                {option.label}
              </option>
            ))
            : (
              (kind === 'audiooutput' && browser().name === 'safari')
                ? <option value="not-found">Default</option>
                : <option value="not-found">{`no ${kind} found`}</option>
            )
        }
      </select>
    );
  }
}

DeviceSelector.propTypes = propTypes;
DeviceSelector.defaultProps = defaultProps;

export default DeviceSelector;
