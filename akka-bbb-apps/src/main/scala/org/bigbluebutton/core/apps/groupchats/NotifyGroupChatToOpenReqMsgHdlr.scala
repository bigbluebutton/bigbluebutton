package org.bigbluebutton.core.apps.groupchats

import org.bigbluebutton.SystemConfiguration
import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.domain.MeetingState2x
import org.bigbluebutton.core.models.Users2x
import org.bigbluebutton.core.running.LiveMeeting
import org.bigbluebutton.core2.MeetingStatus2x

trait NotifyGroupChatToOpenReqMsgHdlr extends SystemConfiguration {
  this: GroupChatHdlrs =>

  def handle(msg: NotifyGroupChatToOpenReqMsg, state: MeetingState2x,
             liveMeeting: LiveMeeting, bus: MessageBus): MeetingState2x = {
    log.debug("RECEIVED CREATE CHAT REQ MESSAGE")

    var chatLocked: Boolean = false

    for {
      user <- Users2x.findWithIntId(liveMeeting.users2x, msg.header.userId)
    } yield {
      val permissions = MeetingStatus2x.getPermissions(liveMeeting.status)
      if (!(user.locked && permissions.disablePrivChat)) {
        GroupChatApp.getAllGroupChatsInMeeting(state).find(gc =>
          gc.id == msg.body.chatId) match {
          case Some(_) => sendMessages(msg, liveMeeting, bus)
          case None    =>
        }
      }
    }
    state
  }

  def sendMessages(
      msg:         NotifyGroupChatToOpenReqMsg,
      liveMeeting: LiveMeeting, bus: MessageBus
  ): Unit = {
    def makeHeader(name: String, meetingId: String, userId: String): BbbClientMsgHeader = {
      BbbClientMsgHeader(name, meetingId, userId)
    }

    def makeEnvelope(msgType: String, name: String, meetingId: String, userId: String): BbbCoreEnvelope = {
      val routing = Routing.addMsgToClientRouting(msgType, meetingId, userId)
      BbbCoreEnvelope(name, routing)
    }
    val userId = msg.header.userId
    val meetingId = liveMeeting.props.meetingProp.intId

    val envelope = makeEnvelope(MessageTypes.DIRECT, NotifyGroupChatToOpenEvtMsg.NAME, meetingId, userId)
    val header = makeHeader(NotifyGroupChatToOpenEvtMsg.NAME, meetingId, userId)

    val body = NotifyGroupChatToOpenEvtMsgBody(msg.body.chatId)
    val event = NotifyGroupChatToOpenEvtMsg(header, body)
    val outEvent = BbbCommonEnvCoreMsg(envelope, event)
    bus.outGW.send(outEvent)

  }

}
