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
  minimizePresentationLabel: {
    id: 'app.actionsBar.actionsDropdown.minimizePresentationLabel',
    description: '',
  },
  minimizePresentationDesc: {
    id: 'app.actionsBar.actionsDropdown.restorePresentationDesc',
    description: '',
  },
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
  layoutContextDispatch,
  hasPresentation,
  hasExternalVideo,
  hasScreenshare,
}) => {
  let buttonType = 'presentation';
  if (hasExternalVideo) {
    // hack until we have an external-video icon
    buttonType = 'external-video';
  } else if (hasScreenshare) {
    buttonType = 'desktop';
  }

  const isThereCurrentPresentation = hasExternalVideo || hasScreenshare || hasPresentation;
  return (
    <Button
      className={cx(!isLayoutSwapped || styles.btn)}
      icon={`${buttonType}${isLayoutSwapped ? '_off' : ''}`}
      data-test="restorePresentationButton"
      label={intl.formatMessage(isLayoutSwapped ? intlMessages.restorePresentationLabel : intlMessages.minimizePresentationLabel)}
      aria-label={intl.formatMessage(isLayoutSwapped ? intlMessages.restorePresentationLabel : intlMessages.minimizePresentationLabel)}
      aria-describedby={intl.formatMessage(isLayoutSwapped ? intlMessages.restorePresentationDesc : intlMessages.minimizePresentationDesc)}
      description={intl.formatMessage(isLayoutSwapped ? intlMessages.restorePresentationDesc : intlMessages.minimizePresentationDesc)}
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
};

PresentationOptionsContainer.propTypes = propTypes;
export default injectIntl(PresentationOptionsContainer);
