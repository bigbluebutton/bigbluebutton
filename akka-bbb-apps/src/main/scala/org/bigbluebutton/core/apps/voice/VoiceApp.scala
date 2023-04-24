package org.bigbluebutton.core.apps.voice

import org.bigbluebutton.SystemConfiguration
import org.bigbluebutton.LockSettingsUtil
import org.bigbluebutton.core.apps.breakout.BreakoutHdlrHelpers
import org.bigbluebutton.core.bus.InternalEventBus
import org.bigbluebutton.core2.MeetingStatus2x
import org.bigbluebutton.core2.message.senders.MsgBuilder
import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.running.{LiveMeeting, MeetingActor, OutMsgRouter}
import org.bigbluebutton.core.models._
import org.bigbluebutton.core.apps.users.UsersApp
import org.bigbluebutton.core.util.ColorPicker

object VoiceApp extends SystemConfiguration {

  def genRecordPath(
      recordDir:       String,
      meetingId:       String,
      timestamp:       Long,
      recordAudioCode: String
  ): String = {
    val validCodecs = Set("wav", "ogg", "opus", "flac")
    val tmpFileExt = recordAudioCode.toLowerCase().stripPrefix(".")
    var fileExt = ".wav"
    if (validCodecs.contains(tmpFileExt)) {
      fileExt = ".".concat(tmpFileExt)
    }

    val recordFilename = meetingId.concat("-").concat(timestamp.toString).concat(fileExt)
    if (recordDir.endsWith("/")) {
      recordDir.concat(recordFilename)
    } else {
      recordDir.concat("/").concat(recordFilename)
    }
  }

  def startRecordingVoiceConference(liveMeeting: LiveMeeting, outGW: OutMsgRouter, stream: String): Unit = {
    MeetingStatus2x.voiceRecordingStart(liveMeeting.status, stream)
    val event = MsgBuilder.buildStartRecordingVoiceConfSysMsg(
      liveMeeting.props.meetingProp.intId,
      liveMeeting.props.voiceProp.voiceConf,
      stream
    )
    outGW.send(event)
  }

  def stopRecordingVoiceConference(liveMeeting: LiveMeeting, outGW: OutMsgRouter): Unit = {

    val recStreams = MeetingStatus2x.getVoiceRecordingStreams(liveMeeting.status)

    recStreams foreach { rs =>
      val event = MsgBuilder.buildStopRecordingVoiceConfSysMsg(
        liveMeeting.props.meetingProp.intId,
        liveMeeting.props.voiceProp.voiceConf, rs.stream
      )
      outGW.send(event)
    }
  }

  def broadcastUserMutedVoiceEvtMsg(
      meetingId: String,
      vu:        VoiceUserState,
      voiceConf: String,
      outGW:     OutMsgRouter
  ): Unit = {
    val routing = Routing.addMsgToClientRouting(
      MessageTypes.BROADCAST_TO_MEETING,
      meetingId,
      vu.intId
    )
    val envelope = BbbCoreEnvelope(UserMutedVoiceEvtMsg.NAME, routing)
    val header = BbbClientMsgHeader(
      UserMutedVoiceEvtMsg.NAME,
      meetingId,
      vu.intId
    )

    val body = UserMutedVoiceEvtMsgBody(
      voiceConf = voiceConf,
      intId = vu.intId,
      voiceUserId = vu.intId,
      vu.muted
    )

    val event = UserMutedVoiceEvtMsg(header, body)
    val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
    outGW.send(msgEvent)
  }

  def handleUserMutedInVoiceConfEvtMsg(
      liveMeeting: LiveMeeting,
      outGW:       OutMsgRouter,
      voiceUserId: String,
      muted:       Boolean
  ): Unit = {
    for {
      mutedUser <- VoiceUsers.userMuted(liveMeeting.voiceUsers, voiceUserId, muted)
    } yield {
      if (!muted) {
        // Make sure lock settings are in effect (ralam dec 6, 2019)
        LockSettingsUtil.enforceLockSettingsForVoiceUser(
          mutedUser,
          liveMeeting,
          outGW
        )
      }

      broadcastUserMutedVoiceEvtMsg(
        liveMeeting.props.meetingProp.intId,
        mutedUser,
        liveMeeting.props.voiceProp.voiceConf,
        outGW
      )

    }
  }

