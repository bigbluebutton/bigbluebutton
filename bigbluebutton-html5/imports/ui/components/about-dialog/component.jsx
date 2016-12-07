import React, { Component } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import Modal from '/imports/ui/components/modal/component';

const intlMessages = defineMessages({
    title: {
        id: 'app.aboutDialog.title',
        defaultMessage: 'About',
    },
    version: {
        id: 'app.aboutDialog.version',
        defaultMessage: 'default',
    },
    copyright: {
        id: 'app.aboutDialog.copyright',
        defaultMessage: '2016',
    },
    confirmLabel: {
        id: 'app.aboutDialog.dismissLabel',
        defaultMessage: 'Cancel',
    },
    confirmDesc: {
        id: 'app.aboutDialog.dismissDesc',
        defaultMessage: 'Logs you out of the meeting',
    },
    dismissLabel: {
        id: 'app.aboutDialog.dismissLabel',
        defaultMessage: 'Cancel',
    },
    dismissDesc: {
        id: 'app.aboutDialog.dismissDesc',
        defaultMessage: 'Close about dialog',
    },
});

class AboutDialog extends Component {
    constructor(props) {
        super(props);

        this.handleAboutDialog = this.handleAboutDialog.bind(this);
    }

    handleAboutDialog() {
        console.log("TODO");
    }

    render() {
        const { intl, clientBuildInfo } = this.props;
        const { clientBuild, copyright } = clientBuildInfo;

        return (
            <Modal
                title={intl.formatMessage(intlMessages.title)}
                confirm={{
                    callback: this.handleAboutDialog,
                    label: intl.formatMessage(intlMessages.confirmLabel),
                    description: intl.formatMessage(intlMessages.confirmDesc),
                }}
                dismiss={{
                    callback: this.handleAboutDialog,
                    label: intl.formatMessage(intlMessages.dismissLabel),
                    description: intl.formatMessage(intlMessages.dismissDesc),
                }}>
                {`${intl.formatMessage(intlMessages.copyright)} ${copyright}`} <br/>
                {`${intl.formatMessage(intlMessages.version)} ${clientBuild}`}
            </Modal>
        );
    }
};

export default injectIntl(AboutDialog);
