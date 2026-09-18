import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl } from 'react-intl';
import Styled from './styles';
import {
  createDocumentTitleViewId,
  registerDocumentTitleView,
  unregisterDocumentTitleView,
} from '/imports/ui/components/app/document-title-manager/service';

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
  shouldCloseOnOverlayClick: PropTypes.bool,
  documentTitle: PropTypes.oneOfType([
    PropTypes.bool,
    PropTypes.string,
  ]),
};

const defaultProps = {
  shouldCloseOnOverlayClick: false,
  confirm: {
    disabled: false,
  },
  dismiss: {
    callback: () => {},
    disabled: false,
  },
  preventClosing: false,
  documentTitle: false,
};

class ModalFullscreen extends PureComponent {
  constructor(props) {
    super(props);
    this.previousFocus = null;
    this.documentTitleViewId = createDocumentTitleViewId('fullscreen-modal');
    this.handleAction = this.handleAction.bind(this);
  }

  componentDidMount() {
    this.updateDocumentTitleView();
  }

  componentDidUpdate(prevProps) {
    const { isOpen } = this.props;
    if (!prevProps.isOpen && isOpen) {
      this.previousFocus = document.activeElement;
    }
    this.updateDocumentTitleView();
  }

  componentWillUnmount() {
    unregisterDocumentTitleView(this.documentTitleViewId);
  }

  handleAction(name) {
    const { confirm, dismiss } = this.props;
    const { callback: callBackConfirm } = confirm;
    const { callback: callBackDismiss } = dismiss;

    let callback;

    switch (name) {
      case 'confirm':
        callback = callBackConfirm;
        break;
      case 'dismiss':
        callback = callBackDismiss;
        break;
      default:
        break;
    }

    callback();

    setTimeout(() => {
      if (this.previousFocus && typeof this.previousFocus.focus === 'function'
        && document.body.contains(this.previousFocus)) {
        this.previousFocus.focus();
      }
      this.previousFocus = null;
    }, 0);
  }

  getDocumentTitle() {
    const {
      documentTitle,
      title,
    } = this.props;

    if (!documentTitle) return null;
    if (typeof documentTitle === 'string') return documentTitle;
    return title;
  }

  updateDocumentTitleView() {
    const {
      isOpen,
      preventClosing,
    } = this.props;
    const documentTitle = this.getDocumentTitle();

    if ((isOpen || preventClosing) && documentTitle) {
      registerDocumentTitleView(this.documentTitleViewId, documentTitle);
      return;
    }

    unregisterDocumentTitleView(this.documentTitleViewId);
  }

  render() {
    const {
      intl,
      title,
      confirm,
      dismiss,
      className,
      children,
      documentTitle,
      isOpen,
      preventClosing,
      ...otherProps
    } = this.props;

    const popoutIcon = confirm.icon === 'popout_window';
    let confirmAriaLabel = `${confirm.label || intl.formatMessage(intlMessages.modalDone)} `;
    if (popoutIcon) {
      confirmAriaLabel = `${confirmAriaLabel} ${intl.formatMessage(intlMessages.newTabLabel)}`;
    }

    return (
      <Styled.FullscreenModal
        id="fsmodal"
        isOpen={isOpen || preventClosing}
        contentLabel={title}
        overlayClassName="fullscreenModalOverlay"
        {...otherProps}
      >
        <Styled.Header>
          <Styled.Title>{title}</Styled.Title>
          <Styled.Actions>
            <Styled.DismissButton
              data-test="modalDismissButton"
              label={intl.formatMessage(intlMessages.modalClose)}
              aria-label={`${intl.formatMessage(intlMessages.modalClose)} ${title}`}
              disabled={dismiss.disabled}
              onClick={() => this.handleAction('dismiss')}
              aria-describedby="modalDismissDescription"
              color="secondary"
            />
            <Styled.ConfirmButton
              data-test="modalConfirmButton"
              color="primary"
              label={confirm.label || intl.formatMessage(intlMessages.modalDone)}
              aria-label={confirmAriaLabel}
              disabled={confirm.disabled}
              onClick={() => this.handleAction('confirm')}
              aria-describedby="modalConfirmDescription"
              icon={confirm.icon || null}
              iconRight={popoutIcon}
              popout={popoutIcon ? 'popout' : 'simple'}
            />
          </Styled.Actions>
        </Styled.Header>
        <Styled.Content>
          {children}
        </Styled.Content>
        <div id="modalDismissDescription" hidden>{intl.formatMessage(intlMessages.modalCloseDescription)}</div>
        <div id="modalConfirmDescription" hidden>{intl.formatMessage(intlMessages.modalDoneDescription)}</div>
      </Styled.FullscreenModal>
    );
  }
}

ModalFullscreen.propTypes = propTypes;
ModalFullscreen.defaultProps = defaultProps;

export default injectIntl(ModalFullscreen);
