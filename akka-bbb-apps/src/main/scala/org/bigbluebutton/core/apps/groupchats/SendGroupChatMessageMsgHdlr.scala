package org.bigbluebutton.core.apps.groupchats

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.domain.MeetingState2x
import org.bigbluebutton.core.models.GroupChatMessage
import org.bigbluebutton.core.running.LiveMeeting

trait SendGroupChatMessageMsgHdlr {

  def handle(msg: SendGroupChatMessageMsg, state: MeetingState2x,
             liveMeeting: LiveMeeting, bus: MessageBus): MeetingState2x = {

    def makeHeader(name: String, meetingId: String, userId: String): BbbClientMsgHeader = {
      BbbClientMsgHeader(name, meetingId, userId)
    }

    def makeEnvelope(msgType: String, name: String, meetingId: String, userId: String): BbbCoreEnvelope = {
      val routing = Routing.addMsgToClientRouting(msgType, meetingId, userId)
      BbbCoreEnvelope(name, routing)
    }

    def buildGroupChatMessageBroadcastEvtMsg(meetingId: String, userId: String, chatId: String,
                                             msgs: Vector[GroupChatMessage]): BbbCommonEnvCoreMsg = {
      val envelope = makeEnvelope(MessageTypes.BROADCAST_TO_MEETING, GroupChatMessageBroadcastEvtMsg.NAME, meetingId, userId)
      val header = makeHeader(GroupChatMessageBroadcastEvtMsg.NAME, meetingId, userId)

      val cmsgs = msgs.map(m => GroupChatMsgToUser(m.id, m.timestamp, m.correlationId,
        m.sender, m.font, m.size, m.color, m.message))
      val body = GroupChatMessageBroadcastEvtMsgBody(chatId, cmsgs)
      val event = GroupChatMessageBroadcastEvtMsg(header, body)

      BbbCommonEnvCoreMsg(envelope, event)
    }

    val newState = for {
      sender <- GroupChatApp.sender(msg.header.userId, liveMeeting.users2x)
      chat <- state.groupChats.find(msg.body.chatId)
    } yield {
      val gcs = GroupChatApp.addNewGroupChatMessage(sender, chat, state.groupChats, msg.body.chatMsg)
      state.update(gcs)
    }

    newState match {
      case Some(ns) => ns
      case None     => state
    }

  }

}
