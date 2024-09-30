import React from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl } from 'react-intl';
import Button from '/imports/ui/components/common/button/component';
import Session from '/imports/ui/services/storage/in-memory';
import { ACTIONS, PANELS } from '/imports/ui/components/layout/enums';
import {
  layoutSelectInput,
} from '/imports/ui/components/layout/context';
import { useStorageKey } from '/imports/ui/services/storage/hooks';

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
  const sidebarContent = layoutSelectInput((i) => i.sidebarContent);
  const isChatOpen = sidebarContent.sidebarContentPanel === PANELS.CHAT;
  const PUBLIC_CHAT_ID = window.meetingClientSettings.public.chat.public_group_id;
  const isGridLayout = useStorageKey('isGridEnabled');
  return (
    <Button
      icon={`${buttonType}${!presentationIsOpen ? '_off' : ''}`}
      label={intl.formatMessage(!presentationIsOpen ? intlMessages.restorePresentationLabel : intlMessages.minimizePresentationLabel)}
      aria-label={intl.formatMessage(!presentationIsOpen ? intlMessages.restorePresentationLabel : intlMessages.minimizePresentationLabel)}
      aria-describedby={intl.formatMessage(!presentationIsOpen ? intlMessages.restorePresentationDesc : intlMessages.minimizePresentationDesc)}
      description={intl.formatMessage(!presentationIsOpen ? intlMessages.restorePresentationDesc : intlMessages.minimizePresentationDesc)}
      color={presentationIsOpen ? "primary" : "default"}
      hideLabel
      circle
      size="lg"
      onClick={() => {
        if (!isChatOpen && isGridLayout && !presentationIsOpen) {
          layoutContextDispatch({
            type: ACTIONS.SET_SIDEBAR_CONTENT_PANEL,
            value: PANELS.CHAT,
          });
          layoutContextDispatch({
            type: ACTIONS.SET_ID_CHAT_OPEN,
            value: PUBLIC_CHAT_ID,
          });
          layoutContextDispatch({
            type: ACTIONS.SET_SIDEBAR_CONTENT_IS_OPEN,
            value: true,
          });
        }
        setPresentationIsOpen(layoutContextDispatch, !presentationIsOpen);
        if (onlyPresentation) {
          Session.setItem('presentationLastState', !presentationIsOpen);
        }
      }}
      id="restore-presentation"
      ghost={!presentationIsOpen}
      disabled={!isThereCurrentPresentation}
      data-test={!presentationIsOpen ? 'restorePresentation' : 'minimizePresentation'}
    />
  );
};

PresentationOptionsContainer.propTypes = propTypes;
export default injectIntl(PresentationOptionsContainer);
