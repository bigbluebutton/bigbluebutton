import React from 'react';
import { withShortcut } from '/imports/ui/components/shortcut/component';
import DropdownListItem from '/imports/ui/components/dropdown/list/item/component';
import SettingsMenuContainer from '/imports/ui/components/settings/container';
import { withModalMounter } from '/imports/ui/components/modal/service';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import PropTypes from 'prop-types';

const intlMessages = defineMessages({
  settingsLabel: {
    id: 'app.navBar.settingsDropdown.settingsLabel',
    description: 'Open settings option label',
  },
  settingsDesc: {
    id: 'app.navBar.settingsDropdown.settingsDesc',
    description: 'Describes settings option',
  },
});

const propTypes = {
  intl: intlShape.isRequired,
  mountModal: PropTypes.func.isRequired,
};

const SHORTCUTS_CONFIG = Meteor.settings.public.shortcuts;
const SHORTCUT_COMBO = SHORTCUTS_CONFIG.open_settings.keys;

class OpenSettingsListItem extends React.PureComponent {
  render() {
    const { mountModal, intl } = this.props;

    return (
      <DropdownListItem
        icon="settings"
        label={intl.formatMessage(intlMessages.settingsLabel)}
        description={intl.formatMessage(intlMessages.settingsDesc)}
        onClick={() => mountModal(<SettingsMenuContainer />)}
      />
    );
  }
}

export default withModalMounter(injectIntl(withShortcut(OpenSettingsListItem, SHORTCUT_COMBO)));

OpenSettingsListItem.propTypes = propTypes;
