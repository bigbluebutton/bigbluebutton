import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl } from 'react-intl';
import Button from '/imports/ui/components/common/button/component';
import Styled from './styles';

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
      <Styled.AutoplayOverlay>
        <Styled.Title>
          { intl.formatMessage(intlMessages.autoplayAlertDesc) }
        </Styled.Title>
        <Styled.AutoplayOverlayContent>
          <Styled.Label>
            {autoplayBlockedDesc}
          </Styled.Label>
          <Button
            color="primary"
            label={autoplayAllowLabel}
            onClick={handleAllowAutoplay}
            role="button"
            size="lg"
          />
        </Styled.AutoplayOverlayContent>
      </Styled.AutoplayOverlay>
    );
  }
}

AutoplayOverlay.propTypes = propTypes;

export default injectIntl(AutoplayOverlay);
