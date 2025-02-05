package org.bigbluebutton.core.apps.polls

import org.bigbluebutton.common2.domain.SimplePollResultOutVO
import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.apps.groupchats.GroupChatApp
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.domain.MeetingState2x
import org.bigbluebutton.core.models.Polls
import org.bigbluebutton.core.running.LiveMeeting
import org.bigbluebutton.core.apps.{PermissionCheck, RightsManagementTrait}
import org.bigbluebutton.core.db.{ChatMessageDAO, JsonUtils, NotificationDAO}
import org.bigbluebutton.core2.message.senders.MsgBuilder
import spray.json.DefaultJsonProtocol.jsonFormat2

trait ShowPollResultReqMsgHdlr extends RightsManagementTrait {
  this: PollApp2x =>

  def handle(msg: ShowPollResultReqMsg, state: MeetingState2x, liveMeeting: LiveMeeting, bus: MessageBus): Unit = {

    def broadcastEvent(msg: ShowPollResultReqMsg, result: SimplePollResultOutVO): Unit = {
      // PollShowResultEvtMsg
      val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, liveMeeting.props.meetingProp.intId, msg.header.userId)
      val envelope = BbbCoreEnvelope(PollShowResultEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(PollShowResultEvtMsg.NAME, liveMeeting.props.meetingProp.intId, msg.header.userId)

      val body = PollShowResultEvtMsgBody(msg.header.userId, msg.body.pollId, result)
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
        (result, annotationProp) <- Polls.handleShowPollResultReqMsg(state, msg.header.userId, msg.body.pollId, liveMeeting)
      } yield {
        //it will be used to render the chat message (will be stored as json in chat-msg metadata)
        val resultAsSimpleMap = Map(
          "id" -> result.id,
          "questionType" -> result.questionType,
          "questionText" -> result.questionText.getOrElse(""),
          "answers" -> {
            for {
              answer <- result.answers
            } yield {
              Map(
                "id" -> answer.id,
                "key" -> answer.key,
                "numVotes" -> answer.numVotes
              )
            }
          },
          "numRespondents" -> result.numRespondents,
          "numResponders" -> result.numResponders,
        )

        broadcastEvent(msg, result)

        //Send notification
        val notifyEvent = MsgBuilder.buildNotifyAllInMeetingEvtMsg(
          liveMeeting.props.meetingProp.intId,
          "info",
          "polling",
          "app.whiteboard.annotations.poll",
          "Message displayed when a poll is published",
          Vector()
        )
        bus.outGW.send(notifyEvent)
        NotificationDAO.insert(notifyEvent)

        // Add Chat message with result
        ChatMessageDAO.insertSystemMsg(liveMeeting.props.meetingProp.intId, GroupChatApp.MAIN_PUBLIC_CHAT, "", GroupChatMessageType.POLL, resultAsSimpleMap, "")

        // Send annotations with the result to recordings
        val annotationRouting = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, liveMeeting.props.meetingProp.intId, msg.header.userId)
        val annotationEnvelope = BbbCoreEnvelope(SendWhiteboardAnnotationsEvtMsg.NAME, annotationRouting)
        val annotationHeader = BbbClientMsgHeader(SendWhiteboardAnnotationsEvtMsg.NAME, liveMeeting.props.meetingProp.intId, msg.header.userId)

        val annotMsgBody = SendWhiteboardAnnotationsEvtMsgBody(annotationProp.wbId, Array[AnnotationVO](annotationProp))
        val annotationEvent = SendWhiteboardAnnotationsEvtMsg(annotationHeader, annotMsgBody)
        val annotationMsgEvent = BbbCommonEnvCoreMsg(annotationEnvelope, annotationEvent)
        bus.outGW.send(annotationMsgEvent)
      }
    }
  }
}
