import React, { Component } from 'react';
import { defineMessages } from 'react-intl';
import PropTypes from 'prop-types';
import { uniqueId } from '/imports/utils/string-utils';
import Styled from './styles';

const messages = defineMessages({
  yesLabel: {
    id: 'app.confirmationModal.yesLabel',
    description: 'confirm button label',
  },
  noLabel: {
    id: 'app.endMeeting.noLabel',
    description: 'cancel confirm button label',
  },
});

const propTypes = {
  confirmButtonColor: PropTypes.oneOf(['primary', 'danger']),
  disableConfirmButton: PropTypes.bool,
  description: PropTypes.string,
  hideConfirmButton: PropTypes.bool,
  hideCancelButton: PropTypes.bool,
};

const defaultProps = {
  confirmButtonColor: 'primary',
  disableConfirmButton: false,
  description: '',
  hideConfirmButton: false,
  hideCancelButton: false,
};

class ConfirmationModal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      checked: false,
    };
    this.cancelButtonId = uniqueId('confirmationModalCancel-');
    this.focusCancelButton = this.focusCancelButton.bind(this);
  }

  // react-modal mounts the dialog's content after this component has rendered,
  // so the cancel button only exists once the modal reports it has opened.
  focusCancelButton() {
    document.getElementById(this.cancelButtonId)?.focus();
  }

  render() {
    const {
      intl,
      setIsOpen,
      onConfirm,
      title,
      checkboxMessageId,
      confirmButtonColor,
      confirmButtonLabel,
      cancelButtonLabel,
      hideConfirmButton,
      hideCancelButton,
      confirmButtonDataTest,
      confirmParam,
      disableConfirmButton,
      description,
      isOpen,
      onRequestClose,
      priority,
    } = this.props;

    const {
      checked,
    } = this.state;

    const hasCheckbox = !!checkboxMessageId;

    const handleClose = onRequestClose || (() => setIsOpen(false));

    return (
      <Styled.ConfirmationModal
        onRequestClose={handleClose}
        onAfterOpen={this.focusCancelButton}
        contentLabel={title}
        title={title}
        {...{
          isOpen,
          priority,
        }}
      >
        <Styled.Container>
          <Styled.Description>
            <Styled.DescriptionText>
              {description}
            </Styled.DescriptionText>
            { hasCheckbox ? (
              <Styled.Label htmlFor="confirmationCheckbox" key="confirmation-checkbox">
                <Styled.Checkbox
                  type="checkbox"
                  id="confirmationCheckbox"
                  onChange={() => this.setState({ checked: !checked })}
                  checked={checked}
                  aria-label={intl.formatMessage({ id: checkboxMessageId })}
                />
                <span aria-hidden>{intl.formatMessage({ id: checkboxMessageId })}</span>
              </Styled.Label>
            ) : null }
          </Styled.Description>

          <Styled.Footer>
            {!hideConfirmButton && (
              <Styled.FooterButton
                variant="primary"
                color={confirmButtonColor === 'danger' ? 'danger' : 'default'}
                label={confirmButtonLabel || intl.formatMessage(messages.yesLabel)}
                disabled={disableConfirmButton}
                dataTest={confirmButtonDataTest}
                onClick={() => {
                  onConfirm(confirmParam, checked);
                  setIsOpen(false);
                }}
              />
            )}
            {!hideCancelButton && (
              <Styled.FooterButton
                id={this.cancelButtonId}
                variant="secondary"
                dataTest="confirmationModalCancel"
                label={cancelButtonLabel || intl.formatMessage(messages.noLabel)}
                onClick={handleClose}
              />
            )}
          </Styled.Footer>
        </Styled.Container>
      </Styled.ConfirmationModal>
    );
  }
}

ConfirmationModal.propTypes = propTypes;
ConfirmationModal.defaultProps = defaultProps;

export default ConfirmationModal;
