import React from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import Button from '/imports/ui/components/button/component';
import cx from 'classnames';
import PropTypes from 'prop-types';
import { styles } from './styles';

const intlMessages = defineMessages({
  downloadPresentationButton: {
    id: 'app.downloadPresentationButton.label',
    description: 'Download presentation label',
  },
});

const propTypes = {
  intl: PropTypes.object.isRequired,
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
}) => {

  const wrapperClassName = cx({
    [styles.wrapper]: true,
    [styles.dark]: dark,
    [styles.light]: !dark
  });

  return (
    <div className={wrapperClassName}>
      <Button
        data-test="presentationDownload"
        color="default"
        icon="template_download"
        size="sm"
        onClick={handleDownloadPresentation}
        label={intl.formatMessage(intlMessages.downloadPresentationButton)}
        hideLabel
        className={cx(styles.button, styles.downloadPresentationButton)}
      />
    </div>
  );
};

DownloadPresentationButton.propTypes = propTypes;
DownloadPresentationButton.defaultProps = defaultProps;

export default injectIntl(DownloadPresentationButton);
