import React, { useState, useCallback } from 'react';
import { defineMessages } from 'react-intl';
import { MediaAreaProps } from './types';
import Styled from './styles';
import MediaSharingModal from '/imports/ui/components/actions-bar/media-area/media-sharing/component';
import { useShortcut } from '/imports/ui/core/hooks/useShortcut';

const intlMessages = defineMessages({
  mediaLabel: {
    id: 'app.actionsBar.actionsDropdown.actionsLabel',
    description: 'Actions button label',
  },
});

const MediaArea = (props: MediaAreaProps) => {
  const {
    intl,
    amIPresenter = false,
    amIModerator = false,
    isMeteorConnected,
    mediaAreaItems,
    isCameraAsContentEnabled,
    hasCameraAsContent,
    hasPresentation,
    handleTakePresenter,
    isPresentationManagementDisabled = false,
    isPresentationEnabled,
    isSharingVideo,
    allowExternalVideo,
    stopExternalVideoShare,
    isMobile,
    isRTL,
  } = props;

  const [menuOpen, setMenuOpen] = useState(false);
  const openMediaArea = useShortcut('openActions');

  const handleToggleMenu = useCallback(() => {
    setMenuOpen(!menuOpen);
  }, [menuOpen]);

  if ((!amIPresenter && !amIModerator) || !isMeteorConnected) {
    return null;
  }

  return (
    <>
      {/* eslint-disable-next-line jsx-a11y/no-access-key */}
      <Styled.HideDropdownButton
        hideLabel
        aria-label={intl.formatMessage(intlMessages.mediaLabel)}
        data-test="mediaAreaButton"
        accessKey={openMediaArea}
        label={intl.formatMessage(intlMessages.mediaLabel)}
        icon="media-area"
        color={menuOpen ? 'primary' : 'default'}
        size="lg"
        circle
        onClick={handleToggleMenu}
      />
      <MediaSharingModal
        isMobile={isMobile}
        isRTL={isRTL}
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        intl={intl}
        amIPresenter={amIPresenter}
        amIModerator={amIModerator}
        isMeteorConnected={isMeteorConnected}
        mediaAreaItems={mediaAreaItems}
        isCameraAsContentEnabled={isCameraAsContentEnabled}
        hasCameraAsContent={hasCameraAsContent}
        hasPresentation={hasPresentation}
        handleTakePresenter={handleTakePresenter}
        isPresentationManagementDisabled={isPresentationManagementDisabled}
        isPresentationEnabled={isPresentationEnabled}
        isSharingVideo={isSharingVideo}
        allowExternalVideo={allowExternalVideo}
        stopExternalVideoShare={stopExternalVideoShare}
      />
    </>
  );
};

export default React.memo(MediaArea);
