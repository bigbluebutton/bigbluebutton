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
};

const defaultProps = {
  confirmButtonColor: 'primary',
  disableConfirmButton: false,
  description: '',
  hideConfirmButton: false,
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

    return (
      <Styled.ConfirmationModal
        onRequestClose={() => setIsOpen(false)}
        contentLabel={title}
        title={title}
        {...{
          isOpen,
          onRequestClose,
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
            <div ref={this.cancelButtonRef}>
              <Styled.CancelButton
                color="secondary"
                label={cancelButtonLabel || intl.formatMessage(messages.noLabel)}
                onClick={() => setIsOpen(false)}
              />
            </div>
          </Styled.Footer>
        </Styled.Container>
      </Styled.ConfirmationModal>
    );
  }
}

ConfirmationModal.propTypes = propTypes;
ConfirmationModal.defaultProps = defaultProps;

export default ConfirmationModal;
