package org.bigbluebutton.api2.meeting

import org.bigbluebutton.api2.SystemConfiguration
import org.bigbluebutton.api2.bus.{ MsgToAkkaApps, MsgToAkkaAppsEventBus }
import org.bigbluebutton.common2.domain.DefaultProps
import org.bigbluebutton.common2.msgs._

trait ToAkkaAppsSendersTrait extends SystemConfiguration {
  val msgToAkkaAppsEventBus: MsgToAkkaAppsEventBus

  def sendToBus(msg: BbbCommonEnvCoreMsg): Unit = {
    msgToAkkaAppsEventBus.publish(MsgToAkkaApps(toAkkaAppsChannel, msg))
  }

  def sendCreateMeetingRequestToAkkaApps(props: DefaultProps): Unit = {
    val routing = collection.immutable.HashMap("sender" -> "bbb-web")
    val envelope = BbbCoreEnvelope(CreateMeetingReqMsg.NAME, routing)
    val header = BbbCoreBaseHeader(CreateMeetingReqMsg.NAME)
    val body = CreateMeetingReqMsgBody(props)
    val req = CreateMeetingReqMsg(header, body)
    val msg = BbbCommonEnvCoreMsg(envelope, req)
    sendToBus(msg)
  }

  def sendRegisterUserRequestToAkkaApps(msg: RegisterUser): Unit = {
    val routing = collection.immutable.HashMap("sender" -> "bbb-web")
    val envelope = BbbCoreEnvelope(RegisterUserReqMsg.NAME, routing)
    val header = BbbCoreHeaderWithMeetingId(RegisterUserReqMsg.NAME, msg.meetingId)
    val body = RegisterUserReqMsgBody(meetingId = msg.meetingId, intUserId = msg.intUserId,
      name = msg.name, role = msg.role, extUserId = msg.extUserId, authToken = msg.authToken,
      avatarURL = msg.avatarURL, guest = msg.guest, authed = msg.authed, guestStatus = msg.guestStatus)
    val req = RegisterUserReqMsg(header, body)
    val message = BbbCommonEnvCoreMsg(envelope, req)
    sendToBus(message)
  }
}
