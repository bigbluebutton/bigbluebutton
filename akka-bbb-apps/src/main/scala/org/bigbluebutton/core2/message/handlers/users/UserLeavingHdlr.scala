package org.bigbluebutton.core2.message.handlers.users

import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.core.api.{ UserJoinedVoiceConfMessage, UserLeaving, UserLeft }
import org.bigbluebutton.core.models.Users
import org.bigbluebutton.core.running.MeetingActor

trait UserLeavingHdlr {
  this: MeetingActor =>

  val outGW: OutMessageGateway

  def handleUserLeft(msg: UserLeaving): Unit = {
    for {
      u <- Users.userLeft(msg.userID, liveMeeting.users)
    } yield {
      log.info("User left meeting. meetingId=" + props.meetingProp.intId + " userId=" + u.id + " user=" + u)
      outGW.send(new UserLeft(msg.meetingID, props.recordProp.record, u))

      makeSurePresenterIsAssigned(u)

      val vu = u.voiceUser
      if (vu.joined || u.listenOnly) {
        /**
         * The user that left is still in the voice conference. Maybe this user just got disconnected
         * and is reconnecting. Make the user as joined only in the voice conference. If we get a
         * user left voice conference message, then we will remove the user from the users list.
         */
        switchUserToPhoneUser(new UserJoinedVoiceConfMessage(props.voiceProp.voiceConf,
          vu.userId, u.id, u.externalId, vu.callerName,
          vu.callerNum, vu.muted, vu.talking, vu.avatarURL, u.listenOnly));
      }

      captionApp2x.handleUserLeavingMsg(u.id)
      liveMeeting.startCheckingIfWeNeedToEndVoiceConf()
      stopAutoStartedRecording()
    }
  }
}
