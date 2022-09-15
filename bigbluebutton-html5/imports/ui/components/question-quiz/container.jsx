import React, { useContext } from 'react';
import { makeCall } from '/imports/ui/services/api';
import { withTracker } from 'meteor/react-meteor-data';
import Presentations from '/imports/api/presentations';
import PresentationService from '/imports/ui/components/presentation/service';
import QuestionQuiz from './component';
import { Session } from 'meteor/session';
import Service from './service';
import Auth from '/imports/ui/services/auth';
import { UsersContext } from '../components-data/users-context/context';
import { layoutDispatch, layoutSelectInput } from '../layout/context';

const CHAT_CONFIG = Meteor.settings.public.chat;
const PUBLIC_CHAT_KEY = CHAT_CONFIG.public_id;

const QuestionQuizContainer = ({ ...props }) => {
  const layoutContextDispatch = layoutDispatch();
  const sidebarContent = layoutSelectInput((i) => i.sidebarContent);
  const { sidebarContentPanel } = sidebarContent;

  const usingUsersContext = useContext(UsersContext);
  const { users } = usingUsersContext;
  const amIPresenter = users[Auth.meetingID][Auth.userID].presenter;

  const usernames = {};
  const meetingViewers = []
  Object.values(users[Auth.meetingID]).forEach((user) => {
    usernames[user.userId] = { userId: user.userId, name: user.name };
    if(!users[Auth.meetingID][user.userId].presenter)
    meetingViewers.push({userId: user.userId})
  });
  return (
    <QuestionQuiz
      {...{ layoutContextDispatch, sidebarContentPanel, ...props }}
      usernames={usernames}
      amIPresenter={amIPresenter}
      meetingViewers={meetingViewers}
    />
  );
};

export default withTracker(() => {
  const isQuestionQuizSecret = Session.get('secretQuestionQuiz') || false;
  Meteor.subscribe('current-questionQuiz', isQuestionQuizSecret);

  const currentPresentation = Presentations.findOne({
    current: true,
  }, { fields: { podId: 1 } }) || {};

  const currentSlide = PresentationService.getCurrentSlide(currentPresentation.podId);

  const questionQuizId = currentSlide ? currentSlide.id : PUBLIC_CHAT_KEY;

  const { questionQuizTypes } = Service;

  const startQuestionQuiz = (type, secretQuestionQuiz, question = '', isMultipleResponse) => makeCall('startQuestionQuiz', questionQuizTypes, type, questionQuizId, secretQuestionQuiz, question, isMultipleResponse);

  const startCustomQuestionQuiz = (type, secretQuestionQuiz, question = '', isMultipleResponse, answers) => makeCall('startQuestionQuiz', questionQuizTypes, type, questionQuizId, secretQuestionQuiz, question, isMultipleResponse, answers);

  const stopQuestionQuiz = () => makeCall('stopQuestionQuiz');

  const createUsersPrivateChatGroup = (meetingViewers) => makeCall('createUsersPrivateChatGroup', meetingViewers);

  return {
    currentSlide,
    questionQuizTypes,
    startQuestionQuiz,
    startCustomQuestionQuiz,
    stopQuestionQuiz,
    publishQuestionQuiz: Service.publishQuestionQuiz,
    currentQuestionQuiz: Service.currentQuestionQuiz(),
    isDefaultQuestionQuiz: Service.isDefaultQuestionQuiz,
    checkQuestionQuizType: Service.checkQuestionQuizType,
    resetQuestionQuizPanel: Session.get('resetQuestionQuizPanel') || false,
    questionQuizAnswerIds: Service.questionQuizAnswerIds,
    isMeteorConnected: Meteor.status().connected,
    createUsersPrivateChatGroup
  };
})(QuestionQuizContainer);
