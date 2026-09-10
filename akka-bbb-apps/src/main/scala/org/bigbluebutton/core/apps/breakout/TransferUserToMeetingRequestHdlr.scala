package org.bigbluebutton.core.apps.breakout

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.api.LiveKitMintTimeoutInternalMsg
import org.bigbluebutton.core.apps.{ BreakoutModel, PermissionCheck, RightsManagementTrait }
import org.bigbluebutton.core.apps.mediagroups.PublicMediaGroupIds
import org.bigbluebutton.core.db.{ MediaGroupUserDAO, UserDAO }
import org.bigbluebutton.core.domain.MeetingState2x
import org.bigbluebutton.core.models.{ LiveKitMembership, LiveKitMemberships, RegisteredUsers, VoiceUsers }
import org.bigbluebutton.core.running.{ HandlerHelpers, MeetingActor, OutMsgRouter }
import org.bigbluebutton.core2.message.senders.MsgBuilder

import scala.concurrent.duration._

trait TransferUserToMeetingRequestHdlr extends HandlerHelpers with RightsManagementTrait {
  this: MeetingActor =>

  val outGW: OutMsgRouter

  def handleTransferUserToMeetingRequestMsg(msg: TransferUserToMeetingRequestMsg, state: MeetingState2x): MeetingState2x = {
    val parentMeetingId = liveMeeting.props.meetingProp.intId

    if (permissionFailed(PermissionCheck.MOD_LEVEL, PermissionCheck.VIEWER_LEVEL, liveMeeting.users2x, msg.header.userId)) {
      val reason = "No permission to transfer user to voice breakout."
      PermissionCheck.ejectUserForFailedPermission(parentMeetingId, msg.header.userId, reason, outGW, liveMeeting)
      return state
    }

    if (isUsingLiveKitAudio(liveMeeting)) {
      processLiveKitTransfer(msg, state)
    } else {
      processFreeSwitchTransfer(msg, state)
    }
    state
  }

  // FreeSWITCH path: plain channel transfer between conferences.
  private def processFreeSwitchTransfer(msg: TransferUserToMeetingRequestMsg, state: MeetingState2x): Unit = {
    if (msg.body.fromMeetingId == liveMeeting.props.meetingProp.intId) {
      // want to transfer from parent meeting to breakout
      for {
        model <- state.breakout
        to <- getVoiceConf(msg.body.toMeetingId, model)
        from <- getVoiceConf(msg.body.fromMeetingId, model)
        voiceUser <- VoiceUsers.findWithIntId(liveMeeting.voiceUsers, msg.body.userId)
      } yield {
        UserDAO.transferUserToBreakoutRoomAsAudioOnly(msg.body.userId, msg.body.fromMeetingId, msg.body.toMeetingId)
        val event = buildTransferUserToVoiceConfSysMsg(from, to, voiceUser.voiceUserId)
        outGW.send(event)
      }
    } else {

      for {
        model <- state.breakout
        room <- model.find(msg.body.fromMeetingId)
      } yield {
        room.voiceUsers.foreach { vu =>
          log.info(" ***** Breakout voice user={} userId={}", vu, msg.body.userId)
        }
      }

      for {
        model <- state.breakout
        to <- getVoiceConf(msg.body.toMeetingId, model)
        from <- getVoiceConf(msg.body.fromMeetingId, model)
        room <- model.find(msg.body.fromMeetingId)
        voiceUser <- room.voiceUsers.find(p => p.id == msg.body.userId)
      } yield {
        UserDAO.transferUserToBreakoutRoomAsAudioOnly(msg.body.userId, msg.body.fromMeetingId, msg.body.toMeetingId)
        val event = buildTransferUserToVoiceConfSysMsg(from, to, voiceUser.voiceUserId)
        outGW.send(event)
      }
    }
  }

