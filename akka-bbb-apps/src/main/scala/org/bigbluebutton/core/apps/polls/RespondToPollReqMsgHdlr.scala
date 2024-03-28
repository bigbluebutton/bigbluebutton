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
        (pollId: String, updatedPoll: SimplePollResultOutVO) <- Polls.handleRespondToPollReqMsg(msg.header.userId, msg.body.pollId,
          msg.body.questionId, msg.body.answerIds, liveMeeting)
      } yield {
        PollHdlrHelpers.broadcastPollUpdatedEvent(bus.outGW, liveMeeting.props.meetingProp.intId, msg.header.userId, pollId, updatedPoll)
        for {
          poll <- Polls.getPoll(pollId, liveMeeting.polls)
        } yield {
          for {
            answerId <- msg.body.answerIds
          } yield {
            val answerText = poll.questions(0).answers.get(answerId).key
            PollHdlrHelpers.broadcastUserRespondedToPollRecordMsg(bus.outGW, liveMeeting.props.meetingProp.intId, msg.header.userId, pollId, answerId, answerText, poll.isSecret)
          }
        }

        for {
          presenter <- Users2x.findPresenter(liveMeeting.users2x)
        } yield {
          PollHdlrHelpers.broadcastUserRespondedToPollRespMsg(bus.outGW, liveMeeting.props.meetingProp.intId, msg.header.userId, pollId, msg.body.answerIds, presenter.intId)
        }
      }
    } else {
      log.info("Ignoring typed answer from user {} once user already added an answer to this poll {} in meeting {}", msg.header.userId, msg.body.pollId, msg.header.meetingId)
    }
  }
}
