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
  setRandomUser: PropTypes.func.isRequired,
  isSelectedUser: PropTypes.bool.isRequired,
  getActiveRandomUser: PropTypes.func.isRequired,
  getRandomUser: PropTypes.func.isRequired,
};

class RandomUserSelect extends Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedUser: props.getRandomUser(),
    };

    this.findNewUser = this.findNewUser.bind(this);
  }

  componentDidMount() {
    const { setRandomUser, isSelectedUser } = this.props;
    const { selectedUser } = this.state;
    if (!isSelectedUser && selectedUser) setRandomUser(selectedUser.userId);
  }

  findNewUser() {
    const { selectedUser } = this.state;
    const { getRandomUser, numAvailableViewers } = this.props;
    const user = getRandomUser();
    if (user.userId === selectedUser.userId && numAvailableViewers > 1) {
      return this.findNewUser();
    }
    return user;
  }

  render() {
    const {
      intl,
      mountModal,
      numAvailableViewers,
      setRandomUser,
      isSelectedUser,
      getActiveRandomUser,
    } = this.props;

    const { selectedUser } = this.state;

    let viewElement = null;
    let userData = null;
    let avatarColor = selectedUser ? selectedUser.color : null;
    let userName = selectedUser ? selectedUser.name : null;

    if (isSelectedUser) {
      userData = getActiveRandomUser();
      avatarColor = userData.color;
      userName = userData.name;
    }

    viewElement = numAvailableViewers < 1 ? (
      <div className={styles.modalViewContainer}>
        <div className={styles.modalViewTitle}>
          {intl.formatMessage(messages.randUserTitle)}
        </div>
        <div>{intl.formatMessage(messages.noViewers)}</div>
      </div>
    ) : (
      <div className={styles.modalViewContainer}>
        <div className={styles.modalViewTitle}>
          {isSelectedUser
            ? `${intl.formatMessage(messages.selected)}`
            : `${intl.formatMessage(messages.randUserTitle)}`
          }
        </div>
        <div aria-hidden className={styles.modalAvatar} style={{ backgroundColor: `${avatarColor}` }}>
          {userName.slice(0, 2)}
        </div>
        <div className={styles.selectedUserName}>
          {userName}
        </div>
        {!isSelectedUser
          && (
          <Button
            label={intl.formatMessage(messages.reselect)}
            color="primary"
            size="md"
            className={styles.selectBtn}
            onClick={() => {
              this.setState({
                selectedUser: this.findNewUser(),
              }, () => {
                const { selectedUser: updatedUser } = this.state;
                return setRandomUser(updatedUser.userId);
              });
            }}
          />
          )
        }
      </div>
    );

    return (
      <Modal
        hideBorder
        onRequestClose={() => {
          if (isSelectedUser) setRandomUser('');
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