  private def processLiveKitTransfer(msg: TransferUserToMeetingRequestMsg, state: MeetingState2x): Unit = {
    val parentMeetingId = liveMeeting.props.meetingProp.intId
    val fromMeetingId = msg.body.fromMeetingId
    val toMeetingId = msg.body.toMeetingId
    val userId = msg.body.userId
    val fromIsBreakout = state.breakout.exists(_.find(fromMeetingId).isDefined)

    if (toMeetingId == parentMeetingId && fromMeetingId != parentMeetingId && fromIsBreakout) {
      // Transfer-back: from is a known breakout of this meeting. No user copy
      // needed on the way back, just clear the listen membership.
      livekitClearTransferredUser(userId, fromMeetingId)
    } else if (fromMeetingId == parentMeetingId && toMeetingId != parentMeetingId) {
      // Transfer-into: to is validated as a known breakout inside.
      livekitTransferIntoMeeting(userId, toMeetingId, state)
    } else {
      log.warning(
        "processLiveKitTransfer: rejected LK transfer user={} from={} to={} parent={}",
        userId, fromMeetingId, toMeetingId, parentMeetingId
      )
    }
  }

  private def livekitTransferIntoMeeting(userId: String, toMeetingId: String, state: MeetingState2x): Unit = {
    val parentMeetingId = liveMeeting.props.meetingProp.intId
    val breakoutFound = state.breakout.flatMap(_.find(toMeetingId))

    if (breakoutFound.isEmpty) {
      log.warning("livekitTransferIntoMeeting: unknown breakout {} for parent {}", toMeetingId, parentMeetingId)
      return
    }

    val regUser = RegisteredUsers.findWithUserId(userId, liveMeeting.registeredUsers)

    if (regUser.isEmpty) {
      log.warning("livekitTransferIntoMeeting: unknown user {} for parent {}", userId, parentMeetingId)
      return
    }

    // Auto switch: clear any previous breakout-listen membership first.
    val existingMemberships = LiveKitMemberships.findByUserAndPurpose(liveMeeting.liveKitMemberships, userId, "breakout-listen")

    existingMemberships.filter(_.roomName != toMeetingId).foreach { m =>
      log.warning("livekitTransferIntoMeeting: found existing listen-in membership for user={} breakout={}, cleaning up", userId, m.roomName)
      livekitClearTransferredUser(userId, m.roomName)
    }

    // Idempotent, already listening to the requested breakout.
    if (existingMemberships.exists(_.roomName == toMeetingId)) {
      return
    }

    val regUserName = regUser.map(_.name).getOrElse("Unknown")
    val grant = HandlerHelpers.buildLiveKitTokenGrant(
      room = toMeetingId,
      canPublish = true,
      canSubscribe = true,
      // Audio only transfer for now - matches FS behavior.
      canPublishSources = List(MicrophoneTrackSource)
    )
    val metadata = buildLiveKitParticipantMetadata(
      toMeetingId,
      breakoutFound.map(_.voiceConf).getOrElse("")
    )
    val roomRef = LiveKitRoomRef(toMeetingId, "breakout-listen")
    val membership = LiveKitMembership(
      userId = userId,
      roomName = toMeetingId,
      purpose = "breakout-listen",
      grant = grant,
      metadata = metadata,
      token = None,
      mintNonce = System.nanoTime()
    )
    LiveKitMemberships.add(liveMeeting.liveKitMemberships, membership)

    // Copy the moderator's user row into the breakout as an audio-only listener.
    // Required for both the transferred user to appear in the breakout room
    // (user list etc) and for the media group enrollment below
    UserDAO.transferUserToBreakoutRoomAsAudioOnly(userId, parentMeetingId, toMeetingId)

    // Enroll as sender + receiver in the breakout's public audio group
    // Largely the same logic as user enrollment on join (lazy group creation+insertion).
    MediaGroupUserDAO.insertUserIfGroupExists(
      meetingId = toMeetingId,
      groupId = PublicMediaGroupIds.AUDIO,
      userId = userId,
      sender = true,
      receiver = true,
      active = true
    )

    val req = MsgBuilder.buildGenerateLiveKitTokenReqMsg(
      parentMeetingId,
      userId,
      regUserName,
      roomRef,
      grant,
      metadata
    )
    outGW.send(req)
    scheduleLiveKitMintTimeout(userId, toMeetingId, membership.mintNonce)
    log.info("livekitTransferIntoMeeting: enqueued LK transfer for user={} toMeetingId={}", userId, toMeetingId)
  }

