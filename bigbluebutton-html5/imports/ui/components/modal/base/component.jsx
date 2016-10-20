import React, { Component, PropTypes } from 'react';
import ReactModal from 'react-modal';
import styles from './styles.scss';
import cx from 'classnames';

const propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onShow: PropTypes.func,
  onHide: PropTypes.func,
};

const defaultProps = {
  isOpen: false,
};

export default class ModalBase extends Component {
  constructor(props) {
    super(props);

    this.handleAfterOpen = this.handleAfterOpen.bind(this);
    this.handleRequestClose = this.handleRequestClose.bind(this);
  }

  handleAfterOpen() {
    const { onShow } = this.props;
    if (onShow) {
      onShow.call(this, ...arguments);
    }
  }

  handleRequestClose() {
    const { onHide } = this.props;
    if (onHide) {
      onHide.call(this, ...arguments);
    }
  }

  render() {
    const {
      isOpen,
      onShow,
      onHide,
      className,
    } = this.props;

    return (
      <ReactModal
      className={cx(styles.modal, className)}
      overlayClassName={styles.overlay}
      portalClassName={styles.portal}
      isOpen={isOpen}
      onAfterOpen={this.handleAfterOpen}
      onRequestClose={this.handleRequestClose}>
        {this.props.children}
      </ReactModal>
    );
  }
};

ModalBase.propTypes = propTypes;
ModalBase.defaultProps = defaultProps;
