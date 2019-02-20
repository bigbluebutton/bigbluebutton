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
  elementName: PropTypes.string,
};

const defaultProps = {
  dark: false,
  elementName: '',
};

const DownloadPresentationButton = ({
  intl, handleDownloadPresentation, dark, elementName,
}) => {
  const formattedLabel = intl.formatMessage(
    intlMessages.downloadPresentationButton,
    ({ 0: elementName ? elementName.toLowerCase() : '' }),
  );

  return (
    <div className={cx(styles.wrapper, dark ? styles.dark : styles.light)}>
      <Button
        color="default"
        icon="template_download"
        size="sm"
        onClick={handleDownloadPresentation}
        label={formattedLabel}
        hideLabel
        circle
        className={styles.button}
      />
    </div>
  );
};

DownloadPresentationButton.propTypes = propTypes;
DownloadPresentationButton.defaultProps = defaultProps;

export default injectIntl(DownloadPresentationButton);
