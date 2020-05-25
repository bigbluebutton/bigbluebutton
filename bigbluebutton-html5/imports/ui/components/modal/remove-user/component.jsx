import React, { Component } from 'react';
import { defineMessages } from 'react-intl';
import PropTypes from 'prop-types';
import { withModalMounter } from '/imports/ui/components/modal/service';
import Modal from '/imports/ui/components/modal/simple/component';
import Button from '/imports/ui/components/button/component';
import { styles } from './styles';

const messages = defineMessages({
  yesLabel: {
    id: 'app.endMeeting.yesLabel',
    description: 'confirm button label',
  },
  noLabel: {
    id: 'app.endMeeting.noLabel',
    description: 'cancel confirm button label',
  },
  removeConfirmTitle: {
    id: 'app.userList.menu.removeConfirmation.label',
    description: 'title for remove user confirmation modal',
  },
  removeConfirmDesc: {
    id: 'app.userlist.menu.removeConfirmation.desc',
    description: 'description for remove user confirmation',
  },
});

const propTypes = {
};

class RemoveUserModal extends Component {
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
              {intl.formatMessage(messages.removeConfirmTitle, { 0: user.name })}
            </div>
          </div>
          <div className={styles.description}>
            <label htmlFor="banUserCheckbox" key="eject-or-ban-user">
              <input
                className={styles.banUserCheckBox}
                type="checkbox"
                id="banUserCheckbox"
                onChange={() => this.setState({ checked: !checked })}
                checked={checked}
                aria-label={intl.formatMessage(messages.removeConfirmDesc)}
              />
              <span aria-hidden>{intl.formatMessage(messages.removeConfirmDesc)}</span>
            </label>
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

RemoveUserModal.propTypes = propTypes;
export default withModalMounter(RemoveUserModal);
