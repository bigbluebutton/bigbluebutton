import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import Modal from 'react-modal';
import Button from '/imports/ui/components/button/component';
import BaseMenu from '../base/component';
import Auth from '/imports/ui/services/auth';
import styles from '../../../styles';
import classNames from 'classnames';

const customModal = {
  overlay: {
    zIndex: 1000,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  content: {
    width: '25%',
    height: 'auto',
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
          style={customModal}
          onRequestClose={this.closeLogout}
          tabIndex="-1">
            <span className={classNames(styles.modalHeaderTitle, 'largeFont')}> Leave Session</span>
            <br />
            <br />
            <hr />
            <span>Do you want to leave this meeting?</span>
            <br />
            <Button onClick={Auth.completeLogout}
                    className={styles.modalBtn}
                    tabIndex='7'
                    label='Yes'
                    aria-labelledby="logout_okay"
                    aria-describedby="logout_okay"
                    role="button" />
            <Button onClick={this.closeLogout}
                    className={styles.modalBtn}
                    tabIndex='8'
                    label='No'
                    aria-labelledby="logout_cancel"
                    aria-describedby="logout_cancel"
                    role="button" />
        </Modal>
      </span>
    );
  }
};
