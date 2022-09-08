import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { defineMessages, injectIntl } from 'react-intl';
import Service from './service';
import Styled from './styles';

const DEBOUNCE_TIMEOUT = 15000;
const DEBOUNCE_OPTIONS = {
  leading: true,
  trailing: false,
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
}) => (amIPresenter
  ? (
    <Styled.ConvertAndUpload
      onClick={_.debounce(() => Service.convertAndUpload(), DEBOUNCE_TIMEOUT, DEBOUNCE_OPTIONS)}
      label={intl.formatMessage(intlMessages.convertAndUploadLabel)}
      icon="upload"
    />
  )
  : null);

ConverterButtonComponent.propTypes = propTypes;

export default injectIntl(ConverterButtonComponent);