  private def scheduleLiveKitMintTimeout(userId: String, roomName: String, mintNonce: Long): Unit = {
    import context.dispatcher
    context.system.scheduler.scheduleOnce(
      10.seconds,
      self,
      LiveKitMintTimeoutInternalMsg(userId, roomName, mintNonce)
    )
  }

  def handleLiveKitMintTimeoutInternalMsg(msg: LiveKitMintTimeoutInternalMsg): Unit = {
    LiveKitMemberships.findByUserAndRoom(liveMeeting.liveKitMemberships, msg.userId, msg.roomName) match {
      // The nonce check pins the timeout to the membership that armed it: a
      // return + re-listen to the same room creates a new membership that a
      // stale timeout must not clear.
      case Some(m) if m.purpose == "breakout-listen" && m.token.isEmpty && m.mintNonce == msg.mintNonce =>
        log.warning(
          "handleLiveKitMintTimeoutInternalMsg: token mint timed out, clearing LK membership user={} roomName={}",
          msg.userId, msg.roomName
        )
        livekitClearTransferredUser(msg.userId, msg.roomName)
      case _ => // token arrived or membership already cleared, we are good
    }
  }

  private def livekitClearTransferredUser(userId: String, fromMeetingId: String): Unit = {
    val parentMeetingId = liveMeeting.props.meetingProp.intId

    // Only clears breakout-listen memberships
    LiveKitMemberships.findByUserAndRoom(liveMeeting.liveKitMemberships, userId, fromMeetingId) match {
      case Some(m) if m.purpose == "breakout-listen" =>
        LiveKitMemberships.removeByRoom(liveMeeting.liveKitMemberships, userId, fromMeetingId)
        // Mark the breakout's transferred user row loggedOut (same as FS-return);
        UserDAO.logOutTransferredUser(fromMeetingId, userId)
        MediaGroupUserDAO.deleteAllForUser(fromMeetingId, userId)
        outGW.send(MsgBuilder.buildRemoveLiveKitParticipantSysMsg(parentMeetingId, fromMeetingId, userId))
        log.info("livekitClearTransferredUser: cleared transferred user={} fromMeetingId={}", userId, fromMeetingId)

      case _ =>
        log.debug("livekitClearTransferredUser: no breakout-listen membership to clear user={} fromMeetingId={}", userId, fromMeetingId)
    }
  }

  private def buildTransferUserToVoiceConfSysMsg(fromVoiceConf: String, toVoiceConf: String, voiceUserId: String): BbbCommonEnvCoreMsg = {
    val routing = collection.immutable.HashMap("sender" -> "bbb-apps-akka")
    val envelope = BbbCoreEnvelope(TransferUserToVoiceConfSysMsg.NAME, routing)
    val header = BbbCoreHeaderWithMeetingId(TransferUserToVoiceConfSysMsg.NAME, props.meetingProp.intId)
    val body = TransferUserToVoiceConfSysMsgBody(fromVoiceConf, toVoiceConf, voiceUserId)
    BbbCommonEnvCoreMsg(envelope, TransferUserToVoiceConfSysMsg(header, body))
  }

  private def getVoiceConf(meetingId: String, breakoutModel: BreakoutModel): Option[String] = {
    if (meetingId == liveMeeting.props.meetingProp.intId) Some(liveMeeting.props.voiceProp.voiceConf)
    else breakoutModel.find(meetingId).map(_.voiceConf)
  }
}
