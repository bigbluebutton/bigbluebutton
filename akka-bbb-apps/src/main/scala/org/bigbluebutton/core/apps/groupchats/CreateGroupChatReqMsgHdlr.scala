package org.bigbluebutton.core.apps.groupchats

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.domain.MeetingState2x
import org.bigbluebutton.core.models.GroupChat
import org.bigbluebutton.core.running.LiveMeeting

trait CreateGroupChatReqMsgHdlr {

  def handle(msg: CreateGroupChatReqMsg, state: MeetingState2x,
             liveMeeting: LiveMeeting, bus: MessageBus): MeetingState2x = {

    val newState = for {
      createdBy <- GroupChatApp.findGroupChatUser(msg.header.userId, liveMeeting.users2x)
      msgs = msg.body.msg.map(m => GroupChatApp.toGroupChatMessage(createdBy, m))
      gc = GroupChatApp.createGroupChat(msg.body.name, msg.body.access, createdBy, msg.body.users, msgs)
    } yield {

      sendMessages(msg, gc, liveMeeting, bus)

      val groupChats = state.groupChats.add(gc)
      state.update(groupChats)
    }

    newState.getOrElse(state)
  }

  def sendMessages(msg: CreateGroupChatReqMsg, gc: GroupChat,
                   liveMeeting: LiveMeeting, bus: MessageBus): Unit = {
    def makeHeader(name: String, meetingId: String, userId: String): BbbClientMsgHeader = {
      BbbClientMsgHeader(name, meetingId, userId)
    }

    def makeEnvelope(msgType: String, name: String, meetingId: String, userId: String): BbbCoreEnvelope = {
      val routing = Routing.addMsgToClientRouting(msgType, meetingId, userId)
      BbbCoreEnvelope(name, routing)
    }

    def makeBody(chatId: String, name: String,
                 access: String, correlationId: String,
                 createdBy: GroupChatUser, users: Vector[GroupChatUser],
                 msgs: Vector[GroupChatMsgToUser]): CreateGroupChatRespMsgBody = {
      CreateGroupChatRespMsgBody(correlationId, chatId, createdBy,
        name, access, users, msgs)
    }

    val meetingId = liveMeeting.props.meetingProp.intId
    val correlationId = msg.body.correlationId
    val users = gc.users.values.toVector
    val msgs = gc.msgs.map(m => GroupChatApp.toMessageToUser(m))

    if (gc.access == GroupChatAccess.PRIVATE) {
      def sendDirectMessage(userId: String): Unit = {
        val envelope = makeEnvelope(MessageTypes.DIRECT, CreateGroupChatRespMsg.NAME, meetingId, userId)
        val header = makeHeader(CreateGroupChatRespMsg.NAME, meetingId, userId)

        val body = makeBody(gc.id, gc.name, gc.access, correlationId, gc.createdBy, users, msgs)
        val event = CreateGroupChatRespMsg(header, body)
        BbbCommonEnvCoreMsg(envelope, event)
      }

      users.foreach(u => sendDirectMessage(u.id))

    } else {
      val meetingId = liveMeeting.props.meetingProp.intId
      val userId = msg.body.requesterId
      val envelope = makeEnvelope(MessageTypes.BROADCAST_TO_MEETING, CreateGroupChatRespMsg.NAME,
        meetingId, userId)
      val header = makeHeader(CreateGroupChatRespMsg.NAME, meetingId, userId)

      val body = makeBody(gc.id, gc.name, gc.access, correlationId, gc.createdBy, users, msgs)
      val event = CreateGroupChatRespMsg(header, body)

      val outEvent = BbbCommonEnvCoreMsg(envelope, event)
      bus.outGW.send(outEvent)
    }

  }
}
