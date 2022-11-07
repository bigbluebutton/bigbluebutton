import React from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl } from 'react-intl';
import Service from './service';
import Styled from './styles';
import { useState } from 'react';

const DEBOUNCE_TIMEOUT = 15000;

const intlMessages = defineMessages({
  convertAndUploadLabel: {
    id: 'app.note.converter-button.convertAndUpload',
    description: 'Export shared notes as a PDF and upload to the main room',
  },
});

const propTypes = {
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  amIPresenter: PropTypes.bool.isRequired,
};

const ConverterButtonComponent = ({
  intl,
  amIPresenter,
}) => {
  [converterButtonDisabled, setConverterButtonDisabled] = useState(false);
  return (amIPresenter
  ? (
    <Styled.ConvertAndUpload
      disabled={converterButtonDisabled}
      onClick={() => {
        setConverterButtonDisabled(true);
        setTimeout(() => setConverterButtonDisabled(false), DEBOUNCE_TIMEOUT);
        return Service.convertAndUpload()}}
      label={intl.formatMessage(intlMessages.convertAndUploadLabel)}
      icon="upload"
      data-test="sendNotesToWhiteboard"
    />
  )
  : null)};

ConverterButtonComponent.propTypes = propTypes;

export default injectIntl(ConverterButtonComponent);
