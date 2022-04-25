import { Meteor } from 'meteor/meteor';
import QuestionQuizs from '/imports/api/question-quiz';
import { expect } from 'chai';
// Modifiers
import clearQuestionQuizs from './server/modifiers/clearQuestionQuizs';
import removeQuestionQuiz from './server/modifiers/removeQuestionQuiz';
import addQuestionQuiz from './server/modifiers/addQuestionQuiz';
import updateVotes from './server/modifiers/updateVotes';
// Handlers
import questionQuizStarted from './server/handlers/questionQuizStarted';
import questionQuizStopped from './server/handlers/questionQuizStopped';

// mock test data
const _id = 'sJt6JaJMsTgy64TZG';
const meetingId = '183f0bf3a0982a127bdb8161e0c44eb696b3e75c-1623285094106';
const requester = 'w_iotqesmfrtqj';
const questionQuizType = 'TF';
const id = 'd2d9a672040fbde2a47a10bf6c37b6a4b5ae187f-1623285094108/1/1623285145173';
const answers = [{ id: 0, key: 'True' }, { id: 1, key: 'False' }];
const users = [];
const questionText = '';
const questionQuizObj = {
  _id,
  meetingId,
  requester,
  questionQuizType,
  answers,
  id,
  users,
  questionText,
};

QuestionQuizs.insert(questionQuizObj);
const questionQuiz = QuestionQuizs.findOne(questionQuizObj);

if (Meteor.isServer) {
  describe('QuestionQuizs Collection', () => {
    describe('Modifiers :', () => {
      it('Validate (#_id, #meetingId, #requester, #questionQuizType, #users, #answers)', () => {
        expect(questionQuiz?._id).to.be.a('string').equal(_id);
        expect(questionQuiz?.meetingId).to.be.a('string').equal(meetingId);
        expect(questionQuiz?.requester).to.be.a('string').equal(requester);
        expect(questionQuiz?.questionQuizType).to.be.a('string').equal(questionQuizType);
        expect(questionQuiz?.users).to.be.an('array');
        expect(questionQuiz?.answers).to.be.an('array');
      });

      it('addQuestionQuiz(): Should have added a questionQuiz', () => {
        addQuestionQuiz(meetingId, requester, { id, answers }, questionQuizType, questionText);
        expect(QuestionQuizs.findOne({ id, meetingId })?.id).to.be.a('string').equal(questionQuizObj.id);
      });

      it('updateVotes(): Should update vote for a questionQuiz', () => {
        answers[0].numVotes = 1;
        answers[1].numVotes = 0;

        updateVotes({
          id,
          answers,
          numResponders: 1,
          numRespondents: 1,
        }, meetingId);

        expect(QuestionQuizs.findOne({ meetingId, id })?.answers[0]?.numVotes).to.be.a('number').equal(1);
        expect(QuestionQuizs.findOne({ meetingId, id })?.answers[1]?.numVotes).to.be.a('number').equal(0);
      });

      it('removeQuestionQuiz(): Should have removed specified questionQuiz', () => {
        removeQuestionQuiz(meetingId, id);
        expect(QuestionQuizs.findOne({ meetingId, id })).to.be.an('undefined');
      });

      it('clearQuestionQuizs(): Should have cleared all questionQuizs', () => {
        QuestionQuizs.insert(questionQuizObj);
        clearQuestionQuizs();
        expect(QuestionQuizs.findOne({ meetingId })).to.be.an('undefined');
      });
    });

    describe('Handlers :', () => {
      it('questionQuizStarted(): should add a questionQuiz and reset publishedQuestionQuiz flag', () => {
        delete answers[0].numVotes;
        delete answers[1].numVotes;

        questionQuizStarted({
          body: {
            userId: requester,
            questionQuiz: { id, answers },
            questionQuizType,
            question: '',
          },
        }, meetingId);

        expect(QuestionQuizs.findOne({ meetingId, id })?.id).to.be.a('string').equal(id);
      });

      it('questionQuizStopped(): Should have removed questionQuiz', () => {
        questionQuizStopped({ body: { questionQuiz: { questionQuizId: id } } }, meetingId);
        expect(QuestionQuizs.findOne({ meetingId, id })?.id).to.be.an('undefined');
      });
    });
  });
}
