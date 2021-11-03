import { Meteor } from 'meteor/meteor';
import Polls from '/imports/api/polls';
import { expect } from 'chai';
// Modifiers
import clearPolls from './server/modifiers/clearPolls';
import removePoll from './server/modifiers/removePoll';
import addPoll from './server/modifiers/addPoll';
import updateVotes from './server/modifiers/updateVotes';
// Handlers
import pollStarted from './server/handlers/pollStarted';
import pollStopped from './server/handlers/pollStopped';

// mock test data
const _id = 'sJt6JaJMsTgy64TZG';
const meetingId = '183f0bf3a0982a127bdb8161e0c44eb696b3e75c-1623285094106';
const requester = 'w_iotqesmfrtqj';
const pollType = 'TF';
const id = 'd2d9a672040fbde2a47a10bf6c37b6a4b5ae187f-1623285094108/1/1623285145173';
const answers = [{ id: 0, key: 'True' }, { id: 1, key: 'False' }];
const users = [];
const questionText = '';
const pollObj = {
  _id,
  meetingId,
  requester,
  pollType,
  answers,
  id,
  users,
  questionText,
};

Polls.insert(pollObj);
const poll = Polls.findOne(pollObj);

if (Meteor.isServer) {
  describe('Polls Collection', () => {
    describe('Modifiers :', () => {
      it('Validate (#_id, #meetingId, #requester, #pollType, #users, #answers)', () => {
        expect(poll?._id).to.be.a('string').equal(_id);
        expect(poll?.meetingId).to.be.a('string').equal(meetingId);
        expect(poll?.requester).to.be.a('string').equal(requester);
        expect(poll?.pollType).to.be.a('string').equal(pollType);
        expect(poll?.users).to.be.an('array');
        expect(poll?.answers).to.be.an('array');
      });

      it('addPoll(): Should have added a poll', () => {
        addPoll(meetingId, requester, { id, answers }, pollType, questionText);
        expect(Polls.findOne({ id, meetingId })?.id).to.be.a('string').equal(pollObj.id);
      });

      it('updateVotes(): Should update vote for a poll', () => {
        answers[0].numVotes = 1;
        answers[1].numVotes = 0;

        updateVotes({
          id,
          answers,
          numResponders: 1,
          numRespondents: 1,
        }, meetingId);

        expect(Polls.findOne({ meetingId, id })?.answers[0]?.numVotes).to.be.a('number').equal(1);
        expect(Polls.findOne({ meetingId, id })?.answers[1]?.numVotes).to.be.a('number').equal(0);
      });

      it('removePoll(): Should have removed specified poll', () => {
        removePoll(meetingId, id);
        expect(Polls.findOne({ meetingId, id })).to.be.an('undefined');
      });

      it('clearPolls(): Should have cleared all polls', () => {
        Polls.insert(pollObj);
        clearPolls();
        expect(Polls.findOne({ meetingId })).to.be.an('undefined');
      });
    });

    describe('Handlers :', () => {
      it('pollStarted(): should add a poll and reset publishedPoll flag', () => {
        delete answers[0].numVotes;
        delete answers[1].numVotes;

        pollStarted({
          body: {
            userId: requester,
            poll: { id, answers },
            pollType,
            question: '',
          },
        }, meetingId);

        expect(Polls.findOne({ meetingId, id })?.id).to.be.a('string').equal(id);
      });

      it('pollStopped(): Should have removed poll', () => {
        pollStopped({ body: { poll: { pollId: id } } }, meetingId);
        expect(Polls.findOne({ meetingId, id })?.id).to.be.an('undefined');
      });
    });
  });
}
