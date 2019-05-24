import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import Button from '/imports/ui/components/button/component';
import cx from 'classnames';
import { defineMessages, injectIntl } from 'react-intl';
import ModalBase, { withModalState } from '../base/component';
import { styles } from './styles.scss';

const intlMessages = defineMessages({
  modalClose: {
    id: 'app.modal.close',
    description: 'Close',
  },
  modalCloseDescription: {
    id: 'app.modal.close.description',
    description: 'Disregards changes and closes the modal',
  },
  modalDone: {
    id: 'app.modal.confirm',
    description: 'Close',
  },
  modalDoneDescription: {
    id: 'app.modal.confirm.description',
    description: 'Disregards changes and closes the modal',
  },
  newTabLabel: {
    id: 'app.modal.newTab',
    description: 'aria label used to indicate opening a new window',
  },
});

const propTypes = {
  title: PropTypes.string.isRequired,
  confirm: PropTypes.shape({
    callback: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
  }),
  dismiss: PropTypes.shape({
    callback: PropTypes.func,
    disabled: PropTypes.bool,
  }),
  preventClosing: PropTypes.bool,
};

const defaultProps = {
  shouldCloseOnOverlayClick: false,
  confirm: {
    disabled: false,
  },
  dismiss: {
    disabled: false,
  },
  preventClosing: false,
};

class ModalFullscreen extends PureComponent {
  handleAction(name) {
    const action = this.props[name];
    return this.props.modalHide(action.callback);
  }

  render() {
    const {
      intl,
      title,
      confirm,
      dismiss,
      className,
      modalisOpen,
      preventClosing,
      ...otherProps
    } = this.props;

    const popoutIcon = confirm.icon === 'popout_window';
    let confirmAriaLabel = `${confirm.label || intl.formatMessage(intlMessages.modalDone)} `;
    if (popoutIcon) {
      confirmAriaLabel = `${confirmAriaLabel} ${intl.formatMessage(intlMessages.newTabLabel)}`;
    }

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
              data-test="modalDismissButton"
              className={styles.dismiss}
              label={intl.formatMessage(intlMessages.modalClose)}
              aria-label={`${intl.formatMessage(intlMessages.modalClose)} ${title}`}
              disabled={dismiss.disabled}
              onClick={this.handleAction.bind(this, 'dismiss')}
              aria-describedby="modalDismissDescription"
            />
            <Button
              data-test="modalConfirmButton"
              color="primary"
              className={popoutIcon ? cx(styles.confirm, styles.popout) : styles.confirm}
              label={confirm.label}
              aria-label={confirmAriaLabel}
              disabled={confirm.disabled}
              onClick={this.handleAction.bind(this, 'confirm')}
              aria-describedby="modalConfirmDescription"
              icon={confirm.icon || null}
              iconRight={popoutIcon}
            />
          </div>
        </header>
        <div className={styles.content}>
          {this.props.children}
        </div>
        <div id="modalDismissDescription" hidden>{intl.formatMessage(intlMessages.modalCloseDescription)}</div>
        <div id="modalConfirmDescription" hidden>{intl.formatMessage(intlMessages.modalDoneDescription)}</div>
      </ModalBase>
    );
  }
}

ModalFullscreen.propTypes = propTypes;
ModalFullscreen.defaultProps = defaultProps;

export default withModalState(injectIntl(ModalFullscreen));
