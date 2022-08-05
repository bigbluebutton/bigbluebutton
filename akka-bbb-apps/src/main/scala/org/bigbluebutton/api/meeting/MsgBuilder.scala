package org.bigbluebutton.api.meeting

import org.bigbluebutton.api.meeting.join.RegisterUser
import org.bigbluebutton.common2.domain.DefaultProps
import org.bigbluebutton.common2.msgs._

object MsgBuilder {
  def buildCreateMeetingRequestToAkkaApps(props: DefaultProps): BbbCommonEnvCoreMsg = {
    val routing = collection.immutable.HashMap("sender" -> "bbb-web")
    val envelope = BbbCoreEnvelope(CreateMeetingReqMsg.NAME, routing)
    val header = BbbCoreBaseHeader(CreateMeetingReqMsg.NAME)
    val body = CreateMeetingReqMsgBody(props)
    val req = CreateMeetingReqMsg(header, body)
    BbbCommonEnvCoreMsg(envelope, req)
  }

  //  def buildEjectDuplicateUserRequestToAkkaApps(meetingId: String, intUserId: String, name: String, extUserId: String): BbbCommonEnvCoreMsg = {
  //    val routing = collection.immutable.HashMap("sender" -> "bbb-web")
  //    val envelope = BbbCoreEnvelope(EjectDuplicateUserReqMsg.NAME, routing)
  //    val header = BbbCoreHeaderWithMeetingId(EjectDuplicateUserReqMsg.NAME, meetingId)
  //    val body = EjectDuplicateUserReqMsgBody(meetingId = meetingId, intUserId = intUserId,
  //      name = name, extUserId = extUserId)
  //    val req = EjectDuplicateUserReqMsg(header, body)
  //    BbbCommonEnvCoreMsg(envelope, req)
  //  }

  def buildRegisterUserRequestToAkkaApps(msg: RegisterUser): BbbCommonEnvCoreMsg = {
    val routing = collection.immutable.HashMap("sender" -> "bbb-web")
    val envelope = BbbCoreEnvelope(RegisterUserReqMsg.NAME, routing)
    val header = BbbCoreHeaderWithMeetingId(RegisterUserReqMsg.NAME, msg.meetingId)
    val body = RegisterUserReqMsgBody(meetingId = msg.meetingId, intUserId = msg.intUserId,
      name = msg.name, role = msg.role, extUserId = msg.extUserId, authToken = msg.authToken,
      avatarURL = msg.avatarURL, guest = msg.guest, authed = msg.authed, guestStatus = msg.guestStatus,
      excludeFromDashboard = msg.excludeFromDashboard)
    val req = RegisterUserReqMsg(header, body)
    BbbCommonEnvCoreMsg(envelope, req)
  }

}
