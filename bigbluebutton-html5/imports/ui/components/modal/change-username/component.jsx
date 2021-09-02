import React, { useState } from 'react';
import { defineMessages } from 'react-intl';
import { withModalMounter } from '/imports/ui/components/modal/service';
import Modal from '/imports/ui/components/modal/simple/component';
import Button from '/imports/ui/components/button/component';
import PropTypes from 'prop-types';
import { styles } from './styles';
import TextInput from '/imports/ui/components/text-input/component';
import SanitizeHTML from 'sanitize-html';
import Auth from '/imports/ui/services/auth';
import Users from '/imports/api/users';

const messages = defineMessages({
  changeUserNameLabel: {
    id: 'app.changeUserNameModal.changeLabel',
    description: 'confirm button label',
  },
  cancelLabel: {
    id: 'app.changeUserNameModal.cancelLabel',
    description: 'cancel button label',
  },
  changeUserNameTitle: {
    id: 'app.changeUserNameModal.label',
    description: 'title for change user name modal',
  },
  changeUserNameDesc: {
    id: 'app.changeUserNameModal.desc',
    description: 'description for change user name modal',
  },
  changeUserNameValidationError: {
    id: 'app.changeUserNameModal.validationError',
    description: 'Error message if username is not allowed',
  },
  userNameChangedMessage: {
    id: 'app.chat.userNameChangedMessage',
    description: 'message sent to all chat informing about user name change',
  },
  ownUserNameChangedMessage: {
    id: 'app.chat.ownUserNameChangedMessage',
    description: 'message sent to all chat informing about own user name change',
  },
});

const propTypes = {
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  onConfirm: PropTypes.func.isRequired,
  mountModal: PropTypes.func.isRequired,
  user: PropTypes.shape({
    userId: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  }).isRequired,
};

// 30 seems to be a good max length, but could be anything else
const USERNAME_MAX_LENGTH = 30;

function ChangeUserNameModal(props) {
  const {
    mountModal,
    onConfirm,
    user,
    intl,
  } = props;

  const currentUserName = Users.findOne({ userId: Auth.userID }).name;

  const [usernameValidationErrorMessage, setUsernameValidationErrorMessage] = useState('');
  const sanitizeUsernameBeforeChanging = (newlyTypedInUsername) => {
    if (newlyTypedInUsername.length > USERNAME_MAX_LENGTH) {
      setUsernameValidationErrorMessage(intl.formatMessage(messages.changeUserNameValidationError));
      return;
    }
    // stripping off any html tags
    const strippedUsername = SanitizeHTML(newlyTypedInUsername, {
      allowedTags: [],
      allowedAttributes: {},
    });
    onConfirm(user.userId, strippedUsername,
      currentUserName === user.name
        ? intl.formatMessage(messages.ownUserNameChangedMessage, {
          0: user.name,
          1: strippedUsername,
        })
        : intl.formatMessage(messages.userNameChangedMessage, {
          0: user.name,
          1: strippedUsername,
          2: currentUserName,
        }));
    mountModal(null);
  };

  return (
    <Modal
      overlayClassName={styles.overlay}
      className={styles.modal}
      onRequestClose={() => mountModal(null)}
      hideBorder
    >
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.title}>
            {intl.formatMessage(messages.changeUserNameTitle, { 0: user.name })}
          </div>
        </div>
        <div className={styles.newUsernameInput}>
          <TextInput
            send={(newlyTypedInUsername) => sanitizeUsernameBeforeChanging(newlyTypedInUsername)}
            onTextChange={() => setUsernameValidationErrorMessage('')}
            placeholder={user.name}
            id="newUserNameInput"
            aria-label={intl.formatMessage(messages.changeUserNameDesc, { 0: user.name })}
          />
          <div aria-hidden className={styles.description}>
            {intl.formatMessage(messages.changeUserNameDesc, { 0: user.name })}
          </div>
          <div aria-hidden className={styles.errorLabel}>
            {usernameValidationErrorMessage}
          </div>
        </div>

        <div className={styles.footer}>
          <Button
            label={intl.formatMessage(messages.cancelLabel)}
            className={styles.dismissBtn}
            onClick={() => mountModal(null)}
          />
        </div>
      </div>
    </Modal>
  );
}

ChangeUserNameModal.propTypes = propTypes;
export default withModalMounter(ChangeUserNameModal);
