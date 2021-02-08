import React, { Component } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import PropTypes from 'prop-types';
import Modal from '/imports/ui/components/modal/simple/component';
import Button from '/imports/ui/components/button/component';
import { styles } from './styles';

const messages = defineMessages({
  noViewers: {
    id: 'app.modal.randomUser.noViewers.description',
    description: 'Label displayed when no viewers are avaiable',
  },
  selected: {
    id: 'app.modal.randomUser.selected.description',
    description: 'Label shown to the selected user',
  },
  randUserTitle: {
    id: 'app.modal.randomUser.title',
    description: 'Modal title label',
  },
  reselect: {
    id: 'app.modal.randomUser.reselect.label',
    description: 'select new random user button label',
  },
  ariaModalTitle: {
    id: 'app.modal.randomUser.ariaLabel.title',
    description: 'modal title displayed to screen reader',
  },
});

const propTypes = {
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  mountModal: PropTypes.func.isRequired,
  numAvailableViewers: PropTypes.number.isRequired,
  randomUserReq: PropTypes.func.isRequired,
};

class RandomUserSelect extends Component {
  constructor(props) {
    super(props);

    if (props.currentUser.presenter) {
      props.randomUserReq();
    }
  }

  componentDidUpdate() {
    const { selectedUser, currentUser, mountModal } = this.props;
    if (selectedUser && selectedUser.userId !== currentUser.userId && !currentUser.presenter) {
      mountModal(null);
    }
  }

  render() {
    const {
      intl,
      mountModal,
      numAvailableViewers,
      randomUserReq,
      selectedUser,
      currentUser,
      clearRandomlySelectedUser,
    } = this.props;

    let viewElement;

    if (numAvailableViewers < 1) { // there's no viewers to select from
      // display modal informing presenter that there's no viewers to select from
      viewElement = (
        <div className={styles.modalViewContainer}>
          <div className={styles.modalViewTitle}>
            {intl.formatMessage(messages.randUserTitle)}
          </div>
          <div>{intl.formatMessage(messages.noViewers)}</div>
        </div>
      );
    } else { // viewers are available
      if (!selectedUser) return null; // rendering triggered before selectedUser is available

      // display modal with random user selection
      const amISelectedUser = currentUser.userId === selectedUser.userId;
      viewElement = (
        <div className={styles.modalViewContainer}>
          <div className={styles.modalViewTitle}>
            {amISelectedUser
              ? `${intl.formatMessage(messages.selected)}`
              : `${intl.formatMessage(messages.randUserTitle)}`
            }
          </div>
          <div aria-hidden className={styles.modalAvatar} style={{ backgroundColor: `${selectedUser.color}` }}>
            {selectedUser.name.slice(0, 2)}
          </div>
          <div className={styles.selectedUserName}>
            {selectedUser.name}
          </div>
          {!amISelectedUser
            && (
            <Button
              label={intl.formatMessage(messages.reselect)}
              color="primary"
              size="md"
              className={styles.selectBtn}
              onClick={() => randomUserReq()}
            />
            )
          }
        </div>
      );
    }

    return (
      <Modal
        hideBorder
        onRequestClose={() => {
          if (currentUser.presenter) clearRandomlySelectedUser();
          mountModal(null);
        }}
        contentLabel={intl.formatMessage(messages.ariaModalTitle)}
      >
        {viewElement}
      </Modal>
    );
  }
}

RandomUserSelect.propTypes = propTypes;
export default injectIntl(RandomUserSelect);
