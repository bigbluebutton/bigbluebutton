import Questions from '/imports/api/questions';
import Auth from '/imports/ui/services/auth';
import Users from '/imports/api/users';
import { Session } from 'meteor/session';
import { makeCall } from '/imports/ui/services/api';
import { AutoApproveQuestionsMeetings } from '/imports/api/meetings';
import { ACTIONS, PANELS } from '/imports/ui/components/layout/enums';
import { defineMessages } from 'react-intl';
import { isQuestionsEnabled } from '/imports/ui/services/features';

const QUESTION_AVATAR_COLOR = '#3B48A9';
const QUESTIONS_CONFIG = Meteor.settings.public.questions;
const ROLE_MODERATOR = Meteor.settings.public.user.role_moderator;

const intlMessages = defineMessages({
  answerTitle: {
    id: 'app.chat.answerTitle',
    description: 'header of question\'s answer in chat',
  },
});

const getPublicQuestions = (timestamp = 0) => {
  const questions = Questions.find({
    $and: [
      { meetingId: Auth.meetingID },
      { $or: [ { approved: true }, { answered: true } ] },
      { approvedTimestamp: { $gte: timestamp } },
    ]}
  ).fetch();

  return questions;
};

const getPrivateQuestions = (timestamp = 0) => {
  let query = null;

  if (isModerator() || isPresenter()) {
    query =  {
      $and: [
        { meetingId: Auth.meetingID },
        { approved: false },
        { answered: false },
        { timestamp: { $gte: timestamp } },
      ]
    }
  } else {
    query = {
      $and: [
        { meetingId: Auth.meetingID },
        { userId: Auth.userID },
        { timestamp: { $gte: timestamp } },
      ]
    };
  }

  const questions = Questions.find(
    query,
  ).fetch();

  return questions;
};

const updateQuestionsLastSeen = () => Session.set('lastQuestionsPanelClose', Date.now());

const isPanelOpened = (sidebarContentPanel) => sidebarContentPanel === PANELS.QUESTIONS;

const closePanel = (layoutContextDispatch) => {
  layoutContextDispatch({
    type: ACTIONS.SET_SIDEBAR_CONTENT_IS_OPEN,
    value: false,
  });
  layoutContextDispatch({
    type: ACTIONS.SET_SIDEBAR_CONTENT_PANEL,
    value: PANELS.NONE,
  });
};

const toggleQuestionsPanel = (sidebarContentPanel, layoutContextDispatch) => {
  if (isPanelOpened(sidebarContentPanel)) return closePanel(layoutContextDispatch);

  layoutContextDispatch({
    type: ACTIONS.SET_SIDEBAR_CONTENT_IS_OPEN,
    value: true,
  });
  layoutContextDispatch({
    type: ACTIONS.SET_SIDEBAR_CONTENT_PANEL,
    value: PANELS.QUESTIONS,
  });
};

const getUnreadQuestions = () => {
  let unreadQuestions = 0;

  const lastSeen = Session.get('lastQuestionsPanelClose') || 0;

  if (isModerator() || isPresenter()) {
    unreadQuestions = getPrivateQuestions(lastSeen).length + getPublicQuestions(lastSeen).length;
  } else {
    unreadQuestions = getPublicQuestions(lastSeen).length;
  }

  return unreadQuestions;
};

const isModerator = () => {
  return Users.findOne(
    { userId: Auth.userID },
    { fields: { role: 1 } },
  ).role === ROLE_MODERATOR;
};

const isPresenter = () => {
  return Users.findOne(
    { userId: Auth.userID },
    { fields: { presenter: 1 } },
  ).presenter;
};

const isEnabled = () => isQuestionsEnabled();

const isTextAnswersEnabled = () => QUESTIONS_CONFIG.textAnswers;

const sendQuestion = (questionText) => {
  const user = Users.findOne({
    meetingId: Auth.meetingID,
    userId: Auth.userID,
  }, { fields: { extId: 1 } });

  const payload = {
    userName: Auth.fullname,
    text: questionText,
    extUserId: user.extId,
  };
  return makeCall('createQuestion', payload);
};

const sendUpvote = (questionId) => {
  return makeCall('sendUpvote', questionId);
}

const approveQuestion = (questionId) => {
  return makeCall('approveQuestion', questionId);
}

const setQuestionAnswered = (questionId, answerText = '') => {
  return makeCall('setQuestionAnswered', questionId, answerText);
}

const deleteQuestion = (questionId) => {
  return makeCall('deleteQuestion', questionId);
}

const getAutoApproveQuestions = () => {
  const meetingId = Auth.meetingID;
  const meeting = AutoApproveQuestionsMeetings.findOne({meetingId});

  return meeting ? meeting.autoApprove : false;
}

const toggleAutoApproveQuestions = () => {
  const autoApprove = getAutoApproveQuestions();
  return makeCall('toggleAutoApproveQuestions', !autoApprove);
}

const getQuestionString = (question, intl) => {
  const formatBoldBlack = (s) => s.bold().fontcolor('black');

  // Sanitize. See: https://gist.github.com/sagewall/47164de600df05fb0f6f44d48a09c0bd
  const sanitize = (value) => {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(value));
    return div.innerHTML;
  };

  const { text, answerText, askerUser } = question;
  const questionText = sanitize(text);
  const questionAnswer = sanitize(answerText);

  let formattedQuestion = `${questionText}`;
  if (answerText && answerText !== '') {
    formattedQuestion += formatBoldBlack(`<br/><br/>${intl.formatMessage(intlMessages.answerTitle)}<br/>`);
    formattedQuestion += questionAnswer;
  }

  return formattedQuestion;
};

export default {
  QUESTION_AVATAR_COLOR,
  isEnabled,
  isModerator,
  isPresenter,
  isTextAnswersEnabled,
  sendQuestion,
  sendUpvote,
  setQuestionAnswered,
  approveQuestion,
  deleteQuestion,
  updateQuestionsLastSeen,
  isPanelOpened,
  closePanel,
  toggleQuestionsPanel,
  getUnreadQuestions,
  getPublicQuestions,
  getPrivateQuestions,
  getAutoApproveQuestions,
  toggleAutoApproveQuestions,
  getQuestionString,
};
