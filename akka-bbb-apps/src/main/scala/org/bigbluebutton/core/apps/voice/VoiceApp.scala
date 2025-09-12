package org.bigbluebutton.core.apps.voice

import org.apache.pekko.actor.{ActorContext, ActorSystem, Cancellable}
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
import org.bigbluebutton.core.db.{MeetingVoiceDAO, UserDAO, UserVoiceDAO}
import org.bigbluebutton.core.util.ColorPicker
import org.bigbluebutton.core.util.TimeUtil

import scala.collection.immutable.Map
import scala.concurrent.duration._


object VoiceApp extends SystemConfiguration {
  // Key is userId
  var toggleListenOnlyTasks: Map[String, Cancellable] = Map()
  var recordingFileSplitters: Map[String, RecordingFileSplitter] = Map()

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

  def stopRecordingVoiceConference(liveMeeting: LiveMeeting, outGW: OutMsgRouter): Unit = {
    // stop file splitter
    val voiceconf = liveMeeting.props.voiceProp.voiceConf
    if (recordingFileSplitters.contains(voiceconf)) {
      recordingFileSplitters(voiceconf).stop();
      recordingFileSplitters = recordingFileSplitters - (voiceconf)
    }

    val recStreams = MeetingStatus2x.getVoiceRecordingStreams(liveMeeting.status)

    recStreams foreach { rs =>
      val event = MsgBuilder.buildStopRecordingVoiceConfSysMsg(
        liveMeeting.props.meetingProp.intId,
        liveMeeting.props.voiceProp.voiceConf, rs.stream
      )
      outGW.send(event)
    }
  }

