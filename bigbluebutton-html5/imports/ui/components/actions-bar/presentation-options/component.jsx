import React from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl } from 'react-intl';
import Styled from './styles';
import Session from '/imports/ui/services/storage/in-memory';
import { listItemBgHover } from '/imports/ui/stylesheets/styled-components/palette';
import deviceInfo from '/imports/utils/deviceInfo';

const propTypes = {
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  setPresentationIsOpen: PropTypes.func.isRequired,
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
  presentationIsOpen,
  setPresentationIsOpen,
  layoutContextDispatch,
  hasPresentation,
  hasExternalVideo,
  hasScreenshare,
  hasPinnedSharedNotes,
  hasGenericContent,
  hasCameraAsContent,
  isDarkThemeEnabled,
}) => {
  let buttonType = 'presentation';
  if (hasExternalVideo) {
    // hack until we have an external-video icon
    buttonType = 'external-video';
  } else if (hasScreenshare) {
    buttonType = 'desktop';
  } else if (hasCameraAsContent) {
    buttonType = 'video';
  }

  const isThereCurrentPresentation = hasExternalVideo || hasScreenshare
    || hasPresentation || hasPinnedSharedNotes
    || hasGenericContent || hasCameraAsContent;
  const onlyPresentation = hasPresentation
    && !hasExternalVideo && !hasScreenshare
    && !hasPinnedSharedNotes && !hasGenericContent
    && !hasCameraAsContent;
  return (
    <Styled.PresentationButton
      icon={`${buttonType}${!presentationIsOpen ? '_off' : ''}`}
      label={intl.formatMessage(!presentationIsOpen ? intlMessages.restorePresentationLabel
        : intlMessages.minimizePresentationLabel)}
      aria-label={intl.formatMessage(!presentationIsOpen ? intlMessages.restorePresentationLabel
        : intlMessages.minimizePresentationLabel)}
      aria-describedby={intl.formatMessage(!presentationIsOpen
        ? intlMessages.restorePresentationDesc
        : intlMessages.minimizePresentationDesc)}
      description={intl.formatMessage(!presentationIsOpen ? intlMessages.restorePresentationDesc
        : intlMessages.minimizePresentationDesc)}
      hideLabel
      circle
      size={deviceInfo.isMobile ? 'md' : 'lg'}
      onClick={(e) => {
        e.currentTarget.blur();
        setPresentationIsOpen(layoutContextDispatch, !presentationIsOpen);
        if (onlyPresentation) {
          Session.setItem('presentationLastState', !presentationIsOpen);
        }
      }}
      id="restore-presentation"
      disabled={!isThereCurrentPresentation}
      data-test={!presentationIsOpen ? 'restorePresentation' : 'minimizePresentation'}
      $isDarkThemeEnabled={isDarkThemeEnabled}
      hoverColor={listItemBgHover}
    />
  );
};

PresentationOptionsContainer.propTypes = propTypes;
export default injectIntl(PresentationOptionsContainer);
