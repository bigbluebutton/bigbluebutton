import React, { Component } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import Modal from '/imports/ui/components/modal/simple/component';

const intlMessages = defineMessages({
  title: {
    id: 'app.about.title',
    defaultMessage: 'About',
  },
  version: {
    id: 'app.about.version',
    defaultMessage: 'Client Build:',
  },
  copyright: {
    id: 'app.about.copyright',
    defaultMessage: (new Date().getFullYear()),
  },
  confirmLabel: {
    id: 'app.about.confirmLabel',
    defaultMessage: 'OK',
  },
  confirmDesc: {
    id: 'app.about.confirmDesc',
    defaultMessage: 'OK',
  },
  dismissLabel: {
    id: 'app.about.dismissLabel',
    defaultMessage: 'Cancel',
  },
  dismissDesc: {
    id: 'app.about.dismissDesc',
    defaultMessage: 'Close about client information',
  },
});

class AboutComponent extends Component {
  render() {
    const { intl, clientBuild, copyright } = this.props;

    return (
      <Modal
        title={intl.formatMessage(intlMessages.title)}
        dismiss={{
          label: intl.formatMessage(intlMessages.dismissLabel),
          description: intl.formatMessage(intlMessages.dismissDesc),
        }}>
        {`${intl.formatMessage(intlMessages.copyright)} ${copyright}`} <br/>
        {`${intl.formatMessage(intlMessages.version)} ${clientBuild}`}
      </Modal>
    );
  }
};

export default injectIntl(AboutComponent);
