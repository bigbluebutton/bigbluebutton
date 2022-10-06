import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { defineMessages, injectIntl } from 'react-intl';
import Service from './service';
import Styled from './styles';
import { useState } from 'react';

const DEBOUNCE_TIMEOUT = 15000;
const DEBOUNCE_OPTIONS = {
  leading: true,
  trailing: false,
  maxWait: DEBOUNCE_TIMEOUT,
};

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
      onClick={_.debounce(() => {
        setConverterButtonDisabled(true);
        setTimeout(() => setConverterButtonDisabled(false), DEBOUNCE_TIMEOUT);
        return Service.convertAndUpload()}, DEBOUNCE_TIMEOUT, DEBOUNCE_OPTIONS)}
      label={intl.formatMessage(intlMessages.convertAndUploadLabel)}
      icon="upload"
    />
  )
  : null)};

ConverterButtonComponent.propTypes = propTypes;

export default injectIntl(ConverterButtonComponent);
