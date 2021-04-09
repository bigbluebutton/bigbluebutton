import React, { PureComponent } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import PropTypes from 'prop-types';
import Modal from '/imports/ui/components/modal/simple/component';
import Button from '/imports/ui/components/button/component';
import { styles } from './styles';

const ASK_MODERATOR = 'ASK_MODERATOR';
const ALWAYS_ACCEPT = 'ALWAYS_ACCEPT';
const ALWAYS_DENY = 'ALWAYS_DENY';

const intlMessages = defineMessages({
  ariaModalTitle: {
    id: 'app.guest-policy.ariaTitle',
    description: 'Guest policy aria title',
  },
  guestPolicyTitle: {
    id: 'app.guest-policy.title',
    description: 'Guest policy title',
  },
  guestPolicyDescription: {
    id: 'app.guest-policy.description',
    description: 'Guest policy description',
  },
  askModerator: {
    id: 'app.guest-policy.button.askModerator',
    description: 'Ask moderator button label',
  },
  alwaysAccept: {
    id: 'app.guest-policy.button.alwaysAccept',
    description: 'Always accept button label',
  },
  alwaysDeny: {
    id: 'app.guest-policy.button.alwaysDeny',
    description: 'Always deny button label',
  },
});

const propTypes = {
  closeModal: PropTypes.func.isRequired,
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  guestPolicy: PropTypes.string.isRequired,
  changeGuestPolicy: PropTypes.func.isRequired,
};

class GuestPolicyComponent extends PureComponent {
  render() {
    const {
      closeModal,
      intl,
      guestPolicy,
      changeGuestPolicy,
    } = this.props;

    return (
      <Modal
        overlayClassName={styles.overlay}
        className={styles.modal}
        onRequestClose={closeModal}
        hideBorder
        contentLabel={intl.formatMessage(intlMessages.ariaModalTitle)}
      >
        <div className={styles.container}>
          <div className={styles.header}>
            <h2 className={styles.title}>
              {intl.formatMessage(intlMessages.guestPolicyTitle)}
            </h2>
          </div>
          <div className={styles.description}>
            {intl.formatMessage(intlMessages.guestPolicyDescription)}
          </div>

          <div className={styles.content}>
            <Button
              color="primary"
              className={styles.button}
              disabled={guestPolicy === ASK_MODERATOR}
              label={intl.formatMessage(intlMessages.askModerator)}
              onClick={() => {
                changeGuestPolicy(ASK_MODERATOR);
                closeModal();
              }}
            />
            <Button
              color="primary"
              className={styles.button}
              disabled={guestPolicy === ALWAYS_ACCEPT}
              label={intl.formatMessage(intlMessages.alwaysAccept)}
              onClick={() => {
                changeGuestPolicy(ALWAYS_ACCEPT);
                closeModal();
              }}
            />
            <Button
              color="primary"
              className={styles.button}
              disabled={guestPolicy === ALWAYS_DENY}
              label={intl.formatMessage(intlMessages.alwaysDeny)}
              onClick={() => {
                changeGuestPolicy(ALWAYS_DENY);
                closeModal();
              }}
            />
          </div>
        </div>
      </Modal>
    );
  }
}

GuestPolicyComponent.propTypes = propTypes;

export default injectIntl(GuestPolicyComponent);
