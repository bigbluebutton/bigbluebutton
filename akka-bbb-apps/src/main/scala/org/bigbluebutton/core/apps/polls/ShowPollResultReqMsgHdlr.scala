package org.bigbluebutton.core.apps.polls

import org.bigbluebutton.common2.domain.SimplePollResultOutVO
import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.apps.groupchats.GroupChatApp
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.domain.MeetingState2x
import org.bigbluebutton.core.models.Polls
import org.bigbluebutton.core.running.LiveMeeting
import org.bigbluebutton.core.apps.{PermissionCheck, RightsManagementTrait}
import org.bigbluebutton.core.db.{ChatMessageDAO, NotificationDAO}
import org.bigbluebutton.core2.message.senders.MsgBuilder

trait ShowPollResultReqMsgHdlr extends RightsManagementTrait {
  this: PollApp2x =>

  def handle(msg: ShowPollResultReqMsg, state: MeetingState2x, liveMeeting: LiveMeeting, bus: MessageBus): Unit = {

    def broadcastEvent(msg: ShowPollResultReqMsg, result: SimplePollResultOutVO, isQuiz: Boolean): Unit = {
      // PollShowResultEvtMsg
      val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, liveMeeting.props.meetingProp.intId, msg.header.userId)
      val envelope = BbbCoreEnvelope(PollShowResultEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(PollShowResultEvtMsg.NAME, liveMeeting.props.meetingProp.intId, msg.header.userId)

      val body = PollShowResultEvtMsgBody(msg.header.userId, msg.body.pollId, result, msg.body.showAnswer)
      val event = PollShowResultEvtMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
      bus.outGW.send(msgEvent)
    }

    if (permissionFailed(PermissionCheck.GUEST_LEVEL, PermissionCheck.PRESENTER_LEVEL, liveMeeting.users2x, msg.header.userId)) {
      val meetingId = liveMeeting.props.meetingProp.intId
      val reason = "No permission to show poll results."
      PermissionCheck.ejectUserForFailedPermission(meetingId, msg.header.userId, reason, bus.outGW, liveMeeting)
    } else {
      for {
        (poll) <- Polls.getPoll(msg.body.pollId, liveMeeting.polls)
        (result) <- Polls.getPollResult(msg.body.pollId, liveMeeting)
      } yield {
        //it will be used to render the chat message (will be stored as json in chat-msg metadata)
        val resultAsSimpleMap = Map(
          "id" -> result.id,
          "questionType" -> result.questionType,
          "questionText" -> result.questionText.getOrElse(""),
          "quiz" -> poll.questions(0).quiz,
          "answers" -> {
            for {
              answer <- result.answers
            } yield {
              Map(
                "id" -> answer.id,
                "key" -> answer.key,
                "numVotes" -> answer.numVotes,
                "isCorrectAnswer" -> (
                    poll.questions(0).quiz &&
                    msg.body.showAnswer &&
                    result.correctAnswer.getOrElse("") == answer.key
                  )
              )
            }
          },
          "numRespondents" -> result.numRespondents,
          "numResponders" -> result.numResponders,
        )

        broadcastEvent(msg, result, poll.questions(0).quiz)

        //Send notification
        val notifyEvent = MsgBuilder.buildNotifyAllInMeetingEvtMsg(
          liveMeeting.props.meetingProp.intId,
          "info",
          "polling",
          "app.whiteboard.annotations.poll",
          "Message displayed when a poll is published",
          Map()
        )
        bus.outGW.send(notifyEvent)
        NotificationDAO.insert(notifyEvent)

        // Add Chat message with result
        ChatMessageDAO.insertSystemMsg(liveMeeting.props.meetingProp.intId, GroupChatApp.MAIN_PUBLIC_CHAT, "", GroupChatMessageType.POLL, resultAsSimpleMap, "")

        //Add whiteboard annotation
        for {
          pod <- state.presentationPodManager.getDefaultPod()
          currentPres <- pod.getCurrentPresentation()
        } {
          if (currentPres.current) {
            Polls.handleShowPollResultReqMsgForAnnotation(state, msg.header.userId, msg.body.pollId, msg.body.showAnswer, liveMeeting, result, bus)
          }
        }

      }

    }
  }
}
