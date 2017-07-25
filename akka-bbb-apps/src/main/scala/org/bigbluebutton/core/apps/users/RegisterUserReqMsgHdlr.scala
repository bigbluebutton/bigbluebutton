package org.bigbluebutton.core.apps.users

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.models.RegisteredUsers
import org.bigbluebutton.core.running.{ LiveMeeting, OutMsgRouter }

trait RegisterUserReqMsgHdlr {
  this: UsersApp =>

  val liveMeeting: LiveMeeting
  val outGW: OutMsgRouter

  def handleRegisterUserReqMsg(msg: RegisterUserReqMsg): Unit = {
    log.debug("RECEIVED RegisterUserReqMsg msg {}", msg)

    def buildUserRegisteredRespMsg(meetingId: String, userId: String, name: String, role: String): BbbCommonEnvCoreMsg = {
      val routing = collection.immutable.HashMap("sender" -> "bbb-apps-akka")
      val envelope = BbbCoreEnvelope(UserRegisteredRespMsg.NAME, routing)
      val header = BbbCoreHeaderWithMeetingId(UserRegisteredRespMsg.NAME, meetingId)
      val body = UserRegisteredRespMsgBody(meetingId, userId, name, role)
      val event = UserRegisteredRespMsg(header, body)
      BbbCommonEnvCoreMsg(envelope, event)
    }

    val regUser = RegisteredUsers.create(msg.body.intUserId, msg.body.extUserId,
      msg.body.name, msg.body.role, msg.body.authToken,
      msg.body.avatarURL, msg.body.guest, msg.body.authed, msg.body.guest)

    RegisteredUsers.add(liveMeeting.registeredUsers, regUser)

    log.info("Register user success. meetingId=" + liveMeeting.props.meetingProp.intId
      + " userId=" + msg.body.extUserId + " user=" + regUser)

    val event = buildUserRegisteredRespMsg(liveMeeting.props.meetingProp.intId, regUser.id, regUser.name, regUser.role)
    outGW.send(event)

  }
}
