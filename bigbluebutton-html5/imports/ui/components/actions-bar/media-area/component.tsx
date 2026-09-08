import React, {
  useState, useCallback, useEffect, useRef,
} from 'react';
import { defineMessages } from 'react-intl';
import { MediaAreaProps } from './types';
import Styled from './styles';
import MediaSharingModal from '/imports/ui/components/actions-bar/media-area/media-sharing/component';
import { useShortcut } from '/imports/ui/core/hooks/useShortcut';
import { notify } from '/imports/ui/services/notification';
import deviceInfo from '/imports/utils/deviceInfo';

const intlMessages = defineMessages({
  mediaLabel: {
    id: 'app.actionsBar.actionsDropdown.actionsLabel',
    description: 'Actions button label',
  },
  presenterRequestDenied: {
    id: 'app.requestPresenter.notification.denied',
    description: 'Notification when presenter request is denied',
  },
});

const MediaArea = (props: MediaAreaProps) => {
  const {
    intl,
    amIPresenter = false,
    amIModerator = false,
    isConnected,
    mediaAreaItems,
    isCameraAsContentEnabled,
    hasCameraAsContent,
    hasPresentation,
    handleTakePresenter,
    handleRequestPresenter,
    isPresentationManagementDisabled = false,
    isPresentationEnabled,
    isSharingVideo,
    allowExternalVideo,
    stopExternalVideoShare,
    isMobile,
    isRTL,
    isRequestingPresenter,
    presenterPolicy,
    isLockedUser,
  } = props;

  const [menuOpen, setMenuOpen] = useState(false);
  const openMediaArea = useShortcut('openActions');
  const previousRequestedPresenter = useRef<boolean | null>(null);

  useEffect(() => {
    if (
      previousRequestedPresenter.current === true
      && isRequestingPresenter === false
      && !amIPresenter
    ) {
      notify(
        intl.formatMessage(intlMessages.presenterRequestDenied),
        'error',
        'presentation',
      );
    }
    previousRequestedPresenter.current = isRequestingPresenter;
  }, [isRequestingPresenter, amIPresenter, intl]);

  const handleToggleMenu = useCallback(() => {
    setMenuOpen(!menuOpen);
  }, [menuOpen]);

  if (!isConnected) {
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
        size={deviceInfo.isMobile ? 'md' : 'lg'}
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
        isConnected={isConnected}
        mediaAreaItems={mediaAreaItems}
        isCameraAsContentEnabled={isCameraAsContentEnabled}
        hasCameraAsContent={hasCameraAsContent}
        hasPresentation={hasPresentation}
        handleTakePresenter={handleTakePresenter}
        handleRequestPresenter={handleRequestPresenter}
        isPresentationManagementDisabled={isPresentationManagementDisabled}
        isPresentationEnabled={isPresentationEnabled}
        isSharingVideo={isSharingVideo}
        allowExternalVideo={allowExternalVideo}
        stopExternalVideoShare={stopExternalVideoShare}
        isRequestingPresenter={isRequestingPresenter}
        presenterPolicy={presenterPolicy}
        isLockedUser={isLockedUser}
      />
    </>
  );
};

export default React.memo(MediaArea);
