import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl } from 'react-intl';
import { withModalState } from '../base/component';
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
};

const defaultProps = {
  shouldCloseOnOverlayClick: true,
  shouldShowCloseButton: true,
  overlayClassName: 'modalOverlay',
  headerPosition: 'inner',
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
      ...otherProps
    } = this.props;

    const closeModal = (onRequestClose || this.handleDismiss);

    const handleRequestClose = (event) => {
      closeModal();

      if (event) {
        event.persist();

        if (event.type === 'click') {
          setTimeout(() => {
            document.activeElement.blur();
          }, 0);
        }
      }
    }

    return (
      <Styled.SimpleModal
        id="simpleModal"
        isOpen={modalisOpen}
        className={className}
        onRequestClose={handleRequestClose}
        contentLabel={title || contentLabel}
        data={{
          test: dataTest ?? null,
        }}
        {...otherProps}
      >
        <Styled.Header
          hideBorder={hideBorder}
          headerPosition={headerPosition}
          shouldShowCloseButton={shouldShowCloseButton}
          modalDismissDescription={intl.formatMessage(intlMessages.modalCloseDescription)}
          closeButtonProps={{
            label: intl.formatMessage(intlMessages.modalClose),
            'aria-label': `${intl.formatMessage(intlMessages.modalClose)} ${title || contentLabel}`,
            onClick: handleRequestClose,
          }}
        >
          {title}
        </Styled.Header>
        <Styled.Content>
          {this.props.children}
        </Styled.Content>
      </Styled.SimpleModal>
    );
  }
}

ModalSimple.propTypes = propTypes;
ModalSimple.defaultProps = defaultProps;

export default withModalState(injectIntl(ModalSimple));
