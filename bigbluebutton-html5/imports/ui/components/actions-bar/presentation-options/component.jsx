import React from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl } from 'react-intl';
import Button from '/imports/ui/components/button/component';
import MediaService from '/imports/ui/components/media/service';
import cx from 'classnames';
import { styles } from '../styles';

const propTypes = {
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  toggleSwapLayout: PropTypes.func.isRequired,
};

const intlMessages = defineMessages({
  restorePresentationLabel: {
    id: 'app.actionsBar.actionsDropdown.restorePresentationLabel',
    description: 'Restore Presentation option label',
  },
  restorePresentationDesc: {
    id: 'app.actionsBar.actionsDropdown.restorePresentationDesc',
    description: 'button to restore presentation after it has been closed',
  },
});

const PresentationOptionsContainer = ({
  intl,
  isLayoutSwapped,
  toggleSwapLayout,
  isThereCurrentPresentation,
  layoutContextDispatch,
}) => (
  <Button
    className={cx(styles.button, !isLayoutSwapped || styles.btn)}
    icon="presentation"
    data-test="restorePresentationButton"
    label={intl.formatMessage(intlMessages.restorePresentationLabel)}
    description={intl.formatMessage(intlMessages.restorePresentationDesc)}
    color={!isLayoutSwapped ? "primary" : "default"}
    hideLabel
    circle
    size="lg"
    onClick={() => toggleSwapLayout(layoutContextDispatch)}
    id="restore-presentation"
    ghost={isLayoutSwapped}
    disabled={!isThereCurrentPresentation}
  />
);

PresentationOptionsContainer.propTypes = propTypes;
export default injectIntl(PresentationOptionsContainer);
