import React from 'react';
import { defineMessages } from 'react-intl';
import { withModalMounter } from '/imports/ui/components/modal/service';
import Modal from '/imports/ui/components/modal/simple/component';
import Button from '/imports/ui/components/button/component';
import PropTypes from 'prop-types';
import { styles } from './styles';
import TextInput from '/imports/ui/components/text-input/component';
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

function ChangeUserNameModal(props) {
  const {
    mountModal,
    onConfirm,
    user,
    intl,
  } = props;

  const currentUserName = Users.findOne({ userId: Auth.userID }).name;

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
            send={(newlyTypedInUsername) => {
              onConfirm(user.userId, newlyTypedInUsername,
                currentUserName === user.name
                  ? intl.formatMessage(messages.ownUserNameChangedMessage, {
                    0: user.name,
                    1: newlyTypedInUsername,
                  })
                  : intl.formatMessage(messages.userNameChangedMessage, {
                    0: user.name,
                    1: newlyTypedInUsername,
                    2: currentUserName,
                  }));
              mountModal(null);
            }}
            placeholder={user.name}
            id="newUserNameInput"
            aria-label={intl.formatMessage(messages.changeUserNameDesc, { 0: user.name })}
          />
          <div aria-hidden className={styles.description}>
            {intl.formatMessage(messages.changeUserNameDesc, { 0: user.name })}
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
