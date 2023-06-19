import React from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import PropTypes from 'prop-types';
import Styled from './styles';

const intlMessages = defineMessages({
  downloadPresentationButton: {
    id: 'app.downloadPresentationButton.label',
    description: 'Download presentation label',
  },
});

const propTypes = {
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  handleDownloadPresentation: PropTypes.func.isRequired,
  dark: PropTypes.bool,
};

const defaultProps = {
  dark: false,
};

const DownloadPresentationButton = ({
  intl,
  handleDownloadPresentation,
  dark,
}) => (
  <Styled.ButtonWrapper theme={dark ? 'dark' : 'light'}>
    <Styled.DownloadButton
      data-test="presentationDownload"
      color="default"
      icon="template_download"
      size="sm"
      onClick={handleDownloadPresentation}
      label={intl.formatMessage(intlMessages.downloadPresentationButton)}
      hideLabel
    />
  </Styled.ButtonWrapper>
);

DownloadPresentationButton.propTypes = propTypes;
DownloadPresentationButton.defaultProps = defaultProps;

export default injectIntl(DownloadPresentationButton);
