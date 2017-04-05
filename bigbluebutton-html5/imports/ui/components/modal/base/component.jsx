import React, { Component, PropTypes } from 'react';
import ReactModal from 'react-modal';
import styles from './styles.scss';

const propTypes = {
  modalClassName: PropTypes.string.isRequired,
  overlayClassName: PropTypes.string.isRequired,
  portalClassName: PropTypes.string.isRequired,
  contentLabel: PropTypes.string.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onShow: PropTypes.func,
  onHide: PropTypes.func,
};

const defaultProps = {
  modalClassName: styles.modal,
  overlayClassName: styles.overlay,
  portalClassName: styles.portal,
  contentLabel: 'Modal',
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
      contentLabel,
      shouldCloseOnOverlayClick,
      modalClassName,
      overlayClassName,
      portalClassName,
    } = this.props;

    return (
      <ReactModal
        className={modalClassName}
        contentLabel={contentLabel}
        shouldCloseOnOverlayClick={shouldCloseOnOverlayClick}
        overlayClassName={overlayClassName}
        portalClassName={portalClassName}
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

export const withModalBase = (ComponentToWrap) =>
  class ModalStateWrapper extends Component {
    constructor(props) {
      super(props);

      this.state = {
        isOpen: props.isOpen || true,
      };

      this.hide = this.hide.bind(this);
    }

    hide(cb) {
      this.setState({ isOpen: false }, cb);
    }

    show(cb) {
      this.setState({ isOpen: true }, cb);
    }

    componentDidUpdate(prevProps, prevState) {
      if (prevState.isOpen !== this.props.isOpen
        && this.state.isOpen !== this.props.isOpen) {
        this.setState({ isOpen: this.props.isOpen });
      }
    }

    render() {
      const { isOpen } = this.state;
      const {
        modalClassName,
        overlayClassName,
        portalClassName,
        contentLabel,
        shouldCloseOnOverlayClick,
        onShow,
        onHide,
        ...modalProps,
      } = this.props;

      return (
        <ModalBase {...{
          isOpen,
          modalClassName,
          overlayClassName,
          portalClassName,
          contentLabel,
          shouldCloseOnOverlayClick,
          onShow,
          onHide,
        }}>
          <ComponentToWrap {...modalProps} hide={this.hide} show={this.show}/>
        </ModalBase>
      );
    }
  };
