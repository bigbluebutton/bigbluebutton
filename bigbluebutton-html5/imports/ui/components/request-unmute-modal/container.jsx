import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl } from 'react-intl';
import { useMutation, useReactiveVar } from '@apollo/client';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import useToggleVoice from '/imports/ui/components/audio/audio-graphql/hooks/useToggleVoice';
import useIsAudioConnected from '/imports/ui/components/audio/audio-graphql/hooks/useIsAudioConnected';
import useLockContext from '/imports/ui/components/lock-viewers/hooks/useLockContext';
import {
  toggleMuteMicrophone,
  toggleMuteMicrophoneSystem,
} from '/imports/ui/components/audio/audio-graphql/audio-controls/input-stream-live-selector/service';
import AudioManager from '/imports/ui/services/audio-manager';
import meetingStaticData from '/imports/ui/core/singletons/meetingStaticData';
import { notify } from '/imports/ui/services/notification';
import logger from '/imports/startup/client/logger';
import RequestUnmuteComponent from './component';
import { USER_UNMUTE_REQUEST_ANSWER } from './mutations';

const intlMessages = defineMessages({
  unmutedByModerator: {
    id: 'app.unmute.byModerator.toast',
    description: 'Shown when a moderator unmutes the user without asking for consent',
  },
});

const ANSWER_RETRY_MS = 1000;
const ANSWER_RETRY_MAX_MS = 5000;
const ANSWER_FAILURES_LOGGED = 3;

const RequestUnmuteContainer = ({ intl }) => {
  const [handleRequest] = useMutation(USER_UNMUTE_REQUEST_ANSWER);
  const toggleVoice = useToggleVoice();
  const isAudioConnected = useIsAudioConnected();
  // eslint-disable-next-line no-underscore-dangle
  const isReconnecting = useReactiveVar(AudioManager._isReconnecting.value);
  const { userLocks } = useLockContext();
  const acceptedRequest = useRef(false);
  const answerRetry = useRef(null);
  const answerGeneration = useRef(0);

  const { data: currentUserData } = useCurrentUser((user) => ({
    requestedUnmuteByMod: user.requestedUnmuteByMod,
    userId: user.userId,
  }));

  const isRequested = !!currentUserData?.requestedUnmuteByMod;
  const userId = currentUserData?.userId;
  // Ask unless the meeting explicitly skips consent: a missing value must not
  // open the user's microphone.
  const consentRequired = meetingStaticData.getMeetingData()
    .usersPolicies.requireUserConsentBeforeUnmuting !== false;

  // Also stops an answer still in flight from scheduling a retry later.
  const clearAnswerRetry = () => {
    answerGeneration.current += 1;
    if (answerRetry.current) clearTimeout(answerRetry.current);
    answerRetry.current = null;
  };

  useEffect(() => clearAnswerRetry, []);

  // Under LiveKit the server cannot unmute a client that has no published
  // microphone. So the server sends a request even when the meeting skips
  // consent, and the client unmutes itself. Like the unmute button, this waits
  // while audio reconnects and leaves a locked microphone muted.
  //
  // A failed answer leaves requestedUnmuteByMod set, and acceptedRequest ignores
  // new requests until that flag clears. So the answer is retried until it
  // goes through or the request clears. A retry only answers; it does not
  // unmute again.
  useEffect(() => {
    if (!isRequested) {
      acceptedRequest.current = false;
      clearAnswerRetry();
      return;
    }

    if (consentRequired || !isAudioConnected || isReconnecting || acceptedRequest.current) return;

    acceptedRequest.current = true;

    if (AudioManager.inputDeviceId !== 'listen-only' && !userLocks.userMic) {
      toggleMuteMicrophoneSystem(
        true,
        (id, muted) => toggleVoice(id, muted, { userAction: false }),
      );
      notify(intl.formatMessage(intlMessages.unmutedByModerator), 'info', 'unmute');
    }

    const generation = answerGeneration.current;
    const answer = (attempt) => {
      handleRequest({ variables: { userId } }).catch((error) => {
        if (generation !== answerGeneration.current) return;

        if (attempt <= ANSWER_FAILURES_LOGGED) {
          logger.warn({
            logCode: 'unmute_request_answer_failed',
            extraInfo: { attempt, errorMessage: error?.message },
          }, `Failed to answer a moderator's unmute request: ${error?.message}`);
        }

        const delay = Math.min(ANSWER_RETRY_MS * 2 ** (attempt - 1), ANSWER_RETRY_MAX_MS);
        answerRetry.current = setTimeout(() => answer(attempt + 1), delay);
      });
    };

    answer(1);
  }, [isRequested, consentRequired, isAudioConnected, isReconnecting, userId]);

  if (!isRequested || !consentRequired) {
    return null;
  }

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