  def startRecordingVoiceConference(
      liveMeeting:          LiveMeeting,
      outGW:                OutMsgRouter
  ): Unit = {
    val meetingId = liveMeeting.props.meetingProp.intId
    val now = TimeUtil.timeNowInMs()
    val recordFile = genRecordPath(
      voiceConfRecordPath,
      meetingId,
      now,
      voiceConfRecordCodec
    )
    if (voiceConfRecordEnableFileSplitter) {
      val voiceconf = liveMeeting.props.voiceProp.voiceConf
      if (recordingFileSplitters.contains(voiceconf)) {
        recordingFileSplitters(voiceconf).stop();
        recordingFileSplitters = recordingFileSplitters - (voiceconf)
      }
      val fileSplitter = new RecordingFileSplitter(liveMeeting, outGW, recordFile)
      recordingFileSplitters = recordingFileSplitters + (voiceconf -> fileSplitter)
      fileSplitter.start()
    } else {
      MeetingStatus2x.voiceRecordingStart(liveMeeting.status, recordFile)
      val event = MsgBuilder.buildStartRecordingVoiceConfSysMsg(
        liveMeeting.props.meetingProp.intId,
        liveMeeting.props.voiceProp.voiceConf,
        recordFile
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

  def broadcastUserDeafenedVoiceEvtMsg(
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
    val envelope = BbbCoreEnvelope(UserDeafenedVoiceEvtMsg.NAME, routing)
    val header = BbbClientMsgHeader(
      UserDeafenedVoiceEvtMsg.NAME,
      meetingId,
      vu.intId
    )

    val body = UserDeafenedVoiceEvtMsgBody(
      voiceConf = voiceConf,
      intId = vu.intId,
      voiceUserId = vu.intId,
      vu.deafened
    )

    val event = UserDeafenedVoiceEvtMsg(header, body)
    val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
    outGW.send(msgEvent)
  }

  def handleUserMutedInVoiceConfEvtMsg(
      liveMeeting: LiveMeeting,
      outGW:       OutMsgRouter,
      voiceUserId: String,
      muted:       Boolean
  )(implicit context: ActorContext): Unit = {
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

      // Ask for the audio channel to be switched to listen only mode
      // if the user is muted, otherwise switch back to normal mode
      // This is only effective if the "transparent listen only" mode is active
      // for the target user.
      toggleListenOnlyMode(
        liveMeeting,
        outGW,
        mutedUser.intId,
        mutedUser.callerNum,
        muted,
        toggleListenOnlyAfterMuteTimer
      )

      // If the user is muted or unmuted with an unheld channel, broadcast
      // the event right away.
      // If the user is unmuted, but channel is held, we need to wait for the
      // channel to be active again to broadcast the event. See
      // VoiceApp.handleChannelHoldChanged for this second case.
      if (muted || (!muted && !mutedUser.hold)) {
        broadcastUserMutedVoiceEvtMsg(
          liveMeeting.props.meetingProp.intId,
          mutedUser,
          liveMeeting.props.voiceProp.voiceConf,
          outGW
        )
      }
    }
  }

  def processUserStatusVoiceConfEvtMsg(
      liveMeeting: LiveMeeting,
      outGW:       OutMsgRouter,
      eventBus:    InternalEventBus,
      users:       Vector[ConfVoiceUser]
  )(implicit context: ActorContext): Unit = {
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
                false,
                false,
                cvu.talking,
                cvu.calledInto,
                cvu.hold,
                cvu.uuid,
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
      oldU <- VoiceUsers.removeWithIntId(liveMeeting.voiceUsers, u.meetingId, u.intId)
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
      listenOnlyInputDevice: Boolean,
      deafened:     Boolean,
      talking:      Boolean,
      callingInto:  String,
      hold:         Boolean,
      uuid:         String  = "unused"
  )(implicit context: ActorContext): Unit = {

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
      meetingId = liveMeeting.props.meetingProp.intId,
      callingWith,
      callerIdName,
      callerIdNum,
      color,
      muted,
      listenOnlyInputDevice,
      deafened,
      talking,
      listenOnly = isListenOnly,
      callingInto,
      System.currentTimeMillis(),
      floor = false,
      lastFloorTime = "0",
      hold,
      uuid
    )

    val prevTransparentLOStatus = VoiceHdlrHelpers.transparentListenOnlyAllowed(
      liveMeeting
    )

    VoiceUsers.add(liveMeeting.voiceUsers, voiceUserState)
    UserVoiceDAO.update(voiceUserState)
    UserDAO.updateVoiceUserJoined(voiceUserState)

    val newTransparentLOStatus = VoiceHdlrHelpers.transparentListenOnlyAllowed(
      liveMeeting
    )

    if (prevTransparentLOStatus != newTransparentLOStatus) {
      // If the transparent listen only mode was activated or deactivated
      // we need to update the listen only mode for all users in the meeting
      // that are not muted.
      handleTransparentLOModeChange(
        liveMeeting,
        outGW,
        newTransparentLOStatus
      )
    }

    broadcastEvent(voiceUserState)

    if (liveMeeting.props.meetingProp.isBreakout) {
      BreakoutHdlrHelpers.updateParentMeetingWithUsers(
        liveMeeting,
        eventBus
      )
    }

    if (!isListenOnly) {
      enforceMuteOnStartThreshold(liveMeeting, outGW)

      // if the meeting is muted tell freeswitch to mute the new person
      if (MeetingStatus2x.isMeetingMuted(liveMeeting.status)) {
        val event = MsgBuilder.buildMuteUserInVoiceConfSysMsg(
          liveMeeting.props.meetingProp.intId,
          voiceConf,
          intId,
          voiceUserId,
          true
        )
        outGW.send(event)
      }
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
      VoiceUsers.removeWithIntId(liveMeeting.voiceUsers, user.meetingId, user.intId)
      broadcastEvent(user)

      if (!user.listenOnly) {
        enforceMuteOnStartThreshold(liveMeeting, outGW)
      }
    }

    if (liveMeeting.props.meetingProp.isBreakout) {
      BreakoutHdlrHelpers.updateParentMeetingWithUsers(
        liveMeeting,
        eventBus
      )
    }
  }

  // Once #muteOnStartThreshold number of voice users is hit, we force
  // meetingMute on MeetingStatus2x and broadcast MeetingMutedEvtMsg to clients.
  // Otherwise, we broadcast MeetingMutedEvtMsg with the original muteOnStart
  // muteOnStartThreshold = 0 means no threshold (disabled).
  def enforceMuteOnStartThreshold(
    liveMeeting: LiveMeeting,
    outGW:       OutMsgRouter
  ): Unit = {
    val originalMuteOnStart = liveMeeting.props.voiceProp.muteOnStart

    if (muteOnStartThreshold == 0) {
      return
    }

    if (VoiceHdlrHelpers.muteOnStartThresholdReached(liveMeeting)) {
      if (!MeetingStatus2x.isMeetingMuted(liveMeeting.status)) {
        MeetingStatus2x.muteMeeting(liveMeeting.status)
        val event = MsgBuilder.buildMeetingMutedEvtMsg(
          liveMeeting.props.meetingProp.intId,
          SystemUser.ID,
          true,
          SystemUser.ID
        )
        outGW.send(event)
      }
    } else if (MeetingStatus2x.isMeetingMuted(liveMeeting.status) != originalMuteOnStart) {
      MeetingStatus2x.setMeetingMuted(liveMeeting.status, originalMuteOnStart)
      val event = MsgBuilder.buildMeetingMutedEvtMsg(
        liveMeeting.props.meetingProp.intId,
        SystemUser.ID,
        originalMuteOnStart,
        SystemUser.ID
      )
      outGW.send(event)
    }

    MeetingVoiceDAO.updateMuteOnStart(liveMeeting.props.meetingProp.intId, liveMeeting.status)
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
    intId:       String,
    voiceUserId: String,
    enabled: Boolean
  )(implicit context: ActorContext): Unit = {
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
      intId,
      voiceUserId,
      !enabled
    )
    outGW.send(muteEvent)

    deafenUserInVoiceConf(liveMeeting, outGW, intId, !enabled)
  }

