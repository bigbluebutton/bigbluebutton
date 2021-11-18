import React from 'react';
import { injectIntl, defineMessages } from 'react-intl';
import PropTypes from 'prop-types';
import Styled from './styles';
import browserInfo from '/imports/utils/browserInfo';
import Settings from '/imports/ui/services/settings';

const propTypes = {
  intl: PropTypes.object.isRequired,
  closeModal: PropTypes.func.isRequired,
};

const intlMessages = defineMessages({
  title: {
    id: 'app.audio.permissionsOverlay.title',
    description: 'Title for the overlay',
  },
  hint: {
    id: 'app.audio.permissionsOverlay.hint',
    description: 'Hint for the overlay',
  },
});

const { isChrome, isFirefox, isSafari } = browserInfo;
const { animations } = Settings.application;

const PermissionsOverlay = ({ intl, closeModal }) => (
  <Styled.PermissionsOverlayModal
    overlayClassName={"permissionsOverlay"}
    onRequestClose={closeModal}
    hideBorder
    isFirefox={isFirefox}
    isChrome={isChrome}
    isSafari={isSafari}
    animations={animations}
  >
    <Styled.Content>
      { intl.formatMessage(intlMessages.title) }
      <small>
        { intl.formatMessage(intlMessages.hint) }
      </small>
    </Styled.Content>
  </Styled.PermissionsOverlayModal>
);

PermissionsOverlay.propTypes = propTypes;

export default injectIntl(PermissionsOverlay);
