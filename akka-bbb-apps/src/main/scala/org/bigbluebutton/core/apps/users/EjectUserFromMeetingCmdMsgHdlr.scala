package org.bigbluebutton.core.apps.users

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.models._
import org.bigbluebutton.core.running.{ LiveMeeting, OutMsgRouter }
import org.bigbluebutton.core2.message.senders.{ MsgBuilder, Sender }
import org.bigbluebutton.core.apps.PermissionCheck

trait EjectUserFromMeetingCmdMsgHdlr {
  this: UsersApp =>

  val liveMeeting: LiveMeeting
  val outGW: OutMsgRouter

  def handleEjectUserFromMeetingCmdMsg(msg: EjectUserFromMeetingCmdMsg) {
    if (applyPermissionCheck && !PermissionCheck.isAllowed(PermissionCheck.MOD_LEVEL, PermissionCheck.VIEWER_LEVEL, liveMeeting.users2x, msg.header.userId)) {
      val meetingId = liveMeeting.props.meetingProp.intId
      val reason = "No permission to eject user from meeting."
      PermissionCheck.ejectUserForFailedPermission(meetingId, msg.header.userId, reason, outGW)
    } else {
      for {
        user <- Users2x.ejectFromMeeting(liveMeeting.users2x, msg.body.userId)
      } yield {
        RegisteredUsers.remove(msg.body.userId, liveMeeting.registeredUsers)
        val reason = "user ejected by another user"
        // send a message to client
        Sender.sendUserEjectedFromMeetingClientEvtMsg(
          liveMeeting.props.meetingProp.intId,
          user.intId, msg.body.ejectedBy, reason, outGW
        )

        log.info("Ejecting user from meeting (client msg).  meetingId=" + liveMeeting.props.meetingProp.intId +
          " userId=" + msg.body.userId)

        // send a system message to force disconnection
        Sender.sendUserEjectedFromMeetingSystemMsg(
          liveMeeting.props.meetingProp.intId,
          user.intId, msg.body.ejectedBy, outGW
        )

        log.info("Ejecting user from meeting (system msg).  meetingId=" + liveMeeting.props.meetingProp.intId +
          " userId=" + msg.body.userId)

        // send a user left event for the clients to update
        val userLeftMeetingEvent = MsgBuilder.buildUserLeftMeetingEvtMsg(liveMeeting.props.meetingProp.intId, user.intId)
        outGW.send(userLeftMeetingEvent)
        log.info("User left meetingId=" + liveMeeting.props.meetingProp.intId + " userId=" + msg.body.userId)

        for {
          vu <- VoiceUsers.findWithIntId(liveMeeting.voiceUsers, msg.body.userId)
        } yield {
          val ejectFromVoiceEvent = MsgBuilder.buildEjectUserFromVoiceConfSysMsg(
            liveMeeting.props.meetingProp.intId,
            liveMeeting.props.voiceProp.voiceConf, vu.voiceUserId
          )
          outGW.send(ejectFromVoiceEvent)
          log.info("Ejecting user from voice.  meetingId=" + liveMeeting.props.meetingProp.intId + " userId=" + vu.intId)
        }

        if (user.presenter) {
          automaticallyAssignPresenter(outGW, liveMeeting)
        }
      }
    }
  }

}
