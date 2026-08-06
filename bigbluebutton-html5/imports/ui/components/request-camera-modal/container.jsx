import React, { useEffect, useState } from 'react';
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
  const [answered, setAnswered] = useState(false);

  const { data: currentUserData } = useCurrentUser((user) => ({
    requestedCameraByMod: user.requestedCameraByMod,
  }));

  const isRequested = currentUserData?.requestedCameraByMod ?? false;

  // Re-arms the prompt for a later request, once this one has been cleared.
  useEffect(() => {
    if (!isRequested) setAnswered(false);
  }, [isRequested]);

  const answer = (accepted) => {
    // Hides the prompt right away instead of waiting on the subscription, and
    // restores it if the answer never reached the server.
    setAnswered(true);
    handleAnswer({ variables: { accepted } }).catch(() => setAnswered(false));
  };

  const handleConfirm = () => {
    answer(true);
    // Same flow as the join video button; honors the skipVideoPreview settings.
    setIsVideoPreviewModalOpen(true);
  };

  const handleDeny = () => {
    answer(false);
  };

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

  if (answered || !isRequested) {
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
