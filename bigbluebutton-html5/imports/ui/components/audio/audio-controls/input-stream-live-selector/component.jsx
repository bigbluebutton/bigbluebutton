import React, { Component, Fragment } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import PropTypes from 'prop-types';
import Button from '/imports/ui/components/button/component';
import Dropdown from '/imports/ui/components/dropdown/component';
import DropdownTrigger from '/imports/ui/components/dropdown/trigger/component';
import DropdownContent from '/imports/ui/components/dropdown/content/component';
import DropdownList from '/imports/ui/components/dropdown/list/component';
import DropdownListSeparator from '/imports/ui/components/dropdown/list/separator/component';
import DropdownListItem from '/imports/ui/components/dropdown/list/item/component';
import DropdownListTitle from '/imports/ui/components/dropdown/list/title/component';
import withShortcutHelper from '/imports/ui/components/shortcut-help/service';

import { styles } from '../styles';

const AUDIO_INPUT = 'audioinput';
const AUDIO_OUTPUT = 'audiooutput';

const intlMessages = defineMessages({
  changeLeaveAudio: {
    id: 'app.audio.changeLeaveAudio',
    description: 'Change/Leave audio button label',
  },
  leaveAudio: {
    id: 'app.audio.leaveAudio',
    description: 'Leave audio dropdown item label',
  },
  loading: {
    id: 'app.audio.loading',
    description: 'Loading audio dropdown item label',
  },
  input: {
    id: 'app.audio.input',
    description: 'Input audio dropdown item label',
  },
  output: {
    id: 'app.audio.output',
    description: 'Output audio dropdown item label',
  },
});

const propTypes = {
  liveChangeInputDevice: PropTypes.func.isRequired,
  exitAudio: PropTypes.func.isRequired,
  liveChangeOutputDevice: PropTypes.func.isRequired,
  intl: PropTypes.object.isRequired,
  shortcuts: PropTypes.object.isRequired,
};

class InputStreamLiveSelector extends Component {
  constructor(props) {
    super(props);
    this.setInputDevices = this.setInputDevices.bind(this);
    this.setOutputDevices = this.setOutputDevices.bind(this);
    this.renderDeviceList = this.renderDeviceList.bind(this);
    this.state = {
      audioInputDevices: null,
      audioOutputDevices: null,
    };
  }

  componentDidMount() {
    this.setInputDevices();
    this.setOutputDevices();
  }

  setInputDevices() {
    navigator.mediaDevices.enumerateDevices()
      .then((devices) => {
        this.setState({
          audioInputDevices: devices.filter(i => i.kind === AUDIO_INPUT),
        });
      });
  }

  setOutputDevices() {
    navigator.mediaDevices.enumerateDevices()
      .then((devices) => {
        this.setState({
          audioOutputDevices: devices.filter(i => i.kind === AUDIO_OUTPUT),
        });
      });
  }

  renderDeviceList(list, callback, title) {
    const { intl } = this.props;
    return [
      <DropdownListTitle>{title}</DropdownListTitle>,
      list ? list.map(device => (
        <DropdownListItem
          key={device.deviceId}
          label={device.label}
          onClick={() => callback(device.deviceId)}
        />
      ))
        : (
          <DropdownListItem
            label={intl.formatMessage(intlMessages.loading)}
          />
        ),
      <DropdownListSeparator />,
    ];
  }

  render() {
    const { audioInputDevices, audioOutputDevices } = this.state;
    const {
      liveChangeInputDevice,
      exitAudio,
      liveChangeOutputDevice,
      intl,
      shortcuts,
    } = this.props;
    return (
      <Dropdown>
        <DropdownTrigger>
          <Button
            aria-label={intl.formatMessage(intlMessages.changeLeaveAudio)}
            label={intl.formatMessage(intlMessages.changeLeaveAudio)}
            hideLabel
            color="primary"
            icon="audio_on"
            size="lg"
            circle
            onClick={()=>{
              this.setInputDevices();
              this.setOutputDevices();
            }}
            accessKey={shortcuts.leaveAudio}
          />
        </DropdownTrigger>
        <DropdownContent>
          <DropdownList className={styles.dropdownListContainer}>
            {this.renderDeviceList(
              audioInputDevices,
              liveChangeInputDevice,
              intl.formatMessage(intlMessages.input),
            )}
            {this.renderDeviceList(
              audioOutputDevices,
              liveChangeOutputDevice,
              intl.formatMessage(intlMessages.output)
            )}
            <DropdownListItem
              className={styles.stopButton}
              label={intl.formatMessage(intlMessages.leaveAudio)}
              onClick={() => exitAudio()}
            />
          </DropdownList>
        </DropdownContent>
      </Dropdown>
    );
  }
}

InputStreamLiveSelector.propTypes = propTypes;

export default withShortcutHelper(injectIntl(InputStreamLiveSelector));
