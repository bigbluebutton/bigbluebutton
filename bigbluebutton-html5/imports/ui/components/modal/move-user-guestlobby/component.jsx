import React, { Component } from 'react';
import { defineMessages } from 'react-intl';
import { withModalMounter } from '/imports/ui/components/modal/service';
import Modal from '/imports/ui/components/modal/simple/component';
import Button from '/imports/ui/components/button/component';
import { styles } from '/imports/ui/components/modal/remove-user/styles';

const messages = defineMessages({
    yesLabel: {
      id: 'app.userList.menu.moveUserToGuestLobby.yesLabel',
      description: 'yes button',
    },
    noLabel: {
      id: 'app.userList.menu.moveUserToGuestLobby.noLabel',
      description: 'no button',
    },
    moveToGuestLobbyConfirmTitle: {
      id: 'app.userList.menu.moveToGuestLobbyConfirmation.label',
      description: 'title for moving user to guest lobby confirmation modal',
    },
});

class MoveUserToGuestLobbyModal extends Component {
    constructor(props) {
      super(props);

      this.state = {
        checked: false,
      };
    }

    render() {
      const {
        mountModal, onConfirm, user, title, intl,
      } = this.props;

      const {
        checked,
      } = this.state;

      return (
        <Modal
          overlayClassName={styles.overlay}
          className={styles.modal}
          onRequestClose={() => mountModal(null)}
          hideBorder
          contentLabel={title}
        >
          <div className={styles.container}>
            <div className={styles.header}>
              <div className={styles.title}>
                {intl.formatMessage(messages.moveToGuestLobbyConfirmTitle, { 0: user.name })}
              </div>
            </div>

            <div className={styles.footer}>
              <Button
                color="primary"
                className={styles.confirmBtn}
                label={intl.formatMessage(messages.yesLabel)}
                onClick={() => {
                  onConfirm(user.userId, checked);
                  mountModal(null);
                }}
              />
              <Button
                label={intl.formatMessage(messages.noLabel)}
                className={styles.dismissBtn}
                onClick={() => mountModal(null)}
              />
            </div>
          </div>
        </Modal>
      );
    }
}

export default withModalMounter(MoveUserToGuestLobbyModal);

