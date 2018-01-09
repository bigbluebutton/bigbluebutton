import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Button from '/imports/ui/components/button/component';
import cx from 'classnames';
import ModalBase, { withModalState } from '../base/component';
import styles from './styles.scss';

const propTypes = {
  title: PropTypes.string.isRequired,
  confirm: PropTypes.shape({
    callback: PropTypes.func.isRequired,
    label: PropTypes.string.isRequired,
    description: PropTypes.string,
    disabled: PropTypes.bool,
  }),
  dismiss: PropTypes.shape({
    callback: PropTypes.func,
    label: PropTypes.string.isRequired,
    description: PropTypes.string,
    disabled: PropTypes.bool,
  }),
  preventClosing: PropTypes.bool,
};

const defaultProps = {
  shouldCloseOnOverlayClick: false,
  confirm: {
    label: 'Done',
    description: 'Saves changes and closes the modal',
    disabled: false,
  },
  dismiss: {
    label: 'Cancel',
    description: 'Disregards changes and closes the modal',
    disabled: false,
  },
  preventClosing: false,
};

class ModalFullscreen extends Component {
  handleAction(name) {
    const action = this.props[name];
    return this.props.modalHide(action.callback);
  }

  render() {
    const {
      title,
      confirm,
      dismiss,
      className,
      modalisOpen,
      preventClosing,
      ...otherProps
    } = this.props;

    return (
      <ModalBase
        isOpen={modalisOpen || preventClosing}
        className={cx(className, styles.modal)}
        contentLabel={title}
        {...otherProps}
      >
        <header className={styles.header}>
          <h1 className={styles.title}>{title}</h1>
          <div className={styles.actions}>
            <Button
              data-test='modalDismissButton'
              className={styles.dismiss}
              label={dismiss.label}
              disabled={dismiss.disabled}
              onClick={this.handleAction.bind(this, 'dismiss')}
              aria-describedby={'modalDismissDescription'}
            />
            <Button
              data-test='modalConfirmButton'
              color={'primary'}
              className={styles.confirm}
              label={confirm.label}
              disabled={confirm.disabled}
              onClick={this.handleAction.bind(this, 'confirm')}
              aria-describedby={'modalConfirmDescription'}
            />
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
}

ModalFullscreen.propTypes = propTypes;
ModalFullscreen.defaultProps = defaultProps;

export default withModalState(ModalFullscreen);
