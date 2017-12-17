import React, { Component } from 'react';
import { withShortcut } from '/imports/ui/components/shortcut/component';
import DropdownListItem from '/imports/ui/components/dropdown/list/item/component';
import PresentationUploaderContainer from '/imports/ui/components/presentation/presentation-uploader/container';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import PropTypes from 'prop-types';
import { withModalMounter } from '/imports/ui/components/modal/service';

const intlMessages = defineMessages({
  presentationLabel: {
    id: 'app.actionsBar.actionsDropdown.presentationLabel',
    description: 'Upload a presentation option label',
  },
  presentationDesc: {
    id: 'app.actionsBar.actionsDropdown.presentationDesc',
    description: 'adds context to upload presentation option',
  },
});

const propTypes = {
  intl: intlShape.isRequired,
  mountModal: PropTypes.func.isRequired,
};

const SHORTCUTS_CONFIG = Meteor.settings.public.shortcuts;
const SHORTCUT_COMBO = SHORTCUTS_CONFIG.upload_presentation.keys;

class UploadPresentation extends Component {
  constructor() {
    super();

    this.handlePresentationClick = this.handlePresentationClick.bind(this);
  }

  handlePresentationClick() {
    this.props.mountModal(<PresentationUploaderContainer />);
  }

  render() {
    const { intl } = this.props;

    return (
      <DropdownListItem
        icon="presentation"
        label={intl.formatMessage(intlMessages.presentationLabel)}
        description={intl.formatMessage(intlMessages.presentationDesc)}
        onClick={this.handlePresentationClick}
      />
    );
  }
}

export default withModalMounter(injectIntl(withShortcut(UploadPresentation, SHORTCUT_COMBO)));

UploadPresentation.propTypes = propTypes;
