package org.bigbluebutton.core.running

import org.bigbluebutton.SystemConfiguration
import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.api.{ BreakoutRoomEndedInternalMsg, DestroyMeetingInternalMsg, EndBreakoutRoomInternalMsg }
import org.bigbluebutton.core.apps.groupchats.GroupChatApp
import org.bigbluebutton.core.apps.users.UsersApp
import org.bigbluebutton.core.apps.voice.VoiceApp
import org.bigbluebutton.core.bus.{ BigBlueButtonEvent, InternalEventBus }
import org.bigbluebutton.core.db.{ BreakoutRoomUserDAO, MeetingDAO, MeetingRecordingDAO, NotificationDAO, UserBreakoutRoomDAO }
import org.bigbluebutton.core.domain.{ MeetingEndReason, MeetingState2x }
import org.bigbluebutton.core.models._
import org.bigbluebutton.core2.MeetingStatus2x
import org.bigbluebutton.core2.message.senders.{ MsgBuilder, UserJoinedMeetingEvtMsgBuilder }
import org.bigbluebutton.core.util.TimeUtil

trait HandlerHelpers extends SystemConfiguration {

  def sendUserLeftFlagUpdatedEvtMsg(
      outGW:       OutMsgRouter,
      liveMeeting: LiveMeeting,
      intId:       String,
      leftFlag:    Boolean
  ): Unit = {
    for {
      u <- Users2x.findWithIntId(liveMeeting.users2x, intId)
    } yield {
      val userLeftFlagMeetingEvent = MsgBuilder.buildUserLeftFlagUpdatedEvtMsg(liveMeeting.props.meetingProp.intId, u.intId, leftFlag)
      outGW.send(userLeftFlagMeetingEvent)
    }
  }

  def userJoinMeeting(outGW: OutMsgRouter, authToken: String, clientType: String, mobile: Boolean,
                      liveMeeting: LiveMeeting, state: MeetingState2x): MeetingState2x = {

    val nu = for {
      regUser <- RegisteredUsers.findWithToken(authToken, liveMeeting.registeredUsers)
    } yield {
      // Flag that an authed user had joined the meeting in case
      // we need to end meeting when all authed users have left.
      if (regUser.authed) {
        MeetingStatus2x.authUserHadJoined(liveMeeting.status)
      }

      UserState(
        intId = regUser.id,
        extId = regUser.externId,
        meetingId = regUser.meetingId,
        name = regUser.name,
        role = regUser.role,
        bot = regUser.bot,
        guest = regUser.guest,
        authed = regUser.authed,
        guestStatus = regUser.guestStatus,
        reactionEmoji = "none",
        raiseHand = false,
        away = false,
        pin = false,
        mobile = mobile,
        presenter = false,
        locked = MeetingStatus2x.getPermissions(liveMeeting.status).lockOnJoin,
        avatar = regUser.avatarURL,
        webcamBackground = regUser.webcamBackgroundURL,
        color = regUser.color,
        clientType = clientType,
        userLeftFlag = UserLeftFlag(false, 0),
        userMetadata = regUser.userMetadata
      )
    }

    nu match {
      case Some(newUser) =>
        Users2x.findWithIntId(liveMeeting.users2x, newUser.intId) match {
          case Some(reconnectingUser) =>
            if (reconnectingUser.userLeftFlag.left) {
              // User has reconnected. Just reset it's flag. ralam Oct 23, 2018
              Users2x.resetUserLeftFlag(liveMeeting.users2x, newUser.intId)
            }
            state
          case None =>
            Users2x.add(liveMeeting.users2x, newUser)

            val event = UserJoinedMeetingEvtMsgBuilder.build(liveMeeting.props.meetingProp.intId, newUser)
            outGW.send(event)

            val notifyEvent = MsgBuilder.buildNotifyAllInMeetingEvtMsg(
              liveMeeting.props.meetingProp.intId,
              "info",
              "user",
              "app.notification.userJoinPushAlert",
              "Notification for a user joins the meeting",
              Map("userName"->s"${newUser.name}")
            )
            outGW.send(notifyEvent)
            NotificationDAO.insert(notifyEvent)

            val newState = startRecordingIfAutoStart2x(outGW, liveMeeting, state)
            if (!Users2x.hasPresenter(liveMeeting.users2x)) {
              // println(s"userJoinMeeting will trigger an automaticallyAssignPresenter for user=${newUser}")
              UsersApp.automaticallyAssignPresenter(outGW, liveMeeting)
            }
            newState.update(newState.expiryTracker.setUserHasJoined())
        }

      case None =>
        state
    }
  }

