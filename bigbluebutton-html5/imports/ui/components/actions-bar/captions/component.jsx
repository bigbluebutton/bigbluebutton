import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import CaptionsService from '/imports/ui/components/captions/service';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import { styles } from '/imports/ui/components/actions-bar/styles';
import Button from '/imports/ui/components/button/component';

const propTypes = {
  intl: intlShape.isRequired,
  isCaptionsActive: PropTypes.bool.isRequired,
  handleOnClick: PropTypes.func.isRequired,
};

const intlMessages = defineMessages({
  start: {
    id: 'app.actionsBar.captions.start',
    description: 'Start closed captions option',
  },
  stop: {
    id: 'app.actionsBar.captions.stop',
    description: 'Stop closed captions option',
  },
});

const CaptionsButton = ({ intl, isCaptionsActive, handleOnClick }) => {
  return (
    <Button
      className={cx(styles.button, isCaptionsActive || styles.btn)}
      icon="polling"
      label={intl.formatMessage(isCaptionsActive ? intlMessages.stop : intlMessages.start)}
      color={isCaptionsActive ? 'primary' : 'default'}
      ghost={!isCaptionsActive}
      hideLabel
      circle
      size="lg"
      onClick={handleOnClick}
      id={isCaptionsActive ? 'stop-captions-button' : 'start-captions-button'}
    />
  );
};

CaptionsButton.propTypes = propTypes;
export default injectIntl(CaptionsButton);