  def processUserStatusVoiceConfEvtMsg(
      liveMeeting: LiveMeeting,
      outGW:       OutMsgRouter,
      eventBus:    InternalEventBus,
      users:       Vector[ConfVoiceUser]
  ): Unit = {
    users foreach { cvu =>
      VoiceUsers.findWithVoiceUserId(
        liveMeeting.voiceUsers,
        cvu.voiceUserId
      ) match {
          case Some(vu) =>
            if (vu.muted != cvu.muted) {
              handleUserMutedInVoiceConfEvtMsg(
                liveMeeting,
                outGW,
                cvu.voiceUserId,
                cvu.muted
              )
            } else {
              // Update the user status to indicate they are still in the voice conference.
              VoiceUsers.setLastStatusUpdate(liveMeeting.voiceUsers, vu)
            }

            // Purge voice users that don't have a matching user record
            // Avoid this if the meeting is a breakout room since might be real
            // voice users participating
            // Also avoid ejecting if the user is dial-in (v_*)
            if (ejectRogueVoiceUsers && !liveMeeting.props.meetingProp.isBreakout && !cvu.intId.startsWith("v_")) {
              Users2x.findWithIntId(liveMeeting.users2x, cvu.intId) match {
                case Some(_) =>
                case None =>
                  println(s"Ejecting rogue voice user. meetingId=${liveMeeting.props.meetingProp.intId} userId=${cvu.intId}")
                  val event = MsgBuilder.buildEjectUserFromVoiceConfSysMsg(liveMeeting.props.meetingProp.intId, liveMeeting.props.voiceProp.voiceConf, cvu.voiceUserId)
                  outGW.send(event)
              }
            }
          case None =>
            if (!cvu.intId.startsWith(IntIdPrefixType.DIAL_IN)) {
              handleUserJoinedVoiceConfEvtMsg(
                liveMeeting,
                outGW,
                eventBus,
                liveMeeting.props.voiceProp.voiceConf,
                cvu.intId,
                cvu.voiceUserId,
                cvu.callingWith,
                cvu.callerIdName,
                cvu.callerIdNum,
                ColorPicker.nextColor(liveMeeting.props.meetingProp.intId),
                cvu.muted,
                cvu.talking,
                cvu.calledInto
              )
            }
        }
    }

    // Remove users that hasn't been updated for the last two minutes as
    // these users might have already left.
    val twoMinutes = 2 * 60 * 1000
    val now = System.currentTimeMillis()
    VoiceUsers.findAllFreeswitchCallers(liveMeeting.voiceUsers) foreach { fsu =>
      if (now - fsu.lastStatusUpdateOn > twoMinutes) {
        handleUserLeftVoiceConfEvtMsg(
          liveMeeting,
          outGW,
          eventBus,
          liveMeeting.props.voiceProp.voiceConf,
          fsu.voiceUserId
        )
      }
    }
  }

  private def checkAndEjectOldDuplicateVoiceConfUser(
      userid:      String,
      liveMeeting: LiveMeeting,
      outGW:       OutMsgRouter
  ): Unit = {
    for {
      u <- VoiceUsers.findWithIntId(liveMeeting.voiceUsers, userid)
      oldU <- VoiceUsers.removeWithIntId(liveMeeting.voiceUsers, userid)
    } yield {
      val event = MsgBuilder.buildEjectUserFromVoiceConfSysMsg(liveMeeting.props.meetingProp.intId, liveMeeting.props.voiceProp.voiceConf, oldU.voiceUserId)
      outGW.send(event)
    }
  }

  def handleUserJoinedVoiceConfEvtMsg(
      liveMeeting:  LiveMeeting,
      outGW:        OutMsgRouter,
      eventBus:     InternalEventBus,
      voiceConf:    String,
      intId:        String,
      voiceUserId:  String,
      callingWith:  String,
      callerIdName: String,
      callerIdNum:  String,
      color:        String,
      muted:        Boolean,
      talking:      Boolean,
      callingInto:  String
  ): Unit = {

    def broadcastEvent(voiceUserState: VoiceUserState): Unit = {
      val routing = Routing.addMsgToClientRouting(
        MessageTypes.BROADCAST_TO_MEETING,
        liveMeeting.props.meetingProp.intId,
        voiceUserState.intId
      )
      val envelope = BbbCoreEnvelope(
        UserJoinedVoiceConfToClientEvtMsg.NAME,
        routing
      )
      val header = BbbClientMsgHeader(
        UserJoinedVoiceConfToClientEvtMsg.NAME,
        liveMeeting.props.meetingProp.intId,
        voiceUserState.intId
      )

      val body = UserJoinedVoiceConfToClientEvtMsgBody(
        voiceConf,
        voiceUserState.intId,
        voiceUserState.voiceUserId,
        voiceUserState.callerName,
        voiceUserState.callerNum,
        voiceUserState.color,
        voiceUserState.muted,
        voiceUserState.talking,
        voiceUserState.callingWith,
        voiceUserState.listenOnly
      )

      val event = UserJoinedVoiceConfToClientEvtMsg(
        header,
        body
      )
      val msgEvent = BbbCommonEnvCoreMsg(
        envelope,
        event
      )
      outGW.send(msgEvent)
    }

    checkAndEjectOldDuplicateVoiceConfUser(intId, liveMeeting, outGW)

    val isListenOnly = if (callerIdName.startsWith("LISTENONLY")) true else false

    val voiceUserState = VoiceUserState(
      intId,
      voiceUserId,
      callingWith,
      callerIdName,
      callerIdNum,
      color,
      muted,
      talking,
      listenOnly = isListenOnly,
      callingInto,
      System.currentTimeMillis(),
      floor = false,
      lastFloorTime = "0"
    )
    VoiceUsers.add(liveMeeting.voiceUsers, voiceUserState)

    broadcastEvent(voiceUserState)

    if (liveMeeting.props.meetingProp.isBreakout) {
      BreakoutHdlrHelpers.updateParentMeetingWithUsers(
        liveMeeting,
        eventBus
      )
    }

    // if the meeting is muted tell freeswitch to mute the new person
    if (!isListenOnly
      && MeetingStatus2x.isMeetingMuted(liveMeeting.status)) {
      val event = MsgBuilder.buildMuteUserInVoiceConfSysMsg(
        liveMeeting.props.meetingProp.intId,
        voiceConf,
        voiceUserId,
        true
      )
      outGW.send(event)
    }

    // Make sure lock settings are in effect. (ralam dec 6, 2019)
    LockSettingsUtil.enforceLockSettingsForVoiceUser(
      voiceUserState,
      liveMeeting,
      outGW
    )

  }

