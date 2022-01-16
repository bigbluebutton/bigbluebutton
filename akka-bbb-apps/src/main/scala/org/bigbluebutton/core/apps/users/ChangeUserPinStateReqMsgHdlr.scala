package org.bigbluebutton.core.apps.users

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.models.{ UserState, Users2x }
import org.bigbluebutton.core.running.{ LiveMeeting, OutMsgRouter }
import org.bigbluebutton.core.apps.{ PermissionCheck, RightsManagementTrait }
import org.bigbluebutton.core.domain.MeetingState2x

trait ChangeUserPinStateReqMsgHdlr extends RightsManagementTrait {
  this: UsersApp =>

  val liveMeeting: LiveMeeting
  val outGW: OutMsgRouter

  def handleChangeUserPinStateReqMsg(msg: ChangeUserPinStateReqMsg): Unit = {
    log.info("handleAssignPinReqMsg: changedBy={} pin={} userId={}", msg.body.changedBy, msg.body.pin, msg.body.userId)

    def broadcastUserPinChange(user: UserState, pin: Boolean): Unit = {
      val routingChange = Routing.addMsgToClientRouting(
        MessageTypes.BROADCAST_TO_MEETING,
        liveMeeting.props.meetingProp.intId, user.intId
      )
      val envelopeChange = BbbCoreEnvelope(UserPinStateChangedEvtMsg.NAME, routingChange)
      val headerChange = BbbClientMsgHeader(UserPinStateChangedEvtMsg.NAME, liveMeeting.props.meetingProp.intId,
        user.intId)

      val bodyChange = UserPinStateChangedEvtMsgBody(user.intId, pin, msg.body.changedBy)
      val eventChange = UserPinStateChangedEvtMsg(headerChange, bodyChange)
      val msgEventChange = BbbCommonEnvCoreMsg(envelopeChange, eventChange)
      outGW.send(msgEventChange)
    }

    if (permissionFailed(PermissionCheck.MOD_LEVEL, PermissionCheck.VIEWER_LEVEL, liveMeeting.users2x, msg.body.changedBy)
      || liveMeeting.props.meetingProp.isBreakout) {
      val meetingId = liveMeeting.props.meetingProp.intId
      val reason = "No permission to change pin in meeting."
      PermissionCheck.ejectUserForFailedPermission(meetingId, msg.body.changedBy, reason, outGW, liveMeeting)
    } else {
      for {
        oldPin <- Users2x.findPin(liveMeeting.users2x)
      } yield {
        if (oldPin.intId != msg.body.userId) {
          Users2x.changePin(liveMeeting.users2x, oldPin.intId, false)
          broadcastUserPinChange(oldPin, false)
        }
      }
      for {
        newPin <- Users2x.findWithIntId(liveMeeting.users2x, msg.body.userId)
      } yield {
        if (newPin.pin != msg.body.pin) {
          Users2x.changePin(liveMeeting.users2x, newPin.intId, msg.body.pin)
          broadcastUserPinChange(newPin, msg.body.pin)
        }
      }
    }
  }
}
