import React from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import Button from '/imports/ui/components/button/component';
import cx from 'classnames';
import { styles } from '../styles';

const propTypes = {
  intl: intlShape.isRequired,
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
  toggleSwapLayout,
}) => (
  <Button
    className={cx(styles.button, styles.presentationButton)}
    icon="presentation"
    label={intl.formatMessage(intlMessages.restorePresentationLabel)}
    description={intl.formatMessage(intlMessages.restorePresentationDesc)}
    color="primary"
    hideLabel
    circle
    size="lg"
    onClick={toggleSwapLayout}
    id="restore-presentation"
  />
);

PresentationOptionsContainer.propTypes = propTypes;
export default injectIntl(PresentationOptionsContainer);
