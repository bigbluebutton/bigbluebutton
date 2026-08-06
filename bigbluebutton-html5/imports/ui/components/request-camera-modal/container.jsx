import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import { useMutation } from '@apollo/client';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import VideoPreviewContainer from '/imports/ui/components/video-preview/container';
import RequestCameraComponent from './component';
import { USER_CAMERA_REQUEST_ANSWER } from './mutations';

const RequestCameraContainer = ({ intl }) => {
  const [handleAnswer] = useMutation(USER_CAMERA_REQUEST_ANSWER);
  const [isVideoPreviewModalOpen, setIsVideoPreviewModalOpen] = useState(false);

  const { data: currentUserData } = useCurrentUser((user) => ({
    requestedCameraByMod: user.requestedCameraByMod,
  }));

  const handleConfirm = () => {
    handleAnswer({
      variables: {
        accepted: true,
      },
    });

    // Same flow as the join video button; honors the skipVideoPreview settings.
    setIsVideoPreviewModalOpen(true);
  };

  const handleDeny = () => {
    handleAnswer({
      variables: {
        accepted: false,
      },
    });
  };

  // Checked before the flag: answering clears it, but the preview must outlive it.
  if (isVideoPreviewModalOpen) {
    return (
      <VideoPreviewContainer
        callbackToClose={() => {}}
        forceOpen={false}
        priority="low"
        setIsOpen={setIsVideoPreviewModalOpen}
        isOpen={isVideoPreviewModalOpen}
      />
    );
  }

  if (!currentUserData?.requestedCameraByMod) {
    return null;
  }

  return (
    <RequestCameraComponent
      intl={intl}
      handleConfirm={handleConfirm}
      handleDeny={handleDeny}
    />
  );
};

RequestCameraContainer.propTypes = {
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
};

export default injectIntl(RequestCameraContainer);
