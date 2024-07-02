package org.bigbluebutton.core2.message.handlers

import org.bigbluebutton.core.models.{ RegisteredUsers, Users2x, VoiceUsers }
import org.bigbluebutton.core.models.VoiceUsers.findAllListenOnlyVoiceUsers
import org.bigbluebutton.core.models.Webcams.findAll
import org.bigbluebutton.core.running.MeetingActor
import org.bigbluebutton.core2.MeetingStatus2x
import org.bigbluebutton.core2.MeetingStatus2x.hasAuthedUserJoined
import org.bigbluebutton.protos.{ BreakoutInfo, DurationInfo, MeetingInfo, ParticipantInfo, User }

trait GetMeetingInfoMsgHdlr {
  this: MeetingActor =>

  def handleGetMeetingInfo(): MeetingInfo = {
    val users = for {
      u <- Users2x.findAll(liveMeeting.users2x)
    } yield {
      User(
        userId = u.intId,
        fullName = u.name,
        role = u.role,
        isPresenter = u.presenter,
        isListeningOnly = findAllListenOnlyVoiceUsers(liveMeeting.voiceUsers).exists(v => v.intId == u.intId),
        hasJoinedVoice = VoiceUsers.findAllNonListenOnlyVoiceUsers(liveMeeting.voiceUsers).exists(v => v.intId == u.intId),
        hasVideo = findAll(liveMeeting.webcams).exists(w => w.userId == u.intId),
        clientType = u.clientType,
        customData = RegisteredUsers.findWithUserId(u.intId, liveMeeting.registeredUsers).get.customParameters
      )
    }

    val durationInfo = DurationInfo(
      createTime = liveMeeting.props.durationProps.createdTime,
      createdOn = liveMeeting.props.durationProps.createdDate,
      duration = liveMeeting.props.durationProps.duration,
      startTime = meetingStartTme,
      endTime = meetingEndTime,
      isRunning = MeetingStatus2x.hasMeetingEnded(liveMeeting.status),
      hasBeenForciblyEnded = false
    )

    val lc = findAllListenOnlyVoiceUsers(liveMeeting.voiceUsers).length
    val participantInfo = ParticipantInfo(
      hasUserJoined = hasAuthedUserJoined(liveMeeting.status),
      participantCount = Users2x.findAll(liveMeeting.users2x).length,
      listenerCount = lc,
      voiceParticipantCount = VoiceUsers.findAll(liveMeeting.voiceUsers).length - lc,
      videoCount = findAll(liveMeeting.webcams).length,
      maxUsers = liveMeeting.props.usersProp.maxUsers,
      moderatorCount = Users2x.findAll(liveMeeting.users2x).count(u => u.role.equalsIgnoreCase("moderator"))
    )

    val breakoutInfo = BreakoutInfo(
      isBreakout = liveMeeting.props.meetingProp.isBreakout,
      parentMeetingId = liveMeeting.props.breakoutProps.parentId,
      sequence = liveMeeting.props.breakoutProps.sequence,
      freeJoin = liveMeeting.props.breakoutProps.freeJoin
    )

    MeetingInfo(
      meetingName = liveMeeting.props.meetingProp.name,
      meetingExtId = liveMeeting.props.meetingProp.extId,
      meetingIntId = liveMeeting.props.meetingProp.intId,
      voiceBridge = liveMeeting.props.voiceProp.voiceConf,
      dialNumber = liveMeeting.props.voiceProp.dialNumber,
      attendeePw = liveMeeting.props.password.viewerPass,
      moderatorPw = liveMeeting.props.password.moderatorPass,
      recording = liveMeeting.props.recordProp.record,
      users = users,
      metadata = liveMeeting.props.metadataProp.metadata,
      breakoutRooms = if (state.breakout.isDefined) state.breakout.get.getRooms().map(_.name).toList else List(),
      durationInfo = Some(durationInfo),
      participantInfo = Some(participantInfo),
      breakoutInfo = Some(breakoutInfo)
    )
  }
}
