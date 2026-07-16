import React, { Component } from 'react';
import { defineMessages } from 'react-intl';
import PropTypes from 'prop-types';
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
  confirmButtonColor: PropTypes.string,
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
      triggeredFocus: false,
    };
    this.cancelButtonRef = React.createRef();
  }

  componentDidUpdate() {
    const { triggeredFocus } = this.state;

    if (!triggeredFocus && this.cancelButtonRef.current) {
      this.cancelButtonRef.current.children[0].focus();
      this.setState({ triggeredFocus: true });
    }
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
              <Styled.ConfirmationButton
                color={confirmButtonColor}
                label={confirmButtonLabel || intl.formatMessage(messages.yesLabel)}
                disabled={disableConfirmButton}
                data-test={confirmButtonDataTest}
                onClick={() => {
                  onConfirm(confirmParam, checked);
                  setIsOpen(false);
                }}
              />
            )}
            {!hideCancelButton && (
              <div ref={this.cancelButtonRef}>
                <Styled.CancelButton
                  color="secondary"
                  label={cancelButtonLabel || intl.formatMessage(messages.noLabel)}
                  onClick={handleClose}
                />
              </div>
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
