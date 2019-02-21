import React from 'react';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
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
  intl: intlShape.isRequired,
  handleDownloadPresentation: PropTypes.func.isRequired,
  dark: PropTypes.bool,
};

const defaultProps = {
  dark: false,
};

const DownloadPresentationButton = ({
  intl, handleDownloadPresentation, dark,
}) => (
  <div className={cx(styles.wrapper, dark ? styles.dark : styles.light)}>
    <Button
      color="default"
      icon="template_download"
      size="sm"
      onClick={handleDownloadPresentation}
      label={intl.formatMessage(intlMessages.downloadPresentationButton)}
      hideLabel
      circle
      className={styles.button}
    />
  </div>
);

DownloadPresentationButton.propTypes = propTypes;
DownloadPresentationButton.defaultProps = defaultProps;

export default injectIntl(DownloadPresentationButton);
