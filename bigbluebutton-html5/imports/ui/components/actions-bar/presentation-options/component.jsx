import React from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import browser from 'browser-detect';
import Button from '/imports/ui/components/button/component';
import logger from '/imports/startup/client/logger';
import { notify } from '/imports/ui/services/notification';
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

const BROWSER_RESULTS = browser();
const isMobileBrowser = (BROWSER_RESULTS ? BROWSER_RESULTS.mobile : false) ||
  (BROWSER_RESULTS && BROWSER_RESULTS.os ?
    BROWSER_RESULTS.os.includes('Android') : // mobile flag doesn't always work
    false);

const PresentationOptionsContainer = ({
  intl,
  toggleSwapLayout
}) => {

  return <Button
    className={cx(styles.button, styles.presentationButton)}
    icon='presentation'
    label={intl.formatMessage(intlMessages.restorePresentationLabel)}
     description={intl.formatMessage(intlMessages.restorePresentationDesc)}
    color="primary"
    hideLabel
    circle
    size="lg"
    onClick={toggleSwapLayout}
    id='restore-presentation'
  />
};

PresentationOptionsContainer.propTypes = propTypes;
export default injectIntl(PresentationOptionsContainer);
