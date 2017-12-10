import React, { Component } from 'react';
import { withShortcut } from '/imports/ui/components/shortcut/component';
import DropdownListItem from '/imports/ui/components/dropdown/list/item/component';
import { withModalMounter } from '/imports/ui/components/modal/service';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import PropTypes from 'prop-types';
import LogoutConfirmationContainer from '/imports/ui/components/logout-confirmation/container';

const intlMessages = defineMessages({
  leaveSessionLabel: {
    id: 'app.navBar.settingsDropdown.leaveSessionLabel',
    description: 'Leave session button label',
  },
  leaveSessionDesc: {
    id: 'app.navBar.settingsDropdown.leaveSessionDesc',
    description: 'Describes leave session option',
  },
});

const propTypes = {
  intl: intlShape.isRequired,
  mountModal: PropTypes.func.isRequired,
};

class LogoutListItem extends Component {
  render() {
    const { mountModal, intl } = this.props;

    return (
      <DropdownListItem
        icon="logout"
        label={intl.formatMessage(intlMessages.leaveSessionLabel)}
        description={intl.formatMessage(intlMessages.leaveSessionDesc)}
        onClick={() => mountModal(<LogoutConfirmationContainer />)}
      />
    );
  }
}

export default withModalMounter(injectIntl(withShortcut(LogoutListItem, 'Control+Alt+l')));

LogoutListItem.propTypes = propTypes;
