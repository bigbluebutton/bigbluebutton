import React, { Component, PropTypes } from 'react';
import { withModalBase } from '../base/component';
import Button from '/imports/ui/components/button/component';
import styles from './styles.scss';
import cx from 'classnames';

const propTypes = {
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
  shouldCloseOnOverlayClick: false,
  confirm: {
    label: 'Done',
    description: 'Saves changes and closes the modal',
  },
  dismiss: {
    label: 'Cancel',
    description: 'Disregards changes and closes the modal',
  },
};

class ModalFullscreen extends Component {
  handleAction(name) {
    const action = this.props[name];
    this.props.hide(action.callback);
  }

  render() {
    const {
      title,
      dismiss,
      confirm,
    } = this.props;

    return (
      <div>
        <header className={styles.header}>
          <h1 className={styles.title}>{title}</h1>
          <div className={styles.actions}>
            <Button
              className={styles.dismiss}
              label={dismiss.label}
              onClick={this.handleAction.bind(this, 'dismiss')}
              aria-describedby={'modalDismissDescription'}
              tabIndex={0} />
            <Button
              color={'primary'}
              className={styles.confirm}
              label={confirm.label}
              onClick={this.handleAction.bind(this, 'confirm')}
              aria-describedby={'modalConfirmDescription'}
              tabIndex={0} />
          </div>
        </header>
        <div className={styles.content}>
          {this.props.children}
        </div>
        <div id="modalDismissDescription" hidden>{dismiss.description}</div>
        <div id="modalConfirmDescription" hidden>{confirm.description}</div>
      </div>
    );
  }
};

ModalFullscreen.propTypes = propTypes;
ModalFullscreen.defaultProps = defaultProps;

export default withModalBase(ModalFullscreen);
