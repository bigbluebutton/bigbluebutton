import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl } from 'react-intl';
import _ from 'lodash';
import BBBMenu from '/imports/ui/components/common/menu/component';
import Trigger from '/imports/ui/components/common/control-header/right/component';
import Service from './service';

const DEBOUNCE_TIMEOUT = 15000;
const NOTES_CONFIG = Meteor.settings.public.notes;
const NOTES_IS_PINNABLE = NOTES_CONFIG.pinnable;

const intlMessages = defineMessages({
  convertAndUploadLabel: {
    id: 'app.notes.notesDropdown.covertAndUpload',
    description: 'Export shared notes as a PDF and upload to the main room',
  },
  pinNotes: {
    id: 'app.notes.notesDropdown.pinNotes',
    description: 'Label for pin shared notes button',
  },
  options: {
    id: 'app.notes.notesDropdown.notesOptions',
    description: 'Label for shared notes options',
  },
});

const propTypes = {
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  amIPresenter: PropTypes.bool.isRequired,
  isRTL: PropTypes.bool.isRequired,
};

class NotesDropdown extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      converterButtonDisabled: false,
    };
  }

  setConverterButtonDisabled(value) {
    return this.setState({ converterButtonDisabled: value });
  }

  getAvailableActions() {
    const {
      intl,
      amIPresenter,
    } = this.props;

    const { converterButtonDisabled } = this.state;

    const uploadIcon = 'upload';
    const pinIcon = 'presentation';

    this.menuItems = [];

    if (amIPresenter) {
      this.menuItems.push(
        {
          key: _.uniqueId('notes-option-'),
          icon: uploadIcon,
          dataTest: 'moveNotesToWhiteboard',
          label: intl.formatMessage(intlMessages.convertAndUploadLabel),
          disabled: converterButtonDisabled,
          onClick: () => {
            this.setConverterButtonDisabled(true);
            setTimeout(() => this.setConverterButtonDisabled(false), DEBOUNCE_TIMEOUT);
            return Service.convertAndUpload();
          },
        },
      );
    }

    if (amIPresenter && NOTES_IS_PINNABLE) {
      this.menuItems.push(
        {
          key: _.uniqueId('notes-option-'),
          icon: pinIcon,
          dataTest: 'pinNotes',
          label: intl.formatMessage(intlMessages.pinNotes),
          onClick: () => {
            Service.pinSharedNotes();
          },
        },
      );
    }

    return this.menuItems;
  }

  render() {
    const {
      intl,
      isRTL,
    } = this.props;

    const actions = this.getAvailableActions();

    if (actions.length === 0) return null;

    return (
      <>
        <BBBMenu
          trigger={
            <Trigger
              data-test="notesOptionsMenu"
              icon="more"
              label={intl.formatMessage(intlMessages.options)}
              aria-label={intl.formatMessage(intlMessages.options)}
              onClick={() => null}
            />
          }
          opts={{
            id: 'notes-options-dropdown',
            keepMounted: true,
            transitionDuration: 0,
            elevation: 3,
            getContentAnchorEl: null,
            fullwidth: 'true',
            anchorOrigin: { vertical: 'bottom', horizontal: isRTL ? 'right' : 'left' },
            transformOrigin: { vertical: 'top', horizontal: isRTL ? 'right' : 'left' },
          }}
          actions={actions}
        />
      </>
    );
  }
}

NotesDropdown.propTypes = propTypes;

export default injectIntl(NotesDropdown);
