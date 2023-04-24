import React from 'react';
import ModalSimple from '/imports/ui/components/common/modal/simple/component';
import { defineMessages, injectIntl } from 'react-intl';
import FallbackView from '../fallback-view/component';

const intlMessages = defineMessages({
  ariaTitle: {
    id: 'app.error.fallback.modal.ariaTitle',
    description: 'title announced when fallback modal is showed',
  },
});

const FallbackModal = ({ error, intl }) => {
  return (
  <ModalSimple
    hideBorder
    priority="medium"
    shouldShowCloseButton={false}
    contentLabel={intl.formatMessage(intlMessages.ariaTitle)}
    isOpen={!!error}
  >
    <FallbackView {...{ error }} />
  </ModalSimple>
)};

export default injectIntl(FallbackModal);
