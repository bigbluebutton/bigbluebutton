import React, { Component, PropTypes } from 'react';
import { clearModal } from '/imports/ui/components/app/service';
import ModalBase from './base/component';
import Button from '../button/component';
import styles from './styles.scss';
import cx from 'classnames';

const propTypes = {
  isOpen: PropTypes.bool.isRequired,
  title: PropTypes.string.isRequired,
  confirm: PropTypes.shape({
    callback: PropTypes.func.isRequired,
    label: PropTypes.string.isRequired,
    description: PropTypes.string,
  }),
  dismiss: PropTypes.shape({
    callback: PropTypes.func,
    label: PropTypes.string.isRequired,
    description: PropTypes.string,
  }),
};

const defaultProps = {
  isOpen: true,
  confirm: {
    label: 'Done',
    description: 'Saves changes and closes the modal',
  },
  dismiss: {
    label: 'Cancel',
    description: 'Disregards changes and closes the modal',
  },
};

export default class Modal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isOpen: this.props.isOpen,
    };

    this.handleDismiss = this.handleDismiss.bind(this);
    this.handleConfirm = this.handleConfirm.bind(this);
  }

  handleDismiss() {
    const { dismiss } = this.props;
    dismiss.callback(...arguments);
    this.setState({ isOpen: false });
    clearModal();
  }

  handleConfirm() {
    const { confirm } = this.props;
    confirm.callback(...arguments);
    this.setState({ isOpen: false });
    clearModal();
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.isOpen !== this.props.isOpen
      && this.state.isOpen !== this.props.isOpen) {
      this.setState({ isOpen: this.props.isOpen });
    }
  }

  render() {
    const {
      title,
      dismiss,
      confirm,
    } = this.props;

    const { isOpen } = this.state;

    return (
      <ModalBase
        className={styles.modal}
        isOpen={isOpen}
        onHide={dismiss.callback}
        onShow={this.props.onShow}
      >
        <header className={styles.header}>
          <h1 className={styles.title}>{title}</h1>
          <div className={styles.actions}>
            <Button
              className={styles.dismiss}
              label={dismiss.label}
              onClick={this.handleDismiss}
              aria-describedby={'modalDismissDescription'}
              tabIndex={1} />
            <Button
              color={'primary'}
              className={styles.confirm}
              label={confirm.label}
              onClick={this.handleConfirm}
              aria-describedby={'modalConfirmDescription'}
              tabIndex={2} />
          </div>
        </header>
        <div className={styles.content}>
          {this.props.children}
        </div>
        <div id="modalDismissDescription" hidden>{dismiss.description}</div>
        <div id="modalConfirmDescription" hidden>{confirm.description}</div>
      </ModalBase>
    );
  }
};

Modal.propTypes = propTypes;
Modal.defaultProps = defaultProps;
