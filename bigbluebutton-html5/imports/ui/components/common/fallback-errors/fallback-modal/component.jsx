import React from 'react';
import ModalSimple from '/imports/ui/components/common/modal/simple/component';
import { defineMessages, injectIntl } from 'react-intl';
import { withModalMounter } from '/imports/ui/components/common/modal/service';
import FallbackView from '../fallback-view/component';

const intlMessages = defineMessages({
  ariaTitle: {
    id: 'app.error.fallback.modal.ariaTitle',
    description: 'title announced when fallback modal is showed',
  },
});

const FallbackModal = ({ error, intl, mountModal }) => (
  <ModalSimple
    hideBorder
    onRequestClose={() => mountModal(null)}
    contentLabel={intl.formatMessage(intlMessages.ariaTitle)}
  >
    <FallbackView {...{ error }} />
  </ModalSimple>
);

export default withModalMounter(injectIntl(FallbackModal));
