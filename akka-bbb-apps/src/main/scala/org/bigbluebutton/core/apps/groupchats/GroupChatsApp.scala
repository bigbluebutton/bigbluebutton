package org.bigbluebutton.core.apps.groupchats

import akka.actor.ActorContext
import akka.event.Logging
import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.bus.{ MessageBus }
import org.bigbluebutton.core.domain.MeetingState2x
import org.bigbluebutton.core.models.{ GroupChatFactory, Users2x }
import org.bigbluebutton.core.running.{ LiveMeeting }

class GroupChatsApp(implicit val context: ActorContext) {
  val log = Logging(context.system, getClass)

  def handle(msg: CreateGroupChatReqMsg, state: MeetingState2x,
             liveMeeting: LiveMeeting, bus: MessageBus): MeetingState2x = {

    def buildCreateGroupChatRespMsg(meetingId: String, userId: String, chatId: String, name: String,
                                    access: String, correlationId: String): BbbCommonEnvCoreMsg = {
      val routing = Routing.addMsgToClientRouting(MessageTypes.DIRECT, meetingId, userId)
      val envelope = BbbCoreEnvelope(CreateGroupChatRespMsg.NAME, routing)
      val header = BbbClientMsgHeader(CreateGroupChatRespMsg.NAME, meetingId, userId)

      val body = CreateGroupChatRespMsgBody(correlationId, chatId, name: String, access)
      val event = CreateGroupChatRespMsg(header, body)

      BbbCommonEnvCoreMsg(envelope, event)
    }

    val newState = for {
      user <- Users2x.findWithIntId(liveMeeting.users2x, msg.body.requesterId)
      gcId = GroupChatFactory.genId()
      gcUser = GroupChatUser(msg.body.requesterId, user.name)
      gc = GroupChatFactory.create(gcId, msg.body.name, msg.body.access, gcUser)
      groupChats = state.groupChats.add(gc)
      newState = state.update(groupChats)
    } yield {
      val respMsg = buildCreateGroupChatRespMsg(liveMeeting.props.meetingProp.intId, msg.body.requesterId,
        gcId, gc.name, gc.access, msg.body.correlationId)
      bus.outGW.send(respMsg)
      newState
    }

    newState.getOrElse(state)
  }

  def handle(msg: GetGroupChatMsgsReqMsg, state: MeetingState2x,
             liveMeeting: LiveMeeting, bus: MessageBus): MeetingState2x = {

    def buildGetGroupChatMsgsRespMsg(meetingId: String, userId: String,
                                     msgs: Vector[GroupChatMessage]): BbbCommonEnvCoreMsg = {
      val routing = Routing.addMsgToClientRouting(MessageTypes.DIRECT, meetingId, userId)
      val envelope = BbbCoreEnvelope(GetGroupChatMsgsRespMsg.NAME, routing)
      val header = BbbClientMsgHeader(GetGroupChatMsgsRespMsg.NAME, meetingId, userId)

      val body = GetGroupChatMsgsRespMsgBody(userId, msgs)
      val event = GetGroupChatMsgsRespMsg(header, body)

      BbbCommonEnvCoreMsg(envelope, event)
    }

    state.groupChats.find(msg.body.chatId) foreach { gc =>
      if (gc.access == GroupChatAccess.PUBLIC || gc.isUserMemberOf(msg.body.requesterId)) {
        val respMsg = buildGetGroupChatMsgsRespMsg(
          liveMeeting.props.meetingProp.intId,
          msg.body.requesterId, gc.msgs.values.toVector
        )
        bus.outGW.send(respMsg)
      }
    }

    state
  }

  def handle(msg: GetGroupChatsReqMsg, state: MeetingState2x,
             liveMeeting: LiveMeeting, bus: MessageBus): MeetingState2x = {

    def buildGetGroupChatsRespMsg(meetingId: String, userId: String,
                                  publicChats: Vector[GroupChatInfo], privateChats: Vector[GroupChatInfo]): BbbCommonEnvCoreMsg = {
      val routing = Routing.addMsgToClientRouting(MessageTypes.DIRECT, meetingId, userId)
      val envelope = BbbCoreEnvelope(GetGroupChatsRespMsg.NAME, routing)
      val header = BbbClientMsgHeader(GetGroupChatsRespMsg.NAME, meetingId, userId)

      val body = GetGroupChatsRespMsgBody(userId, publicChats, privateChats)
      val event = GetGroupChatsRespMsg(header, body)

      BbbCommonEnvCoreMsg(envelope, event)
    }

    val publicChats = state.groupChats.findAllPublicChats()
    val privateChats = state.groupChats.findAllPrivateChatsForUser(msg.header.userId)
    val pubChats = publicChats map (pc => GroupChatInfo(pc.id, pc.name, pc.access, pc.createdBy))
    val privChats = privateChats map (pc => GroupChatInfo(pc.id, pc.name, pc.access, pc.createdBy))

    val respMsg = buildGetGroupChatsRespMsg(liveMeeting.props.meetingProp.intId, msg.header.userId, pubChats, privChats)

    bus.outGW.send(respMsg)

    state
  }

}
