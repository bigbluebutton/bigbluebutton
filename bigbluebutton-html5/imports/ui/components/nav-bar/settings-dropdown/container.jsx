import React, { PureComponent } from 'react';
import browser from 'browser-detect';
import SettingsDropdown from './component';
import { toggleFullScreen } from './service';

export default class SettingsDropdownContainer extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      isFullScreen: false,
    };

    this.handleFullscreenChange = this.handleFullscreenChange.bind(this);
  }

  componentDidMount() {
    const fullscreenChangedEvents = [
      'fullscreenchange',
      'webkitfullscreenchange',
      'mozfullscreenchange',
      'MSFullscreenChange',
    ];

    fullscreenChangedEvents.forEach((event) => {
      document.addEventListener(event, this.handleFullscreenChange);
    });
  }

  componentWillUnmount() {
    const fullscreenChangedEvents = [
      'fullscreenchange',
      'webkitfullscreenchange',
      'mozfullscreenchange',
      'MSFullscreenChange',
    ];

    fullscreenChangedEvents.forEach((event) => {
      document.removeEventListener(event, this.fullScreenToggleCallback);
    });
  }

  handleFullscreenChange() {
    if (document.fullscreenElement
      || document.webkitFullscreenElement
      || document.mozFullScreenElement
      || document.msFullscreenElement) {
      this.setState({ isFullScreen: true });
    } else {
      this.setState({ isFullScreen: false });
    }
  }

  render() {
    const { amIModerator } = this.props;

    const handleToggleFullscreen = toggleFullScreen;
    const { isFullScreen } = this.state;
    const result = browser();
    const isAndroid = (result && result.os) ? result.os.includes('Android') : false;

    return (
      <SettingsDropdown
        handleToggleFullscreen={handleToggleFullscreen}
        isFullScreen={isFullScreen}
        isAndroid={isAndroid}
        amIModerator={amIModerator}
      />
    );
  }
}
