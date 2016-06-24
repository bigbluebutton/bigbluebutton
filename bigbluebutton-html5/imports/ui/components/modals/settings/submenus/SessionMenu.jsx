import React from 'react';
import Modal from 'react-modal';
import Button from '/imports/ui/components/button/component';
import BaseMenu from './BaseMenu';
import { callServer } from '/imports/ui/services/api';
import Auth from '/imports/ui/services/auth';
import Storage from '/imports/ui/services/storage';
import styles from '../../styles';
import classNames from 'classnames';


const customStyles = {
  overlay: {
    zIndex: 2000,
  },

  content : {
    width                 : '35%',
    height                : '18%',
    top                   : '50%',
    left                  : '50%',
    right                 : 'auto',
    bottom                : 'auto',
    marginRight           : '-50%',
    transform: 'translate(-50%, -50%)',
  }
};

export default class SessionMenu extends BaseMenu {
  constructor(props) {
    super(props);
    this.state = {
      modalIsOpen: true,
    };
    this.closeModal = this.closeModal.bind(this);
    this.afterOpenModal = this.afterOpenModal.bind(this);

  }

  openModal() {
    this.setState({ modalIsOpen: true });
  }

  afterOpenModal() {
  }

  closeModal() {
    this.setState({ modalIsOpen: false });
  }

  logout() {
    let logoutURL = Storage.get('logoutURL');
    callServer('userLogout');
    Auth.clearCredentials(document.location = logoutURL);
  }

  getContent() {
      return (
        <span>
          <Modal
            isOpen={this.state.modalIsOpen}
            onAfterOpen={this.afterOpenModal}
            onRequestClose={this.closeModal}
            shouldCloseOnOverlayClick={false}
            style={customStyles} >
              <span className={classNames(styles.modalHeaderTitle, 'largeFont')}> Leave Session</span>
              <hr className={styles.modalHorizontalRule} />
              <span>Do you want to leave the chat room?</span>
              <br />
              <button onClick={this.logout}
                      className={classNames(styles.modalButton, styles.done)}
                      tabindex="0"
                      role="button">Yes</button>
              <button onClick={this.closeModal}
                      className={classNames(styles.modalButton, styles.close)}
                      tabindex="1"
                      role="button">No</button>
          </Modal>
        </span>
      );
    }
  };
