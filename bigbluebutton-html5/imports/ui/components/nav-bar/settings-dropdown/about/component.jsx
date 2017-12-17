import React from 'react';
import { withShortcut } from '/imports/ui/components/shortcut/component';
import DropdownListItem from '/imports/ui/components/dropdown/list/item/component';
import AboutContainer from '/imports/ui/components/about/container';
import { withModalMounter } from '/imports/ui/components/modal/service';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import PropTypes from 'prop-types';

const intlMessages = defineMessages({
  aboutLabel: {
    id: 'app.navBar.settingsDropdown.aboutLabel',
    description: 'About option label',
  },
  aboutDesc: {
    id: 'app.navBar.settingsDropdown.aboutDesc',
    description: 'Describes about option',
  },
});

const propTypes = {
  intl: intlShape.isRequired,
  mountModal: PropTypes.func.isRequired,
};

const SHORTCUTS_CONFIG = Meteor.settings.public.shortcuts;
const SHORTCUT_COMBO = SHORTCUTS_CONFIG.open_about.keys;

class OpenAboutListItem extends React.PureComponent {
  render() {
    const { mountModal, intl } = this.props;

    return (
      <DropdownListItem
        icon="about"
        label={intl.formatMessage(intlMessages.aboutLabel)}
        description={intl.formatMessage(intlMessages.aboutDesc)}
        onClick={() => mountModal(<AboutContainer />)}
      />
    );
  }
}

export default withModalMounter(injectIntl(withShortcut(OpenAboutListItem, SHORTCUT_COMBO)));

OpenAboutListItem.propTypes = propTypes;
