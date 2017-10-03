package org.bigbluebutton.core.apps.groupchats

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.domain.MeetingState2x
import org.bigbluebutton.core.models.GroupChatMessage
import org.bigbluebutton.core.running.LiveMeeting

trait SendGroupChatMessageMsgHdlr {
  this: GroupChatHdlrs =>

  def handle(msg: SendGroupChatMessageMsg, state: MeetingState2x,
             liveMeeting: LiveMeeting, bus: MessageBus): MeetingState2x = {

    log.debug("RECEIVED PUBLIC CHAT MESSAGE")
    log.debug("NUM GROUP CHATS = " + state.groupChats.findAllPublicChats().length)

    def makeHeader(name: String, meetingId: String, userId: String): BbbClientMsgHeader = {
      BbbClientMsgHeader(name, meetingId, userId)
    }

    def makeEnvelope(msgType: String, name: String, meetingId: String, userId: String): BbbCoreEnvelope = {
      val routing = Routing.addMsgToClientRouting(msgType, meetingId, userId)
      BbbCoreEnvelope(name, routing)
    }

    def buildGroupChatMessageBroadcastEvtMsg(meetingId: String, userId: String, chatId: String,
                                             msg: GroupChatMessage): BbbCommonEnvCoreMsg = {
      val envelope = makeEnvelope(MessageTypes.BROADCAST_TO_MEETING, GroupChatMessageBroadcastEvtMsg.NAME, meetingId, userId)
      val header = makeHeader(GroupChatMessageBroadcastEvtMsg.NAME, meetingId, userId)

      val cmsgs = GroupChatApp.toMessageToUser(msg)
      val body = GroupChatMessageBroadcastEvtMsgBody(chatId, cmsgs)
      val event = GroupChatMessageBroadcastEvtMsg(header, body)

      BbbCommonEnvCoreMsg(envelope, event)
    }

    GroupChatApp.findGroupChatUser(msg.header.userId, liveMeeting.users2x) match {
      case Some(s) => log.debug("Found sender")
      case None    => log.debug("NOT FOUND sender")
    }

    state.groupChats.find(msg.body.chatId) match {
      case Some(c) => log.debug("FOUND CHAT ID " + c.id)
      case None    => log.debug("NOT FOUND CHAT ID " + msg.body.chatId)
    }

    state.groupChats.chats.values.toVector foreach { ch =>
      log.debug("CHAT = " + ch.id)
    }

    val newState = for {
      sender <- GroupChatApp.findGroupChatUser(msg.header.userId, liveMeeting.users2x)
      chat <- state.groupChats.find(msg.body.chatId)
    } yield {
      val gcm = GroupChatApp.toGroupChatMessage(sender, msg.body.msg)
      val gcs = GroupChatApp.addGroupChatMessage(chat, state.groupChats, gcm)

      val event = buildGroupChatMessageBroadcastEvtMsg(
        liveMeeting.props.meetingProp.intId,
        msg.header.userId, msg.body.chatId, gcm
      )

      bus.outGW.send(event)

      state.update(gcs)
    }

    newState match {
      case Some(ns) => ns
      case None     => state
    }

  }

}
