import React, { memo, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import Button from '/imports/ui/components/button/component';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import { styles } from '../../video-provider/video-button/styles';
import Storage from '../../../services/storage/session';

const intlMessages = defineMessages({
  enableAutoArrange: {
    id: 'app.layout.enableAutoArrange',
    description: 'Join video button label',
  },
  disableAutoArrange: {
    id: 'app.layout.disableAutoArrange',
    description: 'Leave video button label',
  },
  videoButtonDesc: {
    id: 'app.video.videoButtonDesc',
    description: 'video button description',
  },
  videoLocked: {
    id: 'app.video.videoLocked',
    description: 'video disabled label',
  },
});

const propTypes = {
  intl: intlShape.isRequired,
  isDisabled: PropTypes.bool.isRequired,
};

const AutoArrangeButton = ({
  intl,
  isDisabled,
}) => {
  const [autoArrange, setAutoArrange] = useState(true);

  useEffect(() => {
    const storageAutoArrange = Storage.getItem('autoArrange');
    if (storageAutoArrange === undefined || storageAutoArrange === null) {
      Storage.setItem('autoArrange', true);
    } else {
      setAutoArrange(storageAutoArrange);
    }
  }, []);
  
  const handleAutoArrange = () => {
    Storage.setItem('autoArrange', !autoArrange);
    setAutoArrange(!autoArrange);
  };

  const label = autoArrange
    ? intl.formatMessage(intlMessages.disableAutoArrange)
    : intl.formatMessage(intlMessages.enableAutoArrange);

  return (
    <Button
      label={isDisabled ? intl.formatMessage(intlMessages.videoLocked) : label}
      className={cx(styles.button, autoArrange || styles.btn)}
      onClick={handleAutoArrange}
      hideLabel
      aria-label={intl.formatMessage(intlMessages.videoButtonDesc)}
      color={autoArrange ? 'primary' : 'default'}
      icon={autoArrange ? 'multi_whiteboard' : 'multi_whiteboard'}
      ghost={!autoArrange}
      size="lg"
      circle
      disabled={isDisabled}
    />
  );
};

AutoArrangeButton.propTypes = propTypes;

export default injectIntl(memo(AutoArrangeButton));
