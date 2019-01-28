import React, { Component } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import Button from '/imports/ui/components/button/component';
import ModalBase, { withModalState } from '../base/component';
import { styles } from './styles';

const propTypes = {
  title: PropTypes.string,
  dismiss: PropTypes.shape({
    callback: PropTypes.func,
    label: PropTypes.string.isRequired,
    description: PropTypes.string,
  }),
};

const defaultProps = {
  shouldCloseOnOverlayClick: true,
  overlayClassName: styles.overlay,
  dismiss: {
    label: 'Cancel',
    description: 'Disregards changes and closes the modal',
  },
};

class ModalSimple extends Component {
  constructor(props) {
    super(props);
    this.handleDismiss = this.handleDismiss.bind(this);
  }

  handleDismiss() {
    this.props.modalHide(this.props.dismiss.callback);
  }

  render() {
    const {
      title,
      hideBorder,
      dismiss,
      className,
      modalisOpen,
      onRequestClose,
      ...otherProps
    } = this.props;

    const closeModel = (onRequestClose || this.handleDismiss);

    return (
      <ModalBase
        isOpen={modalisOpen}
        className={cx(className, styles.modal)}
        onRequestClose={closeModel}
        contentLabel={title}
        {...otherProps}
      >
        <header className={hideBorder ? styles.headerNoBorder : styles.header}>
          <h1 className={styles.title}>{title}</h1>
          <Button
            className={styles.dismiss}
            label={dismiss.label}
            icon="close"
            circle
            hideLabel
            onClick={closeModel}
            aria-describedby="modalDismissDescription"
          />
        </header>
        <div className={styles.content}>
          {this.props.children}
        </div>
        <div id="modalDismissDescription" hidden>{confirm.description}</div>
      </ModalBase>
    );
  }
}

ModalSimple.propTypes = propTypes;
ModalSimple.defaultProps = defaultProps;

export default withModalState(ModalSimple);
