import React from 'react';
import PropTypes from 'prop-types';
import { defineMessages, useIntl } from 'react-intl';
import Styled from './styles';

const intlMessages = defineMessages({
  title: {
    id: 'app.settings.unsavedChanges.title',
    description: 'Title for the unsaved changes confirmation modal',
  },
  message: {
    id: 'app.settings.unsavedChanges.message',
    description: 'Unsaved changes warning message',
  },
  ignoreMessage: {
    id: 'app.settings.unsavedChanges.ignoreMessage',
    description: 'Description shown when ignoring unsaved changes',
  },
  cancelLabel: {
    id: 'app.settings.main.cancel.label',
    description: 'Cancel button label',
  },
  ignoreButtonLabel: {
    id: 'app.settings.unsavedChanges.ignoreButtonLabel',
    description: 'Ignore changes button label',
  },
});

const UnsavedChangesModal = ({ isOpen, onCancel, onConfirm }) => {
  const intl = useIntl();

  return (
    <Styled.Modal
      title={intl.formatMessage(intlMessages.title)}
      modalIsOpen={isOpen}
      dismiss={{ callback: onCancel }}
      onRequestClose={onCancel}
    >
      <Styled.Content>
        <Styled.Text>
          {intl.formatMessage(intlMessages.message)}
        </Styled.Text>
        <Styled.IgnoreText>
          {intl.formatMessage(intlMessages.ignoreMessage)}
        </Styled.IgnoreText>
        <Styled.ActionsContainer>
          <Styled.ActionButton onClick={onCancel} data-test="unsavedChangesCancel">
            {intl.formatMessage(intlMessages.cancelLabel)}
          </Styled.ActionButton>
          <Styled.ActionButton onClick={onConfirm} data-test="unsavedChangesIgnore">
            {intl.formatMessage(intlMessages.ignoreButtonLabel)}
          </Styled.ActionButton>
        </Styled.ActionsContainer>
      </Styled.Content>
    </Styled.Modal>
  );
};

UnsavedChangesModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onCancel: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
};

export default UnsavedChangesModal;
