package org.bigbluebutton.core.apps.voice

import org.bigbluebutton.core.running.{ MeetingActor, OutMsgRouter }

trait UserJoinedVoiceConfMessageHdlr {
  this: MeetingActor =>

  val outGW: OutMsgRouter

  /*
  def startRecordingVoiceConference() {
    if (Users.numUsersInVoiceConference(liveMeeting.users) == 1 &&
      props.recordProp.record &&
      !MeetingStatus2x.isVoiceRecording(liveMeeting.status)) {
      MeetingStatus2x.startRecordingVoice(liveMeeting.status)
      log.info("Send START RECORDING voice conf. meetingId=" + props.meetingProp.intId + " voice conf=" + props.voiceProp.voiceConf)
      outGW.send(new StartRecordingVoiceConf(props.meetingProp.intId, props.recordProp.record, props.voiceProp.voiceConf))
    }
  }



  def handleUserJoinedVoiceConfMessage(msg: UserJoinedVoiceConfMessage) = {
    log.info("Received user joined voice. meetingId=" + props.meetingProp.intId + " callername=" + msg.callerIdName
      + " userId=" + msg.userId + " extUserId=" + msg.externUserId)

    Users.findWithId(msg.userId, liveMeeting.users) match {
      case Some(user) => {
        // this is used to restore the mute state on reconnect
        val previouslyMuted = user.voiceUser.muted

        val nu = Users.restoreMuteState(user, liveMeeting.users, msg.voiceUserId, msg.userId, msg.callerIdName,
          msg.callerIdNum, msg.muted, msg.talking, msg.avatarURL, msg.listenOnly)

        log.info("User joined voice. meetingId=" + props.meetingProp.intId + " userId=" + user.id + " user=" + nu)
        outGW.send(new UserJoinedVoice(props.meetingProp.intId, props.recordProp.record, props.voiceProp.voiceConf, nu))

        if (MeetingStatus2x.isMeetingMuted(liveMeeting.status) || previouslyMuted) {
          outGW.send(new MuteVoiceUser(props.meetingProp.intId, props.recordProp.record,
            nu.id, nu.id, props.voiceProp.voiceConf,
            nu.voiceUser.userId, true))
        }

        startRecordingVoiceConference()
      }
      case None => {
        startRecordingVoiceConference()
      }
    }
  }
  */
}