  def removeToggleListenOnlyTask(userId: String): Unit = {
    toggleListenOnlyTasks get userId  match {
      case Some(task) =>
        task.cancel()
        toggleListenOnlyTasks = toggleListenOnlyTasks - userId
      case _ =>
    }
  }

  def handleTransparentLOModeChange(
    liveMeeting: LiveMeeting,
    outGW:       OutMsgRouter,
    allowed:     Boolean,
  )(implicit context: ActorContext): Unit = {
    VoiceUsers.findAllMutedVoiceUsers(liveMeeting.voiceUsers) foreach { vu =>
      if (allowed) {
        toggleListenOnlyMode(
          liveMeeting,
          outGW,
          vu.intId,
          vu.callerNum,
          vu.muted
        )
      } else {
        toggleListenOnlyMode(
          liveMeeting,
          outGW,
          vu.intId,
          vu.callerNum,
          false
        )
      }
    }
  }

  def toggleListenOnlyMode(
    liveMeeting:    LiveMeeting,
    outGW:          OutMsgRouter,
    userId:         String,
    callerNum:      String,
    enabled:        Boolean,
    delay:          Int = 0
  )(implicit context: ActorContext): Unit = {
    implicit def executionContext = context.system.dispatcher
    val allowed = VoiceHdlrHelpers.transparentListenOnlyAllowed(liveMeeting)
    // Guarantee there are no other tasks for this channel
    removeToggleListenOnlyTask(userId)

    // If the meeting has not yet hit the minium amount of duplex channels
    // for transparent listen only to be enabled, we don't need to do anything
    if (!allowed && enabled) {
      return
    }

    def broacastEvent(): Unit = {
      val event = MsgBuilder.buildToggleListenOnlyModeSysMsg(
        liveMeeting.props.meetingProp.intId,
        liveMeeting.props.voiceProp.voiceConf,
        userId,
        callerNum,
        enabled
      )
      outGW.send(event)
    }

    if (enabled && delay > 0) {
      // If we are enabling listen only mode, we wait a bit before actually
      // dispatching the command - the idea is that recently muted users
      // are more likely to unmute themselves right after the action, so this
      // should make frequent mute-unmute transitions smoother.
      // This is just one of the heuristics we have to implement for this to
      // work seamlessly, but it's a start. - prlanzarin Aug 04 2023
      val newTask = context.system.scheduler.scheduleOnce(delay seconds) {
        broacastEvent()
        removeToggleListenOnlyTask(userId)
      }

      toggleListenOnlyTasks = toggleListenOnlyTasks + (userId -> newTask)
    } else {
      // If we are disabling listen only mode, we can broadcast the event
      // right away
      broacastEvent()
    }
  }