  def startRecordingIfAutoStart2x(outGW: OutMsgRouter, liveMeeting: LiveMeeting, state: MeetingState2x): MeetingState2x = {
    var newState = state
    if (liveMeeting.props.recordProp.record && !MeetingStatus2x.isRecording(liveMeeting.status) &&
      liveMeeting.props.recordProp.autoStartRecording && Users2x.numUsers(liveMeeting.users2x) == 1) {

      MeetingStatus2x.recordingStarted(liveMeeting.status)
      MeetingRecordingDAO.insertRecording(liveMeeting.props.meetingProp.intId, "")

      val tracker = state.recordingTracker.startTimer(TimeUtil.timeNowInMs())

      def buildRecordingStatusChangedEvtMsg(meetingId: String, userId: String, recording: Boolean): BbbCommonEnvCoreMsg = {
        val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, meetingId, userId)
        val envelope = BbbCoreEnvelope(RecordingStatusChangedEvtMsg.NAME, routing)
        val body = RecordingStatusChangedEvtMsgBody(recording, userId)
        val header = BbbClientMsgHeader(RecordingStatusChangedEvtMsg.NAME, meetingId, userId)
        val event = RecordingStatusChangedEvtMsg(header, body)

        BbbCommonEnvCoreMsg(envelope, event)
      }

      val event = buildRecordingStatusChangedEvtMsg(
        liveMeeting.props.meetingProp.intId,
        "system", MeetingStatus2x.isRecording(liveMeeting.status)
      )
      outGW.send(event)
      newState = state.update(tracker)
    }
    newState
  }

  def stopRecordingIfAutoStart2x(outGW: OutMsgRouter, liveMeeting: LiveMeeting, state: MeetingState2x): MeetingState2x = {
    var newState = state
    if (liveMeeting.props.recordProp.record && MeetingStatus2x.isRecording(liveMeeting.status) &&
      liveMeeting.props.recordProp.autoStartRecording && Users2x.numUsers(liveMeeting.users2x) == 0) {

      MeetingStatus2x.recordingStopped(liveMeeting.status)
      MeetingRecordingDAO.updateStopped(liveMeeting.props.meetingProp.intId, "")

      val tracker = state.recordingTracker.pauseTimer(TimeUtil.timeNowInMs())

      def buildRecordingStatusChangedEvtMsg(meetingId: String, userId: String, recording: Boolean): BbbCommonEnvCoreMsg = {
        val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, meetingId, userId)
        val envelope = BbbCoreEnvelope(RecordingStatusChangedEvtMsg.NAME, routing)
        val body = RecordingStatusChangedEvtMsgBody(recording, userId)
        val header = BbbClientMsgHeader(RecordingStatusChangedEvtMsg.NAME, meetingId, userId)
        val event = RecordingStatusChangedEvtMsg(header, body)

        BbbCommonEnvCoreMsg(envelope, event)
      }

      val event = buildRecordingStatusChangedEvtMsg(
        liveMeeting.props.meetingProp.intId,
        "system", MeetingStatus2x.isRecording(liveMeeting.status)
      )
      outGW.send(event)
      newState = state.update(tracker)
    }
    newState
  }

  def endMeeting(outGW: OutMsgRouter, liveMeeting: LiveMeeting, reason: String, userId: String): Unit = {
    def buildMeetingEndingEvtMsg(meetingId: String, userId: String): BbbCommonEnvCoreMsg = {
      val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, meetingId, userId)
      val envelope = BbbCoreEnvelope(MeetingEndingEvtMsg.NAME, routing)
      val body = MeetingEndingEvtMsgBody(meetingId, reason)
      val header = BbbClientMsgHeader(MeetingEndingEvtMsg.NAME, meetingId, userId)
      val event = MeetingEndingEvtMsg(header, body)

      BbbCommonEnvCoreMsg(envelope, event)
    }

    val endingEvent = buildMeetingEndingEvtMsg(liveMeeting.props.meetingProp.intId, userId)

    // Broadcast users the meeting will end
    outGW.send(endingEvent)

    MeetingStatus2x.meetingHasEnded(liveMeeting.status)

    def buildMeetingEndedEvtMsg(meetingId: String): BbbCommonEnvCoreMsg = {
      val routing = collection.immutable.HashMap("sender" -> "bbb-apps-akka")
      val envelope = BbbCoreEnvelope(MeetingEndedEvtMsg.NAME, routing)
      val body = MeetingEndedEvtMsgBody(meetingId)
      val header = BbbCoreBaseHeader(MeetingEndedEvtMsg.NAME)
      val event = MeetingEndedEvtMsg(header, body)

      BbbCommonEnvCoreMsg(envelope, event)
    }

    val endedEvnt = buildMeetingEndedEvtMsg(liveMeeting.props.meetingProp.intId)
    outGW.send(endedEvnt)

    MeetingDAO.setMeetingEnded(liveMeeting.props.meetingProp.intId, reason, userId)
  }

  def destroyMeeting(eventBus: InternalEventBus, meetingId: String): Unit = {
    eventBus.publish(BigBlueButtonEvent(meetingManagerChannel, new DestroyMeetingInternalMsg(meetingId)))
  }

  def notifyParentThatBreakoutEnded(eventBus: InternalEventBus, liveMeeting: LiveMeeting): Unit = {
    if (liveMeeting.props.meetingProp.isBreakout) {
      eventBus.publish(BigBlueButtonEvent(
        liveMeeting.props.breakoutProps.parentId,
        new BreakoutRoomEndedInternalMsg(liveMeeting.props.meetingProp.intId)
      ))
    }
  }

  def ejectAllUsersFromVoiceConf(outGW: OutMsgRouter, liveMeeting: LiveMeeting): Unit = {
    // Force stopping of voice recording if voice conf is being recorded.
    VoiceApp.stopRecordingVoiceConference(liveMeeting, outGW)

    val event = MsgBuilder.buildEjectAllFromVoiceConfMsg(liveMeeting.props.meetingProp.intId, liveMeeting.props.voiceProp.voiceConf)
    outGW.send(event)
  }

  def endAllBreakoutRooms(eventBus: InternalEventBus, liveMeeting: LiveMeeting, state: MeetingState2x, reason: String): MeetingState2x = {
    for {
      model <- state.breakout
    } yield {
      model.rooms.values.foreach { room =>
        eventBus.publish(BigBlueButtonEvent(room.id, EndBreakoutRoomInternalMsg(liveMeeting.props.meetingProp.intId, room.id, reason)))
        UserBreakoutRoomDAO.updateLastBreakoutRoom(liveMeeting.props.meetingProp.intId, Vector(), room)
      }
    }

    state.update(None)
  }

  def sendEndMeetingDueToExpiry(reason: String, eventBus: InternalEventBus, outGW: OutMsgRouter, liveMeeting: LiveMeeting, userId: String): Unit = {
    endMeeting(outGW, liveMeeting, reason, userId)
    notifyParentThatBreakoutEnded(eventBus, liveMeeting)
    ejectAllUsersFromVoiceConf(outGW, liveMeeting)
    destroyMeeting(eventBus, liveMeeting.props.meetingProp.intId)
  }

  def sendEndMeetingDueToExpiry2(reason: String, eventBus: InternalEventBus, outGW: OutMsgRouter, liveMeeting: LiveMeeting): Unit = {
    val meetingId = liveMeeting.props.meetingProp.intId

    val endMeetingEvt = buildMeetingEndingEvtMsg(reason, meetingId)
    outGW.send(endMeetingEvt)

    val endedEvt = buildMeetingEndedEvtMsg(meetingId)
    outGW.send(endedEvt)

    if (liveMeeting.props.meetingProp.isBreakout) {
      eventBus.publish(BigBlueButtonEvent(
        liveMeeting.props.breakoutProps.parentId,
        new BreakoutRoomEndedInternalMsg(meetingId)
      ))
    }

    // Force stopping of voice recording if voice conf is being recorded.
    VoiceApp.stopRecordingVoiceConference(liveMeeting, outGW)

    val event = MsgBuilder.buildEjectAllFromVoiceConfMsg(meetingId, liveMeeting.props.voiceProp.voiceConf)
    outGW.send(event)

    eventBus.publish(BigBlueButtonEvent(meetingManagerChannel, new DestroyMeetingInternalMsg(meetingId)))

    MeetingStatus2x.meetingHasEnded(liveMeeting.status)
  }

  def buildMeetingEndingEvtMsg(reason: String, meetingId: String): BbbCommonEnvCoreMsg = {
    val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, meetingId, "not-used")
    val envelope = BbbCoreEnvelope(MeetingEndingEvtMsg.NAME, routing)
    val body = MeetingEndingEvtMsgBody(meetingId, reason)
    val header = BbbClientMsgHeader(MeetingEndingEvtMsg.NAME, meetingId, "not-used")
    val event = MeetingEndingEvtMsg(header, body)

    BbbCommonEnvCoreMsg(envelope, event)
  }

  def buildMeetingEndedEvtMsg(meetingId: String): BbbCommonEnvCoreMsg = {
    val routing = collection.immutable.HashMap("sender" -> "bbb-apps-akka")
    val envelope = BbbCoreEnvelope(MeetingEndedEvtMsg.NAME, routing)
    val body = MeetingEndedEvtMsgBody(meetingId)
    val header = BbbCoreBaseHeader(MeetingEndedEvtMsg.NAME)
    val event = MeetingEndedEvtMsg(header, body)

    BbbCommonEnvCoreMsg(envelope, event)
  }

  def buildRemoveUserFromPresenterGroup(meetingId: String, userId: String, requesterId: String): BbbCommonEnvCoreMsg = {
    val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, meetingId, userId)
    val envelope = BbbCoreEnvelope(UserRemovedFromPresenterGroupEvtMsg.NAME, routing)
    val header = BbbClientMsgHeader(UserRemovedFromPresenterGroupEvtMsg.NAME, meetingId, userId)
    val body = UserRemovedFromPresenterGroupEvtMsgBody(userId, requesterId)
    val event = UserRemovedFromPresenterGroupEvtMsg(header, body)
    BbbCommonEnvCoreMsg(envelope, event)
  }

  def buildGroupChatMessageBroadcastEvtMsg(meetingId: String, userId: String, chatId: String,
                                           msg: GroupChatMessage): BbbCommonEnvCoreMsg = {

    val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, meetingId, userId)
    val envelope = BbbCoreEnvelope(GroupChatMessageBroadcastEvtMsg.NAME, routing)
    val header = BbbClientMsgHeader(GroupChatMessageBroadcastEvtMsg.NAME, meetingId, userId)
    val cmsgs = GroupChatApp.toMessageToUser(msg)
    val body = GroupChatMessageBroadcastEvtMsgBody(chatId, cmsgs)
    val event = GroupChatMessageBroadcastEvtMsg(header, body)
    BbbCommonEnvCoreMsg(envelope, event)
  }

  def buildGroupChatMessageEditedEvtMsg(meetingId: String, chatId: String, userId: String, msg: GroupChatMessage): BbbCommonEnvCoreMsg = {
    val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, meetingId, userId)
    val envelope = BbbCoreEnvelope(GroupChatMessageEditedEvtMsg.NAME, routing)
    val header = BbbClientMsgHeader(GroupChatMessageEditedEvtMsg.NAME, meetingId, userId)
    val body = GroupChatMessageEditedEvtMsgBody(chatId, msg.id, msg.message)
    val event = GroupChatMessageEditedEvtMsg(header, body)
    BbbCommonEnvCoreMsg(envelope, event)
  }

  def buildGroupChatMessageDeletedEvtMsg(meetingId: String, chatId: String, userId: String, messageId: String): BbbCommonEnvCoreMsg = {
    val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, meetingId, userId)
    val envelope = BbbCoreEnvelope(GroupChatMessageDeletedEvtMsg.NAME, routing)
    val header = BbbClientMsgHeader(GroupChatMessageDeletedEvtMsg.NAME, meetingId, userId)
    val body = GroupChatMessageDeletedEvtMsgBody(chatId, messageId)
    val event = GroupChatMessageDeletedEvtMsg(header, body)
    BbbCommonEnvCoreMsg(envelope, event)
  }

  def buildGroupChatMessageReactionSentEvtMsg(meetingId: String, userId: String, chatId: String, messageId: String, reactionEmoji: String, reactionEmojiId: String): BbbCommonEnvCoreMsg = {
    val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, meetingId, userId)
    val envelope = BbbCoreEnvelope(GroupChatMessageReactionSentEvtMsg.NAME, routing)
    val header = BbbClientMsgHeader(GroupChatMessageReactionSentEvtMsg.NAME, meetingId, userId)
    val body = GroupChatMessageReactionSentEvtMsgBody(chatId, messageId, reactionEmoji, reactionEmojiId)
    val event = GroupChatMessageReactionSentEvtMsg(header, body)
    BbbCommonEnvCoreMsg(envelope, event)
  }

  def buildGroupChatMessageReactionDeletedEvtMsg(meetingId: String, userId: String, chatId: String, messageId: String, reactionEmoji: String, reactionEmojiId: String): BbbCommonEnvCoreMsg = {
    val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, meetingId, userId)
    val envelope = BbbCoreEnvelope(GroupChatMessageReactionDeletedEvtMsg.NAME, routing)
    val header = BbbClientMsgHeader(GroupChatMessageReactionDeletedEvtMsg.NAME, meetingId, userId)
    val body = GroupChatMessageReactionDeletedEvtMsgBody(chatId, messageId, reactionEmoji, reactionEmojiId)
    val event = GroupChatMessageReactionDeletedEvtMsg(header, body)
    BbbCommonEnvCoreMsg(envelope, event)
  }

  def isUsingLiveKit(liveMeeting: LiveMeeting): Boolean = {
    liveMeeting.props.meetingProp.audioBridge == "livekit" ||
    liveMeeting.props.meetingProp.cameraBridge == "livekit" ||
    liveMeeting.props.meetingProp.screenShareBridge == "livekit"
  }

  def buildLiveKitTokenGrant(
    room: String,
    canPublish: Boolean,
    canSubscribe: Boolean,
    agent: Boolean = false,
    canPublishData: Boolean = false,
    canPublishSources: List[TrackSource] = List(),
    canUpdateOwnMetadata: Boolean = false,
    hidden: Boolean = false,
    ingressAdmin: Boolean = false,
    recorder: Boolean = false,
    roomAdmin: Boolean = false,
    roomCreate: Boolean = false,
    roomJoin: Boolean = true,
    roomList: Boolean = false,
    roomRecord: Boolean = false
  ): LiveKitGrant = {
    LiveKitGrant(
      agent = agent,
      canPublish = canPublish,
      canPublishData = canPublishData,
      canPublishSources = canPublishSources,
      canSubscribe = canSubscribe,
      canUpdateOwnMetadata = canUpdateOwnMetadata,
      hidden = hidden,
      ingressAdmin = ingressAdmin,
      recorder = recorder,
      room = room,
      roomAdmin = roomAdmin,
      roomCreate = roomCreate,
      roomJoin = roomJoin,
      roomList = roomList,
      roomRecord = roomRecord,
    )
  }

  def buildLiveKitParticipantMetadata(
    liveMeeting: LiveMeeting,
  ): LiveKitParticipantMetadata = {
    LiveKitParticipantMetadata(
      meetingId = liveMeeting.props.meetingProp.intId,
      voiceConf = liveMeeting.props.voiceProp.voiceConf
    )
  }
}
