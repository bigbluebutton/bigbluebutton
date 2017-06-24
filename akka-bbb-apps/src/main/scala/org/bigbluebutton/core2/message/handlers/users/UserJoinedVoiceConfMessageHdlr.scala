package org.bigbluebutton.core2.message.handlers.users

import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.core.api._
import org.bigbluebutton.core.models.{ Roles, Users }
import org.bigbluebutton.core.running.MeetingActor
import org.bigbluebutton.core2.MeetingStatus2x
import org.bigbluebutton.common2.domain.VoiceUserVO

trait UserJoinedVoiceConfMessageHdlr {
  this: MeetingActor =>

  val outGW: OutMessageGateway

  def handleUserJoinedVoiceFromPhone(msg: UserJoinedVoiceConfMessage) = {
    log.info("User joining from phone.  meetingId=" + props.meetingProp.intId + " userId=" + msg.userId
      + " extUserId=" + msg.externUserId)

    Users.getUserWithVoiceUserId(msg.voiceUserId, liveMeeting.users) match {
      case Some(user) => {
        log.info("Voice user=" + msg.voiceUserId + " is already in conf="
          + props.voiceProp.voiceConf + ". Must be duplicate message. meetigId=" + props.meetingProp.intId)
      }
      case None => {
        val webUserId = if (msg.userId != msg.callerIdName) {
          msg.userId
        } else {
          // No current web user. This means that the user called in through
          // the phone. We need to generate a new user as we are not able
          // to match with a web user.
          Users.generateWebUserId(liveMeeting.users)
        }

        /**
         * If user is not joined listenOnly then user is joined calling through phone or webrtc.
         */
        val vu = new VoiceUserVO(msg.voiceUserId, webUserId, msg.callerIdName, msg.callerIdNum,
          joined = !msg.listenOnly, locked = false, muted = msg.muted, talking = msg.talking, msg.avatarURL, listenOnly = msg.listenOnly)

        /**
         * If user is not joined listenOnly then user is joined calling through phone or webrtc.
         * So we call him "phoneUser".
         */
        val uvo = Users.makeUserPhoneUser(vu, liveMeeting.users, webUserId, msg.externUserId, msg.callerIdName,
          lockStatus = getInitialLockStatus(Roles.VIEWER_ROLE),
          listenOnly = msg.listenOnly, avatarURL = msg.avatarURL)

        log.info("User joined from phone.  meetingId=" + props.meetingProp.intId + " userId=" + uvo.id + " user=" + uvo)

        outGW.send(new UserJoined(props.meetingProp.intId, props.recordProp.record, uvo))
        outGW.send(new UserJoinedVoice(props.meetingProp.intId, props.recordProp.record, props.voiceProp.voiceConf, uvo))

        if (MeetingStatus2x.isMeetingMuted(liveMeeting.status)) {
          outGW.send(new MuteVoiceUser(props.meetingProp.intId, props.recordProp.record, uvo.id, uvo.id,
            props.voiceProp.voiceConf, vu.userId, MeetingStatus2x.isMeetingMuted(liveMeeting.status)))
        }
      }
    }
  }

  def startRecordingVoiceConference() {
    if (Users.numUsersInVoiceConference(liveMeeting.users) == 1 &&
      props.recordProp.record &&
      !MeetingStatus2x.isVoiceRecording(liveMeeting.status)) {
      MeetingStatus2x.startRecordingVoice(liveMeeting.status)
      log.info("Send START RECORDING voice conf. meetingId=" + props.meetingProp.intId + " voice conf=" + props.voiceProp.voiceConf)
      outGW.send(new StartRecordingVoiceConf(props.meetingProp.intId, props.recordProp.record, props.voiceProp.voiceConf))
    }
  }

  def switchUserToPhoneUser(msg: UserJoinedVoiceConfMessage) = {
    log.info("User has been disconnected but still in voice conf. Switching to phone user. meetingId="
      + props.meetingProp.intId + " callername=" + msg.callerIdName
      + " userId=" + msg.userId + " extUserId=" + msg.externUserId)

    Users.findWithId(msg.userId, liveMeeting.users) match {
      case Some(user) => {
        val nu = Users.switchUserToPhoneUser(user, liveMeeting.users, msg.voiceUserId, msg.userId, msg.callerIdName,
          msg.callerIdNum, msg.muted, msg.talking, msg.avatarURL, msg.listenOnly)

        log.info("User joined voice. meetingId=" + props.meetingProp.intId + " userId=" + user.id + " user=" + nu)
        outGW.send(new UserJoinedVoice(props.meetingProp.intId, props.recordProp.record, props.voiceProp.voiceConf, nu))

        if (MeetingStatus2x.isMeetingMuted(liveMeeting.status)) {
          outGW.send(new MuteVoiceUser(props.meetingProp.intId, props.recordProp.record,
            nu.id, nu.id, props.voiceProp.voiceConf,
            nu.voiceUser.userId, MeetingStatus2x.isMeetingMuted(liveMeeting.status)))
        }
      }
      case None => {
        handleUserJoinedVoiceFromPhone(msg)
      }
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
        handleUserJoinedVoiceFromPhone(msg)
        startRecordingVoiceConference()
      }
    }
  }
}
