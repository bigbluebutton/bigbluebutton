import React, { Component } from 'react';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import PropTypes from 'prop-types';
import { withShortcut } from '/imports/ui/components/shortcut/component';
import DropdownListItem from '/imports/ui/components/dropdown/list/item/component';

const intlMessages = defineMessages({
  fullscreenLabel: {
    id: 'app.navBar.settingsDropdown.fullscreenLabel',
    description: 'Make fullscreen option label',
  },
  fullscreenDesc: {
    id: 'app.navBar.settingsDropdown.fullscreenDesc',
    description: 'Describes fullscreen option',
  },
  exitFullscreenDesc: {
    id: 'app.navBar.settingsDropdown.exitFullscreenDesc',
    description: 'Describes exit fullscreen option',
  },
  exitFullscreenLabel: {
    id: 'app.navBar.settingsDropdown.exitFullscreenLabel',
    description: 'Exit fullscreen option label',
  },
});

const propTypes = {
  intl: intlShape.isRequired,
  isFullScreen: PropTypes.bool.isRequired,
  handleToggleFullscreen: PropTypes.func.isRequired,
};

class FullScreenToggle extends Component {
  render() {
    const { intl, isFullScreen, handleToggleFullscreen } = this.props;

    let fullscreenLabel = intl.formatMessage(intlMessages.fullscreenLabel);
    let fullscreenDesc = intl.formatMessage(intlMessages.fullscreenDesc);
    let fullscreenIcon = 'fullscreen';

    if (isFullScreen) {
      fullscreenLabel = intl.formatMessage(intlMessages.exitFullscreenLabel);
      fullscreenDesc = intl.formatMessage(intlMessages.exitFullscreenDesc);
      fullscreenIcon = 'exit_fullscreen';
    }

    return (
      <DropdownListItem
        icon={fullscreenIcon}
        label={fullscreenLabel}
        description={fullscreenDesc}
        onClick={handleToggleFullscreen}
        ref={(ref) => { this.ref = ref; }}
      />
    );
  }
}

export default injectIntl(withShortcut(FullScreenToggle, 'Control+Alt+0'));

FullScreenToggle.propTypes = propTypes;
