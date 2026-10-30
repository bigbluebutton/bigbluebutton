import React from 'react';
import PropTypes from 'prop-types';
import { defineMessages, useIntl } from 'react-intl';
import ModalSimple from '/imports/ui/components/common/modal/simple/component';
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
    <ModalSimple
      title={intl.formatMessage(intlMessages.title)}
      isOpen={isOpen}
      onRequestClose={onCancel}
      noFooter={false}
      footerContent={(
        <>
          <Styled.FooterButton
            variant="secondary"
            dataTest="unsavedChangesCancel"
            label={intl.formatMessage(intlMessages.cancelLabel)}
            onClick={onCancel}
          />
          <Styled.FooterButton
            variant="primary"
            dataTest="unsavedChangesIgnore"
            label={intl.formatMessage(intlMessages.ignoreButtonLabel)}
            onClick={onConfirm}
          />
        </>
      )}
    >
      <Styled.Text>
        {intl.formatMessage(intlMessages.message)}
      </Styled.Text>
      <Styled.IgnoreText>
        {intl.formatMessage(intlMessages.ignoreMessage)}
      </Styled.IgnoreText>
    </ModalSimple>
  );
};

UnsavedChangesModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onCancel: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
};

export default UnsavedChangesModal;