  def holdChannelInVoiceConf(
    liveMeeting:  LiveMeeting,
    outGW:        OutMsgRouter,
    uuid:         String,
    hold:         Boolean
  ): Unit = {
    val event = MsgBuilder.buildHoldChannelInVoiceConfSysMsg(
      liveMeeting.props.meetingProp.intId,
      liveMeeting.props.voiceProp.voiceConf,
      uuid,
      hold
    )

    outGW.send(event)
  }

  def handleChannelHoldChanged(
    liveMeeting:  LiveMeeting,
    outGW:        OutMsgRouter,
    intId:        String,
    uuid:         String,
    hold:         Boolean
  )(implicit context: ActorContext): Unit = {
    VoiceUsers.holdStateChanged(
      liveMeeting.voiceUsers,
      intId,
      uuid,
      hold
    ) match {
      case Some(vu) =>
        // Mute vs hold state mismatch. Enforce it if the user is unmuted,
        // but hold is active, to avoid the user being unable to talk when
        // the channel is active again.
        if (!vu.muted && vu.hold) {
          toggleListenOnlyMode(
            liveMeeting,
            outGW,
            intId,
            vu.callerNum,
            vu.muted
          )
        }

        // User unmuted and channel is not on hold, broadcast user unmuted
        if (!vu.muted && !vu.hold) {
          broadcastUserMutedVoiceEvtMsg(
            liveMeeting.props.meetingProp.intId,
            vu,
            liveMeeting.props.voiceProp.voiceConf,
            outGW
          )
        }
      case _ =>
    }
  }

  def muteUserInVoiceConf(
    liveMeeting:  LiveMeeting,
    outGW:        OutMsgRouter,
    userId:       String,
    muted:         Boolean
  )(implicit context: ActorContext): Unit = {
    for {
      u <- VoiceUsers.findWithIntId(
        liveMeeting.voiceUsers,
        userId
      )
      } yield {
        if (u.muted != muted && (muted || !u.deafened)) {
          val muteEvent = MsgBuilder.buildMuteUserInVoiceConfSysMsg(
            liveMeeting.props.meetingProp.intId,
            liveMeeting.props.voiceProp.voiceConf,
            u.intId,
            u.voiceUserId,
            muted
          )

          // If we're unmuting, trigger a channel unhold -> toggle listen only
          // mode -> unmute
          if (!muted) {
            holdChannelInVoiceConf(
              liveMeeting,
              outGW,
              u.uuid,
              muted
            )
            toggleListenOnlyMode(
              liveMeeting,
              outGW,
              u.intId,
              u.callerNum,
              muted,
              0
            )
          }

          outGW.send(muteEvent)
        }
      }
  }

  def setListenOnlyInputInVoiceConf(
    liveMeeting:              LiveMeeting,
    outGW:                    OutMsgRouter,
    userId:                   String,
    listenOnlyInputDevice:    Boolean
  ): Unit = {
    for {
      u <- VoiceUsers.findWithIntId(
        liveMeeting.voiceUsers,
        userId
      )
    } yield {
      val event = MsgBuilder.buildSetListenOnlyInputInVoiceConfSysMsg(
        liveMeeting.props.meetingProp.intId,
        liveMeeting.props.voiceProp.voiceConf,
        userId,
        u.voiceUserId,
        listenOnlyInputDevice
      )
      outGW.send(event)

      VoiceUsers.userUpdatedListenOnlyInputDevice(liveMeeting.voiceUsers, u.voiceUserId, listenOnlyInputDevice)
    }
  }

