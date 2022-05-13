import React, { Component } from 'react';
import { defineMessages } from 'react-intl';
import { withModalMounter } from '/imports/ui/components/common/modal/service';
import PropTypes from 'prop-types';
import Styled from './styles';

const messages = defineMessages({
  yesLabel: {
    id: 'app.endMeeting.yesLabel',
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
};

const defaultProps = {
  confirmButtonColor: 'primary',
  disableConfirmButton: false,
  description: '',
};

class ConfirmationModal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      checked: false,
    };
  }

  render() {
    const {
      intl,
      mountModal,
      onConfirm,
      title,
      titleMessageId,
      titleMessageExtra,
      checkboxMessageId,
      confirmButtonColor,
      confirmButtonDataTest,
      confirmParam,
      disableConfirmButton,
      description,
    } = this.props;

    const {
      checked,
    } = this.state;

    const hasCheckbox = !!checkboxMessageId;

    return (
      <Styled.ConfirmationModal
        onRequestClose={() => mountModal(null)}
        hideBorder
        contentLabel={title}
      >
        <Styled.Container>
          <Styled.Header>
            <Styled.Title>
              { title || intl.formatMessage({ id: titleMessageId }, { 0: titleMessageExtra })}
            </Styled.Title>
          </Styled.Header>
          <Styled.Description>
            <Styled.DescriptionText>
              {description}
            </Styled.DescriptionText>
            { hasCheckbox ? (
              <label htmlFor="confirmationCheckbox" key="confirmation-checkbox">
                <Styled.Checkbox
                  type="checkbox"
                  id="confirmationCheckbox"
                  onChange={() => this.setState({ checked: !checked })}
                  checked={checked}
                  aria-label={intl.formatMessage({ id: checkboxMessageId })}
                />
                <span aria-hidden>{intl.formatMessage({ id: checkboxMessageId })}</span>
              </label>
            ) : null }
          </Styled.Description>

          <Styled.Footer>
            <Styled.ConfirmationButton
              color={confirmButtonColor}
              label={intl.formatMessage(messages.yesLabel)}
              disabled={disableConfirmButton}
              data-test={confirmButtonDataTest}
              onClick={() => {
                onConfirm(confirmParam, checked);
                mountModal(null);
              }}
            />
            <Styled.ConfirmationButton
              label={intl.formatMessage(messages.noLabel)}
              onClick={() => mountModal(null)}
            />
          </Styled.Footer>
        </Styled.Container>
      </Styled.ConfirmationModal>
    );
  }
}

ConfirmationModal.propTypes = propTypes;
ConfirmationModal.defaultProps = defaultProps;

export default withModalMounter(ConfirmationModal);
