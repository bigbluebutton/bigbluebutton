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
    zIndex: 2000,
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
            <hr />
            <span>Do you want to leave this meeting?</span>
            <br />
            <Button onClick={Auth.completeLogout}
                    className={classNames(styles.modalBtn, styles.done)}
                    tabIndex='7'
                    aria-labelledby="logout_okay"
                    aria-describedby="logout_okay"
                    role="button">Yes</Button>
            <Button onClick={this.closeLogout}
                    className={classNames(styles.modalBtn, styles.close)}
                    tabIndex='8'
                    aria-labelledby="logout_cancel"
                    aria-describedby="logout_cancel"
                    role="button">No</Button>
        </Modal>
      </span>
    );
  }
};