  def deafenUserInVoiceConf(
    liveMeeting: LiveMeeting,
    outGW:       OutMsgRouter,
    userId:      String,
    deafened:    Boolean
  )(implicit context: ActorContext): Unit = {
    for {
      u <- VoiceUsers.findWithIntId(
        liveMeeting.voiceUsers,
        userId
      )
    } yield {
      val event = MsgBuilder.buildDeafUserInVoiceConfSysMsg(
        liveMeeting.props.meetingProp.intId,
        liveMeeting.props.voiceProp.voiceConf,
        userId,
        u.voiceUserId,
        deafened
      )
      outGW.send(event)

      // For now, deafening is mostly a client-side feature, so we don't
      // need to wait for media stack response + enforcement here.
      // This might change in the future (i.e.: if this needs to be
      // E2E enforced) - prlanzarin
      handleUserDeafenedInVoiceConfEvtMsg(
        liveMeeting,
        outGW,
        u.voiceUserId,
        deafened
      )
    }
  }

  def handleUserDeafenedInVoiceConfEvtMsg(
      liveMeeting: LiveMeeting,
      outGW:       OutMsgRouter,
      voiceUserId: String,
      deafened:       Boolean
  )(implicit context: ActorContext): Unit = {
    for {
      du <- VoiceUsers.userDeafened(liveMeeting.voiceUsers, voiceUserId, deafened)
    } yield {
      broadcastUserDeafenedVoiceEvtMsg(
        liveMeeting.props.meetingProp.intId,
        du,
        liveMeeting.props.voiceProp.voiceConf,
        outGW
      )

      if (deafened && !du.muted) {
        muteUserInVoiceConf(liveMeeting, outGW, du.intId, true)
      }
    }
  }

  def handleUserTalking(
    liveMeeting: LiveMeeting,
    outGW:       OutMsgRouter,
    voiceUserId: String,
    talking:     Boolean
  )(implicit context: ActorContext): Unit = {
    for {
      talkingUser <- VoiceUsers.userTalking(liveMeeting.voiceUsers, voiceUserId, talking)
    } yield {
      // Make sure lock settings are in effect
      LockSettingsUtil.enforceLockSettingsForVoiceUser(
        talkingUser,
        liveMeeting,
        outGW
      )
      AudioFloorManager.handleUserTalking(
        talkingUser.intId,
        talking,
        System.currentTimeMillis(),
        liveMeeting,
        outGW
      )
      val event = MsgBuilder.buildUserTalkingVoiceEvtMsg(
        liveMeeting.props.meetingProp.intId,
        liveMeeting.props.voiceProp.voiceConf,
        talkingUser.intId,
        talkingUser.voiceUserId,
        talking
      )
      outGW.send(event)
    }
  }

  def becameFloor(
    liveMeeting: LiveMeeting,
    outGW:       OutMsgRouter,
    voiceUserId: String,
    lastFloorTime:   String
  ): Unit = {
    for {
      u <- VoiceUsers.becameFloor(liveMeeting.voiceUsers, voiceUserId, true, lastFloorTime)
    } yield {
      val event = MsgBuilder.buildAudioFloorChangedEvtMsg(
        liveMeeting.props.meetingProp.intId,
        liveMeeting.props.voiceProp.voiceConf,
        u.intId,
        u.voiceUserId,
        floor = true,
        lastFloorTime
      )
      outGW.send(event)
    }
  }

  def releasedFloor(
    liveMeeting: LiveMeeting,
    outGW:       OutMsgRouter,
    voiceUserId: String,
    lastFloorTime: String
  ): Unit = {
    for {
      u <- VoiceUsers.releasedFloor(liveMeeting.voiceUsers, voiceUserId, false)
    } yield {
      val event = MsgBuilder.buildAudioFloorChangedEvtMsg(
        liveMeeting.props.meetingProp.intId,
        liveMeeting.props.voiceProp.voiceConf,
        u.intId,
        u.voiceUserId,
        floor = false,
        lastFloorTime
      )
      outGW.send(event)
    }
  }
}
