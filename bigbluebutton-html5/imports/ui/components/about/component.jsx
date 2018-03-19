import React from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import Modal from '/imports/ui/components/modal/simple/component';

const intlMessages = defineMessages({
  title: {
    id: 'app.about.title',
    description: 'About title label',
  },
  version: {
    id: 'app.about.version',
    description: 'Client version label',
  },
  copyright: {
    id: 'app.about.copyright',
    defaultMessage: (new Date().getFullYear()),
    description: 'Client copyright label',
  },
  confirmLabel: {
    id: 'app.about.confirmLabel',
    description: 'Confirmation button label',
  },
  confirmDesc: {
    id: 'app.about.confirmDesc',
    description: 'adds descriptive context to confirmLabel',
  },
  dismissLabel: {
    id: 'app.about.dismissLabel',
    description: 'Dismiss button label',
  },
  dismissDesc: {
    id: 'app.about.dismissDesc',
    description: 'adds descriptive context to dissmissLabel',
  },
});

const AboutComponent = ({ intl, clientBuild, copyright }) => (
  <Modal
    title={intl.formatMessage(intlMessages.title)}
    dismiss={{
      label: intl.formatMessage(intlMessages.dismissLabel),
      description: intl.formatMessage(intlMessages.dismissDesc),
    }}
  >
    {`${intl.formatMessage(intlMessages.copyright)} ${copyright}`} <br />
    {`${intl.formatMessage(intlMessages.version)} ${clientBuild}`}
  </Modal>
);

export default injectIntl(AboutComponent);
