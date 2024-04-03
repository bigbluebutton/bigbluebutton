import React, { useContext } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import Poll from '/imports/ui/components/poll/component';
import { Session } from 'meteor/session';
import { useMutation } from '@apollo/client';
import Service from './service';
import Auth from '/imports/ui/services/auth';
import { UsersContext } from '../components-data/users-context/context';
import { layoutDispatch, layoutSelectInput } from '../layout/context';
import { POLL_PUBLISH_RESULT, POLL_CANCEL, POLL_CREATE } from './mutations';
import { ACTIONS, PANELS } from '../layout/enums';

const CHAT_CONFIG = window.meetingClientSettings.public.chat;
const PUBLIC_CHAT_KEY = CHAT_CONFIG.public_group_id;

const PollContainer = (props) => {
  const layoutContextDispatch = layoutDispatch();
  const handleChatFormsOpen = () => {
    layoutContextDispatch({
      type: ACTIONS.SET_SIDEBAR_CONTENT_IS_OPEN,
      value: true,
    });
    layoutContextDispatch({
      type: ACTIONS.SET_SIDEBAR_CONTENT_PANEL,
      value: PANELS.CHAT,
    });
    layoutContextDispatch({
      type: ACTIONS.SET_ID_CHAT_OPEN,
      value: PUBLIC_CHAT_KEY,
    });
  };

  const sidebarContent = layoutSelectInput((i) => i.sidebarContent);
  const { sidebarContentPanel } = sidebarContent;

  const usingUsersContext = useContext(UsersContext);
  const { users } = usingUsersContext;

  const usernames = {};

  Object.values(users[Auth.meetingID]).forEach((user) => {
    usernames[user.userId] = { userId: user.userId, name: user.name };
  });

  const [pollPublishResult] = useMutation(POLL_PUBLISH_RESULT);
  const [stopPoll] = useMutation(POLL_CANCEL);
  const [createPoll] = useMutation(POLL_CREATE);

  const { currentSlideId } = props;

  const startPoll = (pollType, secretPoll, question, isMultipleResponse, answers = []) => {
    const pollId = currentSlideId || PUBLIC_CHAT_KEY;

    createPoll({
      variables: {
        pollType,
        pollId: `${pollId}/${new Date().getTime()}`,
        secretPoll,
        question,
        isMultipleResponse,
        answers,
      },
    });
  };

  const publishPoll = (pollId) => {
    pollPublishResult({
      variables: {
        pollId,
      },
    });
  };

  return (
    <Poll
      {...{
        layoutContextDispatch,
        sidebarContentPanel,
        publishPoll,
        stopPoll,
        startPoll,
        handleChatFormsOpen,
        ...props,
      }}
      usernames={usernames}
    />
  );
};

export default withTracker(({ amIPresenter, currentSlideId }) => {
  const isPollSecret = Session.get('secretPoll') || false;

  Meteor.subscribe('current-poll', isPollSecret, amIPresenter);

  const { pollTypes } = Service;

  return {
    isPollSecret,
    currentSlideId,
    pollTypes,
    currentPoll: Service.currentPoll(),
    isDefaultPoll: Service.isDefaultPoll,
    checkPollType: Service.checkPollType,
    resetPollPanel: Session.get('resetPollPanel') || false,
    pollAnswerIds: Service.pollAnswerIds,
    isMeteorConnected: Meteor.status().connected,
    validateInput: Service.validateInput,
    removeEmptyLineSpaces: Service.removeEmptyLineSpaces,
    getSplittedQuestionAndOptions: Service.getSplittedQuestionAndOptions,
  };
})(PollContainer);
