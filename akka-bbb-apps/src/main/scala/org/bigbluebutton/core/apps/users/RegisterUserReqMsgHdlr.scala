package org.bigbluebutton.core.apps.users

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.core.models.RegisteredUsers
import org.bigbluebutton.core.running.{ BaseMeetingActor, LiveMeeting }
import org.bigbluebutton.core2.MeetingStatus2x

trait RegisterUserReqMsgHdlr {
  this: BaseMeetingActor =>

  val liveMeeting: LiveMeeting
  val outGW: OutMessageGateway

  def handle(msg: RegisterUserReqMsg): Unit = {
    log.debug("****** RECEIVED RegisterUserReqMsg msg {}", msg)
    if (MeetingStatus2x.hasMeetingEnded(liveMeeting.status)) {
      // Check first if the meeting has ended and the user refreshed the client to re-connect.
      log.info("Register user failed. Mmeeting has ended. meetingId=" + liveMeeting.props.meetingProp.intId +
        " userId=" + msg.body.intUserId)
    } else {
      val regUser = RegisteredUsers.create(msg.body.intUserId, msg.body.extUserId,
        msg.body.name, msg.body.role, msg.body.authToken,
        msg.body.avatarURL, msg.body.guest, msg.body.authed, msg.body.guest, liveMeeting.registeredUsers)

      log.info("Register user success. meetingId=" + liveMeeting.props.meetingProp.intId
        + " userId=" + msg.body.extUserId + " user=" + regUser)

      val event = buildUserRegisteredRespMsg(liveMeeting.props.meetingProp.intId, regUser.id, regUser.name, regUser.role)
      outGW.send(event)
    }

    def buildUserRegisteredRespMsg(meetingId: String, userId: String, name: String, role: String): BbbCommonEnvCoreMsg = {
      val routing = collection.immutable.HashMap("sender" -> "bbb-apps-akka")
      val envelope = BbbCoreEnvelope(UserRegisteredRespMsg.NAME, routing)
      val header = BbbCoreHeaderWithMeetingId(UserRegisteredRespMsg.NAME, meetingId)
      val body = UserRegisteredRespMsgBody(meetingId, userId, name, role)
      val event = UserRegisteredRespMsg(header, body)
      BbbCommonEnvCoreMsg(envelope, event)
    }
  }
}
