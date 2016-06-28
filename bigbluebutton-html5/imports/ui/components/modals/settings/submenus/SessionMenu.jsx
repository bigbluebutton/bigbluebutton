import React from 'react';
import Modal from 'react-modal';
import Button from '/imports/ui/components/button/component';
import BaseMenu from './BaseMenu';
import Auth from '/imports/ui/services/auth';
import styles from '../../styles';
import classNames from 'classnames';

const customModal = {
  overlay: {
    zIndex: 2000,
  },
  content: {
    width: '25%',
    height: '18%',
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
  },
};

export default class SessionMenu extends BaseMenu {
  constructor(props) {
    super(props);
    this.state = {
      openConfirm: true,
    };
    this.closeLogout = this.closeLogout.bind(this);
  }

  closeLogout() {
    this.setState({ openConfirm: false });
  }

  getContent() {
    return (
      <span>
        <Modal
          isOpen={this.state.openConfirm}
          style={customModal} >
            <span className={classNames(styles.modalHeaderTitle, 'largeFont')}> Leave Session</span>
            <hr className={styles.modalHorizontalRule} />
            <span>Do you want to leave this meeting?</span>
            <br />
            <button onClick={Auth.completeLogout}
                    className={classNames(styles.modalButton, styles.done)}
                    tabindex="0"
                    role="button">Yes</button>
            <button onClick={this.closeLogout}
                    className={classNames(styles.modalButton, styles.close)}
                    tabindex="1"
                    role="button">No</button>
        </Modal>
      </span>
    );
  }
};