  def removeUserFromVoiceConf(
      liveMeeting:  LiveMeeting,
      outGW:        OutMsgRouter,
      voiceUserId:  String,
    ): Unit = {
    val guest = GuestApprovedVO(voiceUserId, GuestStatus.DENY)
      UsersApp.approveOrRejectGuest(liveMeeting, outGW, guest, SystemUser.ID)
      val event = MsgBuilder.buildEjectUserFromVoiceConfSysMsg(liveMeeting.props.meetingProp.intId, liveMeeting.props.voiceProp.voiceConf, voiceUserId)
      outGW.send(event)
  }

  def handleUserLeftVoiceConfEvtMsg(
      liveMeeting: LiveMeeting,
      outGW:       OutMsgRouter,
      eventBus:    InternalEventBus,
      voiceConf:   String,
      voiceUserId: String
  ): Unit = {

    def broadcastEvent(vu: VoiceUserState): Unit = {
      val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, liveMeeting.props.meetingProp.intId,
        vu.intId)
      val envelope = BbbCoreEnvelope(UserLeftVoiceConfToClientEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(UserLeftVoiceConfToClientEvtMsg.NAME, liveMeeting.props.meetingProp.intId, vu.intId)

      val body = UserLeftVoiceConfToClientEvtMsgBody(voiceConf = voiceConf, intId = vu.intId, voiceUserId = vu.intId)

      val event = UserLeftVoiceConfToClientEvtMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
      outGW.send(msgEvent)
    }

    for {
      user <- VoiceUsers.findWithVoiceUserId(liveMeeting.voiceUsers, voiceUserId)
    } yield {
      VoiceUsers.removeWithIntId(liveMeeting.voiceUsers, user.intId)
      broadcastEvent(user)
    }

    if (liveMeeting.props.meetingProp.isBreakout) {
      BreakoutHdlrHelpers.updateParentMeetingWithUsers(
        liveMeeting,
        eventBus
      )
    }
  }

/** Toggle audio for the given user in voice conference.
 *
 * We first stop the current audio being played, preventing the playback
 * to also mix the "You are the first person ..." audio.
 * After that we check if we are turning on/off based on enabled param. If
 * enabled is false we:
 *  - play a sound to let user know that an action is required
 *       (eg. guest approval) from the server/room.
 *  - put the user on hold, so DTMFs for mute / deaf mute are also disabled
 *  - mute the user (other participants won't hear users's audio)
 *  - deaf the user (user won't hear other participant's audio)
 * If disabled, we remove user from hold, mute and deaf states, allowing the
 * user to interact with the room.
 */
  def toggleUserAudioInVoiceConf(
    liveMeeting: LiveMeeting,
    outGW:       OutMsgRouter,
    voiceUserId: String,
    enabled: Boolean
  ): Unit = {
    val stopEvent = MsgBuilder.buildStopSoundInVoiceConfSysMsg(
      liveMeeting.props.meetingProp.intId,
      liveMeeting.props.voiceProp.voiceConf,
      ""
    )
    outGW.send(stopEvent)

    if (!enabled) {
      val playEvent = MsgBuilder.buildPlaySoundInVoiceConfSysMsg(
        liveMeeting.props.meetingProp.intId,
        liveMeeting.props.voiceProp.voiceConf,
        voiceUserId,
        dialInApprovalAudioPath
      )
      outGW.send(playEvent)
    }

    val holdEvent = MsgBuilder.buildHoldUserInVoiceConfSysMsg(
      liveMeeting.props.meetingProp.intId,
      liveMeeting.props.voiceProp.voiceConf,
      voiceUserId,
      !enabled
    )
    outGW.send(holdEvent)

    val muteEvent = MsgBuilder.buildMuteUserInVoiceConfSysMsg(
      liveMeeting.props.meetingProp.intId,
      liveMeeting.props.voiceProp.voiceConf,
      voiceUserId,
      !enabled
    )
    outGW.send(muteEvent)

    val deafEvent = MsgBuilder.buildDeafUserInVoiceConfSysMsg(
      liveMeeting.props.meetingProp.intId,
      liveMeeting.props.voiceProp.voiceConf,
      voiceUserId,
      !enabled
    )
    outGW.send(deafEvent)
  }
}
