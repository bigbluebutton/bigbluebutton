import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl } from 'react-intl';
import FocusTrap from 'focus-trap-react';
import Styled from './styles';

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
  headerPosition: PropTypes.string,
  shouldCloseOnOverlayClick: PropTypes.bool,
  shouldShowCloseButton: PropTypes.bool,
  overlayClassName: PropTypes.string,
  modalisOpen: PropTypes.bool,
};

const defaultProps = {
  title: '',
  dismiss: {
    callback: null,
  },
  shouldCloseOnOverlayClick: true,
  shouldShowCloseButton: true,
  overlayClassName: 'modalOverlay',
  headerPosition: 'inner',
  modalisOpen: false,
};

class ModalSimple extends Component {
  constructor(props) {
    super(props);
    this.modalRef = React.createRef();
    this.handleDismiss = this.handleDismiss.bind(this);
    this.handleRequestClose = this.handleRequestClose.bind(this);
    this.handleOutsideClick = this.handleOutsideClick.bind(this);
  }

  componentDidMount() {
    document.addEventListener('mousedown', this.handleOutsideClick, false);
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.handleOutsideClick, false);
  }

  handleDismiss() {
    const { modalHide, dismiss } = this.props;
    if (!dismiss || !modalHide) return;
    modalHide(dismiss.callback);
  }

  handleRequestClose(event) {
    const { onRequestClose } = this.props;
    const closeModal = onRequestClose || this.handleDismiss;

    closeModal();

    if (event && event.type === 'click') {
      setTimeout(() => {
        if (document.activeElement) {
          document.activeElement.blur();
        }
      }, 0);
    }
  }

  handleOutsideClick(e) {
    const { modalisOpen } = this.props;
    if (this.modalRef.current && !this.modalRef.current.contains(e.target) && modalisOpen) {
      this.handleRequestClose(e);
    }
  }

  render() {
    const {
      id,
      intl,
      title,
      hideBorder,
      dismiss,
      className,
      modalisOpen,
      onRequestClose,
      shouldShowCloseButton,
      contentLabel,
      headerPosition,
      'data-test': dataTest,
      children,
      ...otherProps
    } = this.props;

    return (
      <Styled.SimpleModal
        id={id || 'simpleModal'}
        isOpen={modalisOpen}
        className={className}
        onRequestClose={this.handleRequestClose}
        contentLabel={title || contentLabel}
        dataTest={dataTest}
        {...otherProps}
      >
        <FocusTrap active={modalisOpen} focusTrapOptions={{ initialFocus: false }}>
          <div ref={this.modalRef}>
            <Styled.Header
              hideBorder={hideBorder}
              headerPosition={headerPosition}
              shouldShowCloseButton={shouldShowCloseButton}
              modalDismissDescription={intl.formatMessage(intlMessages.modalCloseDescription)}
              closeButtonProps={{
                label: intl.formatMessage(intlMessages.modalClose),
                'aria-label': `${intl.formatMessage(intlMessages.modalClose)} ${title || contentLabel}`,
                onClick: this.handleRequestClose,
              }}
            >
              {title || ''}
            </Styled.Header>
            <Styled.Content>
              {children}
            </Styled.Content>
          </div>
        </FocusTrap>
      </Styled.SimpleModal>
    );
  }
}

ModalSimple.propTypes = propTypes;
ModalSimple.defaultProps = defaultProps;

export default injectIntl(ModalSimple);
