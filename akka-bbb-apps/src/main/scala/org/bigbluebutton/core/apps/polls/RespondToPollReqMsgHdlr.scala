package org.bigbluebutton.core.apps.polls

import org.bigbluebutton.common2.domain.SimplePollResultOutVO
import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.models.Polls
import org.bigbluebutton.core.running.LiveMeeting
import org.bigbluebutton.core.models.Users2x

trait RespondToPollReqMsgHdlr {
  this: PollApp2x =>

  def handle(msg: RespondToPollReqMsg, liveMeeting: LiveMeeting, bus: MessageBus): Unit = {

    if (!Polls.hasUserAlreadyResponded(msg.body.pollId, msg.header.userId, liveMeeting.polls)) {
      for {
        poll <- Polls.getPoll(msg.body.pollId, liveMeeting.polls)
      } yield {
        val answers = {
          if (!poll.questions(0).multiResponse && msg.body.answerIds.length > 1) {
            Seq(msg.body.answerIds.head)
          } else {
            msg.body.answerIds.distinct
          }
        }

        for {
          (pollId: String, updatedPoll: SimplePollResultOutVO) <- Polls.handleRespondToPollReqMsg(msg.header.userId, poll.id,
            msg.body.questionId, answers, liveMeeting)
        } yield {
          PollHdlrHelpers.broadcastPollUpdatedEvent(bus.outGW, liveMeeting.props.meetingProp.intId, msg.header.userId, pollId, updatedPoll)
          for {
            answerId <- answers
          } yield {
            val answerText = poll.questions(0).answers.get(answerId).key
            PollHdlrHelpers.broadcastUserRespondedToPollRecordMsg(bus.outGW, liveMeeting.props.meetingProp.intId, msg.header.userId, pollId, answerId, answerText, poll.isSecret)
          }

          for {
            presenter <- Users2x.findPresenter(liveMeeting.users2x)
          } yield {
            PollHdlrHelpers.broadcastUserRespondedToPollRespMsg(bus.outGW, liveMeeting.props.meetingProp.intId, msg.header.userId, pollId, answers, presenter.intId)
          }
        }
      }
    } else {
      log.info("Ignoring typed answer from user {} once user already added an answer to this poll {} in meeting {}", msg.header.userId, msg.body.pollId, msg.header.meetingId)
    }
  }
}
