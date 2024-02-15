package org.bigbluebutton.core.apps.polls

import org.bigbluebutton.ClientSettings.getConfigPropertyValueByPathAsIntOrElse
import org.bigbluebutton.common2.domain.SimplePollResultOutVO
import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.models.Polls
import org.bigbluebutton.core.running.LiveMeeting
import org.bigbluebutton.core.models.Users2x

trait RespondToTypedPollReqMsgHdlr {
  this: PollApp2x =>

  def handle(msg: RespondToTypedPollReqMsg, liveMeeting: LiveMeeting, bus: MessageBus): Unit = {

    if (Polls.isResponsePollType(msg.body.pollId, liveMeeting.polls) &&
      !Polls.hasUserAlreadyResponded(msg.body.pollId, msg.header.userId, liveMeeting.polls) &&
      !Polls.hasUserAlreadyAddedTypedAnswer(msg.body.pollId, msg.header.userId, liveMeeting.polls)) {

      //Truncate answer case it is longer than `maxTypedAnswerLength`
      val maxTypedAnswerLength = getConfigPropertyValueByPathAsIntOrElse(liveMeeting.clientSettings, "public.poll.maxTypedAnswerLength", 45)
      val answer = msg.body.answer.substring(0, Math.min(msg.body.answer.length, maxTypedAnswerLength))

      val answerExists = Polls.findAnswerWithText(msg.body.pollId, msg.body.questionId, answer, liveMeeting.polls)

      //Create answer if it doesn't exist
      answerExists match {
        case None => {
          for {
            (pollId: String, updatedPoll: SimplePollResultOutVO) <- Polls.handleRespondToTypedPollReqMsg(msg.header.userId, msg.body.pollId,
              msg.body.questionId, answer, liveMeeting)
          } yield {
            PollHdlrHelpers.broadcastPollUpdatedEvent(bus.outGW, liveMeeting.props.meetingProp.intId, msg.header.userId, pollId, updatedPoll)

            for {
              presenter <- Users2x.findPresenter(liveMeeting.users2x)
            } yield {
              PollHdlrHelpers.broadcastUserRespondedToTypedPollRespMsg(bus.outGW, liveMeeting.props.meetingProp.intId, msg.header.userId, pollId, answer, presenter.intId)
            }
          }
        }
        case _ => //Do nothing, answer with same text exists already
      }

      //Submit the answer
      Polls.findAnswerWithText(msg.body.pollId, msg.body.questionId, answer, liveMeeting.polls) match {
        case Some(answerId) => {
          for {
            (pollId: String, updatedPoll: SimplePollResultOutVO) <- Polls.handleRespondToPollReqMsg(msg.header.userId, msg.body.pollId,
              msg.body.questionId, Seq(answerId), liveMeeting)
          } yield {
            PollHdlrHelpers.broadcastPollUpdatedEvent(bus.outGW, liveMeeting.props.meetingProp.intId, msg.header.userId, pollId, updatedPoll)
            for {
              poll <- Polls.getPoll(pollId, liveMeeting.polls)
            } yield {
              val answerText = poll.questions(0).answers.get(answerId).key
              PollHdlrHelpers.broadcastUserRespondedToPollRecordMsg(bus.outGW, liveMeeting.props.meetingProp.intId, msg.header.userId, pollId, answerId, answerText, poll.isSecret)
            }

            for {
              presenter <- Users2x.findPresenter(liveMeeting.users2x)
            } yield {
              PollHdlrHelpers.broadcastUserRespondedToPollRespMsg(bus.outGW, liveMeeting.props.meetingProp.intId, msg.header.userId, pollId, Seq(answerId), presenter.intId)
            }
          }
        }
        case None => log.error("Error while trying to answer the poll {} in meeting {}: Answer not found or something went wrong while trying to create the answer.", msg.body.pollId, msg.header.meetingId)
      }

    } else {
      log.info("Ignoring typed answer from user {} once user already added an answer to this poll {} in meeting {}", msg.header.userId, msg.body.pollId, msg.header.meetingId)
    }
  }
}
