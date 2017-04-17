import React, { Component } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import Modal from '/imports/ui/components/modal/component';

const intlMessages = defineMessages({
  title: {
    id: 'app.about.title',
  },
  version: {
    id: 'app.about.version',
  },
  copyright: {
    id: 'app.about.copyright',
    defaultMessage: (new Date().getFullYear()),
  },
  confirmLabel: {
    id: 'app.about.confirmLabel',
  },
  confirmDesc: {
    id: 'app.about.confirmDesc',
  },
  dismissLabel: {
    id: 'app.about.dismissLabel',
  },
  dismissDesc: {
    id: 'app.about.dismissDesc',
  },
});

class AboutComponent extends Component {
  constructor(props) {
    super(props);

    this.handleAboutComponent = this.handleAboutComponent.bind(this);
  }

  handleAboutComponent() {
    console.log("TODO");
  }

  render() {
    const { intl, clientBuild, copyright } = this.props;

    return (
      <Modal
        title={intl.formatMessage(intlMessages.title)}
        confirm={{
          callback: this.handleAboutComponent,
          label: intl.formatMessage(intlMessages.confirmLabel),
          description: intl.formatMessage(intlMessages.confirmDesc),
        }}
        dismiss={{
          callback: this.handleAboutComponent,
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
