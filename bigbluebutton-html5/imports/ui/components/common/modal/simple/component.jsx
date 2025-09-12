import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl } from 'react-intl';
import FocusTrap from 'focus-trap-react';
import Styled from './styles';
import deviceInfo from '/imports/utils/deviceInfo';

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
  modalIsOpen: PropTypes.bool,
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
  modalIsOpen: false,
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
    const { modalIsOpen } = this.props;
    if (this.modalRef.current && e.target?.contains(this.modalRef.current) && modalIsOpen) {
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
      modalIsOpen,
      onRequestClose,
      shouldShowCloseButton,
      contentLabel,
      headerPosition,
      'data-test': dataTest,
      children,
      anchorElement,
      ...otherProps
    } = this.props;

    let modalStyles = {};

    if (anchorElement) {
      // if anchorElement is provided, position of the modal to be centered below it
      const { isMobile } = deviceInfo;

      const marginX = 10;
      const anchorRect = anchorElement.getBoundingClientRect();
      const anchorCenterX = anchorRect.left + anchorRect.width / 2;
      const modalWidth = 600;
      const modalLeft = Math.max(anchorCenterX - modalWidth / 2, marginX);
      const windowWidth = document.documentElement.clientWidth;

      modalStyles = {
        content: {
          top: `${anchorRect.bottom + window.scrollY + 10}px`,
          left: isMobile ? null : `${modalLeft + window.scrollX}px`,
          overflow: 'visible',
          position: 'fixed',
          maxWidth: windowWidth - (isMobile ? 0 : modalLeft + window.scrollX) - marginX * 2,
        },
      };
    }

    return (
      <Styled.SimpleModal
        id={id || 'simpleModal'}
        isOpen={modalIsOpen}
        className={className}
        onRequestClose={this.handleRequestClose}
        contentLabel={title || contentLabel}
        dataTest={dataTest}
        style={modalStyles}
        {...otherProps}
      >
        <FocusTrap active={modalIsOpen} focusTrapOptions={{ initialFocus: false, fallbackFocus: '#fallback-element' }}>
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
              <div id="fallback-element" tabIndex="-1" />
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
