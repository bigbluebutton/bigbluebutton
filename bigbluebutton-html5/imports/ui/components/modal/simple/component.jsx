import React, { Component } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import Button from '/imports/ui/components/button/component';
import { defineMessages, injectIntl } from 'react-intl';
import ModalBase, { withModalState } from '../base/component';
import { styles } from './styles';

const intlMessages = defineMessages({
  modalClose: {
    id: 'app.modal.close',
    description: 'Close',
  },
  modalCloseDescription: {
    id: 'app.modal.close.description',
    description: 'Disregards changes and closes the modal',
  },
});

const propTypes = {
  title: PropTypes.string,
  dismiss: PropTypes.shape({
    callback: PropTypes.func,
  }),
};

const defaultProps = {
  shouldCloseOnOverlayClick: true,
  shouldShowCloseButton: true,
  overlayClassName: styles.overlay,
};

class ModalSimple extends Component {
  constructor(props) {
    super(props);
    this.handleDismiss = this.handleDismiss.bind(this);
  }

  handleDismiss() {
    const {
      modalHide,
      dismiss,
    } = this.props;
    if (!dismiss || !modalHide) return;
    modalHide(dismiss.callback);
  }

  render() {
    const {
      intl,
      title,
      hideBorder,
      dismiss,
      className,
      modalisOpen,
      onRequestClose,
      shouldShowCloseButton,
      contentLabel,
      ...otherProps
    } = this.props;

    const closeModel = (onRequestClose || this.handleDismiss);

    return (
      <ModalBase
        isOpen={modalisOpen}
        className={cx(className, styles.modal)}
        onRequestClose={closeModel}
        contentLabel={title || contentLabel}
        {...otherProps}
      >
        <header className={hideBorder ? styles.headerNoBorder : styles.header}>
          <h1 className={styles.title}>{title}</h1>
          {shouldShowCloseButton ? (
            <Button
              className={styles.dismiss}
              label={intl.formatMessage(intlMessages.modalClose)}
              aria-label={`${intl.formatMessage(intlMessages.modalClose)} ${title || contentLabel}`}
              icon="close"
              circle
              hideLabel
              onClick={closeModel}
              aria-describedby="modalDismissDescription"
            />
          ) : null}
        </header>
        <div className={styles.content}>
          {this.props.children}
        </div>
        <div id="modalDismissDescription" hidden>{intl.formatMessage(intlMessages.modalCloseDescription)}</div>
      </ModalBase>
    );
  }
}

ModalSimple.propTypes = propTypes;
ModalSimple.defaultProps = defaultProps;

export default withModalState(injectIntl(ModalSimple));
