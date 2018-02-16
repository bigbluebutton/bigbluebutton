import React, { Component } from 'react';
import { styles } from './styles';
import { defineMessages, injectIntl } from 'react-intl';
import { log } from '/imports/ui/services/api';
import { notify } from '/imports/ui/services/notification';
import { toast } from 'react-toastify';
import Toast from '/imports/ui/components/toast/component';

const intlMessages = defineMessages({
  chromeExtensionError: {
    id: 'app.video.chromeExtensionError',
    description: 'Error message for Chrome Extension not installed',
  },
  chromeExtensionErrorLink: {
    id: 'app.video.chromeExtensionErrorLink',
    description: 'Error message for Chrome Extension not installed',
  }
});

function notifyError(message) {
  notify(message, 'error', 'video');
}

function installChromeExtension() {
    const { intl } = intlMessages;
    const CHROME_EXTENSION_LINK = Meteor.settings.public.kurento.chromeExtensionLink;

    notifyError(<div>
      {intl.formatMessage(intlMessages.chromeExtensionError)}{' '}
      <a href={CHROME_EXTENSION_LINK} target="_blank">
        {intl.formatMessage(intlMessages.chromeExtensionErrorLink)}
      </a>
    </div>);
}

export default {
  installChromeExtension
};