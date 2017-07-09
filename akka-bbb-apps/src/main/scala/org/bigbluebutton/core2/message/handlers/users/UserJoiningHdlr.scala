package org.bigbluebutton.core2.message.handlers.users

import org.bigbluebutton.common2.domain.VoiceUserVO
import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.core.api._
import org.bigbluebutton.core.models._
import org.bigbluebutton.core.running.MeetingActor
import org.bigbluebutton.core2.MeetingStatus2x

trait UserJoiningHdlr {
  this: MeetingActor =>

  val outGW: OutMessageGateway
  def handleUserJoin(msg: UserJoining): Unit = {
    log.debug("Received user joined meeting. metingId=" + props.meetingProp.intId + " userId=" + msg.userID)

    /*

      for {
        uvo <- Users.newUser(msg.userID, lockStatus, ru, waitingForAcceptance, vu, liveMeeting.users)
      } yield {
        log.info("User joined meeting. metingId=" + props.meetingProp.intId + " userId=" + uvo.id + " user=" + uvo)

        if (uvo.guest && MeetingStatus2x.getGuestPolicy(liveMeeting.status) == GuestPolicy.ALWAYS_DENY) {
          outGW.send(new GuestAccessDenied(props.meetingProp.intId, props.recordProp.record, uvo.id))
        } else {
          outGW.send(new UserJoined(props.meetingProp.intId, props.recordProp.record, uvo))
          outGW.send(new MeetingState(props.meetingProp.intId, props.recordProp.record, uvo.id,
            MeetingStatus2x.getPermissions(liveMeeting.status), MeetingStatus2x.isMeetingMuted(liveMeeting.status)))

          if (!waitingForAcceptance) {
            // Become presenter if the only moderator
            if ((Users.numModerators(liveMeeting.users) == 1) || (Users.hasNoPresenter(liveMeeting.users))) {
              if (ru.role == Roles.MODERATOR_ROLE) {
                log.info("Assigning presenter to lone moderator. metingId=" + props.meetingProp.intId + " userId=" + uvo.id)
                assignNewPresenter(msg.userID, ru.name, msg.userID)
              }
            }
          } else {
            log.info("User waiting for acceptance. metingId=" + props.meetingProp.intId + " userId=" + uvo.id)
          }
          liveMeeting.webUserJoined
          startRecordingIfAutoStart()
        }
      }
    */

  }
}
