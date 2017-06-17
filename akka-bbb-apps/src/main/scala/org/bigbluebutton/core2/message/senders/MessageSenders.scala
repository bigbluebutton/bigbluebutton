package org.bigbluebutton.core2.message.senders

import org.bigbluebutton.common2.messages._
import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.core.models.UserState

trait MessageSenders {
  val outGW: OutMessageGateway

  def recordMessage(record: Boolean, msg: BbbCoreMsg): Unit = {
    if (record) {
      outGW.record(msg)
    }
  }

  def sendUserLeftMeetingEvtMsg(meetingId: String, user: UserState, record: Boolean): Unit = {
    val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, meetingId, user.intId)
    val envelope = BbbCoreEnvelope(UserLeftMeetingEvtMsg.NAME, routing)

    val body = UserLeftMeetingEvtMsgBody(intId = user.intId)
    val event = UserLeftMeetingEvtMsg(meetingId, user.intId, body)

    val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
    outGW.send(msgEvent)

    recordMessage(record, event)

  }

  def sendUserJoinedMeetingEvtMsg(meetingId: String, userState: UserState, record: Boolean): Unit = {
    val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, meetingId, userState.intId)
    val envelope = BbbCoreEnvelope(UserJoinedMeetingEvtMsg.NAME, routing)

    val body = UserJoinedMeetingEvtMsgBody(intId = userState.intId, extId = userState.extId, name = userState.name,
      role = userState.role, guest = userState.guest, authed = userState.authed,
      waitingForAcceptance = userState.waitingForAcceptance, emoji = userState.emoji,
      presenter = userState.presenter, locked = userState.locked, avatar = userState.avatar)

    val event = UserJoinedMeetingEvtMsg(meetingId, userState.intId, body)

    val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
    outGW.send(msgEvent)

    recordMessage(record, event)
  }

  def sendGetUsersMeetingRespMsg(meetingId: String, userId: String, webusers: Vector[WebUser], record: Boolean): Unit = {
    val routing = Routing.addMsgToClientRouting(MessageTypes.DIRECT, meetingId, userId)
    val envelope = BbbCoreEnvelope(GetUsersMeetingRespMsg.NAME, routing)
    val header = BbbClientMsgHeader(GetUsersMeetingRespMsg.NAME, meetingId, userId)

    val body = GetUsersMeetingRespMsgBody(webusers)
    val event = GetUsersMeetingRespMsg(header, body)
    val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
    outGW.send(msgEvent)

    recordMessage(record, event)
  }

}
