import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import { useMutation } from '@apollo/client';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import useToggleVoice from '/imports/ui/components/audio/audio-graphql/hooks/useToggleVoice';
import { toggleMuteMicrophone } from '/imports/ui/components/audio/audio-graphql/audio-controls/input-stream-live-selector/service';
import RequestUnmuteComponent from './component';
import { USER_UNMUTE_REQUEST_ANSWER } from './mutations';

const RequestUnmuteContainer = ({ intl }) => {
  const [handleRequest] = useMutation(USER_UNMUTE_REQUEST_ANSWER);
  const toggleVoice = useToggleVoice();

  const { data: currentUserData } = useCurrentUser((user) => ({
    requestedUnmuteByMod: user.requestedUnmuteByMod,
    userId: user.userId,
  }));

  if (!currentUserData?.requestedUnmuteByMod) {
    return null;
  }

  const { userId } = currentUserData;

  const handleConfirm = () => {
    toggleMuteMicrophone(true, toggleVoice);

    handleRequest({
      variables: {
        userId,
      },
    });
  };

  const handleDeny = () => {
    handleRequest({
      variables: {
        userId,
      },
    });
  };

  return (
    <RequestUnmuteComponent
      intl={intl}
      handleConfirm={handleConfirm}
      handleDeny={handleDeny}
    />
  );
};

RequestUnmuteContainer.propTypes = {
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
};

export default injectIntl(RequestUnmuteContainer);
