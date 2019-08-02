import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl } from 'react-intl';
import Button from '/imports/ui/components/button/component';
import { styles } from './styles';

const propTypes = {
  autoplayBlockedDesc: PropTypes.string.isRequired,
  autoplayAllowLabel: PropTypes.string.isRequired,
  handleAllowAutoplay: PropTypes.func.isRequired,
  intl: PropTypes.objectOf(Object).isRequired,
};

const intlMessages = defineMessages({
  autoplayAlertDesc: {
    id: 'app.media.autoplayAlertDesc',
    description: 'Description for the autoplay alert title',
  },
});

class AutoplayOverlay extends PureComponent {
  render() {
    const {
      intl,
      handleAllowAutoplay,
      autoplayBlockedDesc,
      autoplayAllowLabel,
    } = this.props;
    return (
      <div className={styles.autoplayOverlay}>
        <div className={styles.title}>
          { intl.formatMessage(intlMessages.autoplayAlertDesc) }
        </div>
        <div className={styles.autoplayOverlayContent}>
          <div className={styles.label}>
            {autoplayBlockedDesc}
          </div>
          <Button
            color="primary"
            label={autoplayAllowLabel}
            onClick={handleAllowAutoplay}
            role="button"
            size="lg"
          />
        </div>
      </div>
    );
  }
}

AutoplayOverlay.propTypes = propTypes;

export default injectIntl(AutoplayOverlay);
