import React from 'react';
import PropTypes from 'prop-types';
import { withTracker } from 'meteor/react-meteor-data';
import { useMutation } from '@apollo/client';
import PollingService from './service';
import PollService from '/imports/ui/components/poll/service';
import PollingComponent from './component';
import { isPollingEnabled } from '/imports/ui/services/features';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import { POLL_SUBMIT_TYPED_VOTE, POLL_SUBMIT_VOTE } from '/imports/ui/components/poll/mutations';
import PollingGraphqlContainer from './polling-graphql/component';

const propTypes = {
  pollExists: PropTypes.bool.isRequired,
};

const PollingContainer = ({ pollExists, ...props }) => {
  const { data: currentUserData } = useCurrentUser((user) => ({
    presenter: user.presenter,
  }));
  const showPolling = pollExists && !currentUserData?.presenter && isPollingEnabled();

  const [pollSubmitUserTypedVote] = useMutation(POLL_SUBMIT_TYPED_VOTE);
  const [pollSubmitUserVote] = useMutation(POLL_SUBMIT_VOTE);

  const handleTypedVote = (pollId, answer) => {
    pollSubmitUserTypedVote({
      variables: {
        pollId,
        answer,
      },
    });
  };

  const handleVote = (pollId, answerIds) => {
    pollSubmitUserVote({
      variables: {
        pollId,
        answerIds,
      },
    });
  };

  if (showPolling) {
    return (
      <PollingComponent handleTypedVote={handleTypedVote} handleVote={handleVote} {...props} />
    );
  }
  return null;
};

PollingContainer.propTypes = propTypes;

withTracker(() => {
  const {
    pollExists, poll,
  } = PollingService.mapPolls();
  const { pollTypes } = PollService;

  if (poll && poll?.pollType) {
    const isResponse = poll.pollType === pollTypes.Response;
    Meteor.subscribe('polls', isResponse);
  }

  return ({
    pollExists,
    poll,
    pollAnswerIds: PollService.pollAnswerIds,
    pollTypes,
    isDefaultPoll: PollService.isDefaultPoll,
    isMeteorConnected: Meteor.status().connected,
  });
})(PollingContainer);

export default PollingGraphqlContainer;
