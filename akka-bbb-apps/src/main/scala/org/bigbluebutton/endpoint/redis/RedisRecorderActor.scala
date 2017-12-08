package org.bigbluebutton.endpoint.redis

import akka.actor.{ Actor, ActorLogging, ActorSystem, Props }
import org.bigbluebutton.SystemConfiguration
import redis.RedisClient
import scala.concurrent.ExecutionContext.Implicits.global
import scala.collection.immutable.StringOps
import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.record.events._
import org.bigbluebutton.core.apps.groupchats.GroupChatApp

object RedisRecorderActor {
  def props(system: ActorSystem): Props = Props(classOf[RedisRecorderActor], system)
}

class RedisRecorderActor(val system: ActorSystem)
    extends SystemConfiguration
    with Actor with ActorLogging {
  val redis = RedisClient(redisHost, redisPort)(system)

  // Set the name of this client to be able to distinguish when doing
  // CLIENT LIST on redis-cli
  redis.clientSetname("BbbAppsAkkaRecorder")

  val COLON = ":"

  private def record(session: String, message: collection.immutable.Map[String, String]): Unit = {
    for {
      msgid <- redis.incr("global:nextRecordedMsgId")
      key = "recording" + COLON + session + COLON + msgid
      _ <- redis.hmset(key.mkString, message)
      _ <- redis.expire(key.mkString, keysExpiresInSec)
      key2 = "meeting" + COLON + session + COLON + "recordings"
      _ <- redis.rpush(key2.mkString, msgid.toString)
      result <- redis.expire(key2.mkString, keysExpiresInSec)
    } yield result

  }

  def receive = {
    //=============================
    // 2x messages
    case msg: BbbCommonEnvCoreMsg => handleBbbCommonEnvCoreMsg(msg)

    case _                        => // do nothing
  }

  private def handleBbbCommonEnvCoreMsg(msg: BbbCommonEnvCoreMsg): Unit = {
    msg.core match {
      // Chat
      case m: GroupChatMessageBroadcastEvtMsg       => handleGroupChatMessageBroadcastEvtMsg(m)
      case m: ClearPublicChatHistoryEvtMsg          => handleClearPublicChatHistoryEvtMsg(m)

      // Presentation
      case m: PresentationConversionCompletedEvtMsg => handlePresentationConversionCompletedEvtMsg(m)
      case m: SetCurrentPageEvtMsg                  => handleSetCurrentPageEvtMsg(m)
      case m: ResizeAndMovePageEvtMsg               => handleResizeAndMovePageEvtMsg(m)
      case m: RemovePresentationEvtMsg              => handleRemovePresentationEvtMsg(m)
      case m: SetCurrentPresentationEvtMsg          => handleSetCurrentPresentationEvtMsg(m)
      case m: CreateNewPresentationPodEvtMsg        => handleCreateNewPresentationPodEvtMsg(m)
      case m: RemovePresentationPodEvtMsg           => handleRemovePresentationPodEvtMsg(m)
      case m: SetPresenterInPodRespMsg              => handleSetPresenterInPodRespMsg(m)

      // Whiteboard
      case m: SendWhiteboardAnnotationEvtMsg        => handleSendWhiteboardAnnotationEvtMsg(m)
      case m: SendCursorPositionEvtMsg              => handleSendCursorPositionEvtMsg(m)
      case m: ClearWhiteboardEvtMsg                 => handleClearWhiteboardEvtMsg(m)
      case m: UndoWhiteboardEvtMsg                  => handleUndoWhiteboardEvtMsg(m)

      // User
      case m: UserJoinedMeetingEvtMsg               => handleUserJoinedMeetingEvtMsg(m)
      case m: UserLeftMeetingEvtMsg                 => handleUserLeftMeetingEvtMsg(m)
      case m: PresenterAssignedEvtMsg               => handlePresenterAssignedEvtMsg(m)
      case m: UserEmojiChangedEvtMsg                => handleUserEmojiChangedEvtMsg(m)
      case m: UserBroadcastCamStartedEvtMsg         => handleUserBroadcastCamStartedEvtMsg(m)
      case m: UserBroadcastCamStoppedEvtMsg         => handleUserBroadcastCamStoppedEvtMsg(m)

      // Voice
      case m: UserJoinedVoiceConfToClientEvtMsg     => handleUserJoinedVoiceConfToClientEvtMsg(m)
      case m: UserLeftVoiceConfToClientEvtMsg       => handleUserLeftVoiceConfToClientEvtMsg(m)
      case m: UserMutedVoiceEvtMsg                  => handleUserMutedVoiceEvtMsg(m)
      case m: UserTalkingVoiceEvtMsg                => handleUserTalkingVoiceEvtMsg(m)

      case m: VoiceRecordingStartedEvtMsg           => handleVoiceRecordingStartedEvtMsg(m)
      case m: VoiceRecordingStoppedEvtMsg           => handleVoiceRecordingStoppedEvtMsg(m)

      // Caption
      case m: EditCaptionHistoryEvtMsg              => handleEditCaptionHistoryEvtMsg(m)

      // Screenshare
      case m: ScreenshareRtmpBroadcastStartedEvtMsg => handleScreenshareRtmpBroadcastStartedEvtMsg(m)
      case m: ScreenshareRtmpBroadcastStoppedEvtMsg => handleScreenshareRtmpBroadcastStoppedEvtMsg(m)
      //case m: DeskShareNotifyViewersRTMP  => handleDeskShareNotifyViewersRTMP(m)

      // Meeting
      case m: RecordingStatusChangedEvtMsg          => handleRecordingStatusChangedEvtMsg(m)
      case m: EndAndKickAllSysMsg                   => handleEndAndKickAllSysMsg(m)

      // Recording
      case m: RecordingChapterBreakSysMsg           => handleRecordingChapterBreakSysMsg(m)

      // Poll
      case m: PollStartedEvtMsg                     => handlePollStartedEvtMsg(m)
      case m: UserRespondedToPollRecordMsg          => handleUserRespondedToPollRecordMsg(m)
      case m: PollStoppedEvtMsg                     => handlePollStoppedEvtMsg(m)
      case m: PollShowResultEvtMsg                  => handlePollShowResultEvtMsg(m)

      case _                                        => // message not to be recorded.
    }
  }

  private def handleGroupChatMessageBroadcastEvtMsg(msg: GroupChatMessageBroadcastEvtMsg) {
    if (msg.body.chatId == GroupChatApp.MAIN_PUBLIC_CHAT) {
      val ev = new PublicChatRecordEvent()
      ev.setMeetingId(msg.header.meetingId)
      ev.setSender(msg.body.msg.sender.name)
      ev.setSenderId(msg.body.msg.sender.id)
      ev.setMessage(msg.body.msg.message)
      ev.setColor(msg.body.msg.color)

      record(msg.header.meetingId, ev.toMap)
    }
  }

  private def handleClearPublicChatHistoryEvtMsg(msg: ClearPublicChatHistoryEvtMsg) {
    val ev = new ClearPublicChatRecordEvent()
    ev.setMeetingId(msg.header.meetingId)

    record(msg.header.meetingId, ev.toMap)
  }

  private def handlePresentationConversionCompletedEvtMsg(msg: PresentationConversionCompletedEvtMsg) {
    val ev = new ConversionCompletedPresentationRecordEvent()
    ev.setMeetingId(msg.header.meetingId)
    ev.setPodId(msg.body.podId)
    ev.setPresentationName(msg.body.presentation.id)
    ev.setOriginalFilename(msg.body.presentation.name)

    record(msg.header.meetingId, ev.toMap)

    if (msg.body.presentation.current) {
      recordSharePresentationEvent(msg.header.meetingId, msg.body.podId, msg.body.presentation.id)
    }
  }

  private def handleSetCurrentPageEvtMsg(msg: SetCurrentPageEvtMsg) {
    val ev = new GotoSlideRecordEvent()
    ev.setMeetingId(msg.header.meetingId)
    ev.setPodId(msg.body.podId)
    ev.setPresentationName(msg.body.presentationId)
    ev.setSlide(getPageNum(msg.body.pageId))
    ev.setId(msg.body.pageId)

    record(msg.header.meetingId, ev.toMap)
  }

  private def handleResizeAndMovePageEvtMsg(msg: ResizeAndMovePageEvtMsg) {
    val ev = new ResizeAndMoveSlideRecordEvent()
    ev.setMeetingId(msg.header.meetingId)
    ev.setPodId(msg.body.podId)
    ev.setPresentationName(msg.body.presentationId)
    ev.setId(msg.body.pageId)
    ev.setXOffset(msg.body.xOffset)
    ev.setYOffset(msg.body.yOffset)
    ev.setWidthRatio(msg.body.widthRatio)
    ev.setHeightRatio(msg.body.heightRatio)

    record(msg.header.meetingId, ev.toMap)
  }

  private def handleRemovePresentationEvtMsg(msg: RemovePresentationEvtMsg) {
    val ev = new RemovePresentationRecordEvent()
    ev.setMeetingId(msg.header.meetingId)
    ev.setPodId(msg.body.podId)
    ev.setPresentationName(msg.body.presentationId)

    record(msg.header.meetingId, ev.toMap)
  }

  private def handleSetCurrentPresentationEvtMsg(msg: SetCurrentPresentationEvtMsg) {
    recordSharePresentationEvent(msg.header.meetingId, msg.body.podId, msg.body.presentationId)
  }

  private def handleCreateNewPresentationPodEvtMsg(msg: CreateNewPresentationPodEvtMsg) {
    val ev = new CreatePresentationPodRecordEvent()
    ev.setMeetingId(msg.header.meetingId)
    ev.setPodId(msg.body.podId)
    ev.setCurrentPresenter(msg.body.currentPresenterId)

    record(msg.header.meetingId, ev.toMap)
  }

  private def handleRemovePresentationPodEvtMsg(msg: RemovePresentationPodEvtMsg) {
    val ev = new RemovePresentationPodRecordEvent()
    ev.setMeetingId(msg.header.meetingId)
    ev.setPodId(msg.body.podId)

    record(msg.header.meetingId, ev.toMap)
  }

  private def handleSetPresenterInPodRespMsg(msg: SetPresenterInPodRespMsg) {
    val ev = new SetPresenterInPodRecordEvent()
    ev.setMeetingId(msg.header.meetingId)
    ev.setPodId(msg.body.podId)
    ev.setNextPresenterId(msg.body.nextPresenterId)

    record(msg.header.meetingId, ev.toMap)
  }

  private def recordSharePresentationEvent(meetingId: String, podId: String, presentationId: String) {
    val ev = new SharePresentationRecordEvent()
    ev.setMeetingId(meetingId)
    ev.setPodId(podId)
    ev.setPresentationName(presentationId)
    ev.setShare(true)

    record(meetingId, ev.toMap)
  }

  private def getPageNum(id: String): Integer = {
    val strId = new StringOps(id)
    val ids = strId.split('/')
    var pageNum = 0
    if (ids.length == 2) {
      pageNum = ids(1).toInt
    }
    pageNum
  }

  private def getPresentationId(whiteboardId: String): String = {
    // Need to split the whiteboard id into presenation id and page num as the old
    // recording expects them
    val strId = new StringOps(whiteboardId)
    val ids = strId.split('/')
    var presId: String = ""
    if (ids.length == 2) {
      presId = ids(0)
    }

    presId
  }

  private def handleSendWhiteboardAnnotationEvtMsg(msg: SendWhiteboardAnnotationEvtMsg) {
    val annotation = msg.body.annotation

    val ev = new AddShapeWhiteboardRecordEvent()
    ev.setMeetingId(msg.header.meetingId)
    ev.setPresentation(getPresentationId(annotation.wbId))
    ev.setPageNumber(getPageNum(annotation.wbId))
    ev.setWhiteboardId(annotation.wbId)
    ev.setUserId(annotation.userId)
    ev.setAnnotationId(annotation.id)
    ev.setPosition(annotation.position)
    ev.addAnnotation(annotation.annotationInfo)

    record(msg.header.meetingId, ev.toMap)
  }

  private def handleSendCursorPositionEvtMsg(msg: SendCursorPositionEvtMsg) {
    val ev = new WhiteboardCursorMoveRecordEvent()
    ev.setMeetingId(msg.header.meetingId)
    ev.setPresentation(getPresentationId(msg.body.whiteboardId))
    ev.setPageNumber(getPageNum(msg.body.whiteboardId))
    ev.setWhiteboardId(msg.body.whiteboardId)
    ev.setUserId(msg.header.userId)
    ev.setXPercent(msg.body.xPercent)
    ev.setYPercent(msg.body.yPercent)

    record(msg.header.meetingId, ev.toMap)
  }

  private def handleClearWhiteboardEvtMsg(msg: ClearWhiteboardEvtMsg) {
    val ev = new ClearWhiteboardRecordEvent()
    ev.setMeetingId(msg.header.meetingId)
    ev.setPresentation(getPresentationId(msg.body.whiteboardId))
    ev.setPageNumber(getPageNum(msg.body.whiteboardId))
    ev.setWhiteboardId(msg.body.whiteboardId)
    ev.setUserId(msg.body.userId)
    ev.setFullClear(msg.body.fullClear)

    record(msg.header.meetingId, ev.toMap)
  }

  private def handleUndoWhiteboardEvtMsg(msg: UndoWhiteboardEvtMsg) {
    val ev = new UndoAnnotationRecordEvent()
    ev.setMeetingId(msg.header.meetingId)
    ev.setPresentation(getPresentationId(msg.body.whiteboardId))
    ev.setPageNumber(getPageNum(msg.body.whiteboardId))
    ev.setWhiteboardId(msg.body.whiteboardId)
    ev.setUserId(msg.body.userId)
    ev.setShapeId(msg.body.annotationId)
    record(msg.header.meetingId, ev.toMap)
  }

  private def handleUserJoinedMeetingEvtMsg(msg: UserJoinedMeetingEvtMsg): Unit = {
    val ev = new ParticipantJoinRecordEvent()
    ev.setMeetingId(msg.header.meetingId)
    ev.setUserId(msg.body.intId)
    ev.setExternalUserId(msg.body.extId)
    ev.setName(msg.body.name)
    ev.setRole(msg.body.role)

    record(msg.header.meetingId, ev.toMap)
  }

  private def handleUserLeftMeetingEvtMsg(msg: UserLeftMeetingEvtMsg): Unit = {
    val ev = new ParticipantLeftRecordEvent()
    ev.setMeetingId(msg.header.meetingId)
    ev.setUserId(msg.body.intId)

    record(msg.header.meetingId, ev.toMap)
  }

  private def handlePresenterAssignedEvtMsg(msg: PresenterAssignedEvtMsg): Unit = {
    val ev = new AssignPresenterRecordEvent()
    ev.setMeetingId(msg.header.meetingId)
    ev.setUserId(msg.body.presenterId)
    ev.setName(msg.body.presenterName)
    ev.setAssignedBy(msg.body.assignedBy)

    record(msg.header.meetingId, ev.toMap)
  }
  private def handleUserEmojiChangedEvtMsg(msg: UserEmojiChangedEvtMsg) {
    handleUserStatusChange(msg.header.meetingId, msg.body.userId, "emojiStatus", msg.body.emoji)
  }

  private def handleUserBroadcastCamStartedEvtMsg(msg: UserBroadcastCamStartedEvtMsg) {
    handleUserStatusChange(msg.header.meetingId, msg.body.userId, "hasStream", "true,stream=" + msg.body.stream)
  }

  private def handleUserBroadcastCamStoppedEvtMsg(msg: UserBroadcastCamStoppedEvtMsg) {
    handleUserStatusChange(msg.header.meetingId, msg.body.userId, "hasStream", "false,stream=" + msg.body.stream)
  }

  private def handleUserStatusChange(meetingId: String, userId: String, statusName: String, statusValue: String): Unit = {
    val ev = new ParticipantStatusChangeRecordEvent()
    ev.setMeetingId(meetingId)
    ev.setUserId(userId)
    ev.setStatus(statusName)
    ev.setValue(statusValue)

    record(meetingId, ev.toMap)
  }

  private def handleUserJoinedVoiceConfToClientEvtMsg(msg: UserJoinedVoiceConfToClientEvtMsg) {
    val ev = new ParticipantJoinedVoiceRecordEvent()
    ev.setMeetingId(msg.header.meetingId)
    ev.setBridge(msg.body.voiceConf)
    ev.setParticipant(msg.body.intId)
    ev.setCallerName(msg.body.callerName)
    ev.setCallerNumber(msg.body.callerNum)
    ev.setMuted(msg.body.muted)
    ev.setTalking(msg.body.talking)

    record(msg.header.meetingId, ev.toMap)
  }

  private def handleUserLeftVoiceConfToClientEvtMsg(msg: UserLeftVoiceConfToClientEvtMsg) {
    val ev = new ParticipantLeftVoiceRecordEvent()
    ev.setMeetingId(msg.header.meetingId)
    ev.setBridge(msg.body.voiceConf)
    ev.setParticipant(msg.body.intId)

    record(msg.header.meetingId, ev.toMap)
  }

  private def handleUserMutedVoiceEvtMsg(msg: UserMutedVoiceEvtMsg) {
    val ev = new ParticipantMutedVoiceRecordEvent()
    ev.setMeetingId(msg.header.meetingId)
    ev.setBridge(msg.body.voiceConf)
    ev.setParticipant(msg.body.intId)
    ev.setMuted(msg.body.muted)

    record(msg.header.meetingId, ev.toMap)
  }

  private def handleUserTalkingVoiceEvtMsg(msg: UserTalkingVoiceEvtMsg) {
    val ev = new ParticipantTalkingVoiceRecordEvent()
    ev.setMeetingId(msg.header.meetingId)
    ev.setBridge(msg.body.voiceConf)
    ev.setParticipant(msg.body.intId)
    ev.setTalking(msg.body.talking)

    record(msg.header.meetingId, ev.toMap)
  }

  private def handleVoiceRecordingStartedEvtMsg(msg: VoiceRecordingStartedEvtMsg) {
    val ev = new StartRecordingVoiceRecordEvent()
    ev.setMeetingId(msg.header.meetingId)
    ev.setBridge(msg.body.voiceConf)
    ev.setRecordingTimestamp(msg.body.timestamp)
    ev.setFilename(msg.body.stream)

    record(msg.header.meetingId, ev.toMap)
  }

  private def handleVoiceRecordingStoppedEvtMsg(msg: VoiceRecordingStoppedEvtMsg) {
    val ev = new StopRecordingVoiceRecordEvent()
    ev.setMeetingId(msg.header.meetingId)
    ev.setBridge(msg.body.voiceConf)
    ev.setRecordingTimestamp(msg.body.timestamp)
    ev.setFilename(msg.body.stream)

    record(msg.header.meetingId, ev.toMap)
  }

  private def handleEditCaptionHistoryEvtMsg(msg: EditCaptionHistoryEvtMsg) {
    val ev = new EditCaptionHistoryRecordEvent()
    ev.setMeetingId(msg.header.meetingId)
    ev.setStartIndex(msg.body.startIndex)
    ev.setEndIndex(msg.body.endIndex)
    ev.setLocale(msg.body.locale)
    ev.setLocaleCode(msg.body.localeCode)
    ev.setText(msg.body.text)

    record(msg.header.meetingId, ev.toMap)
  }

  private def handleScreenshareRtmpBroadcastStartedEvtMsg(msg: ScreenshareRtmpBroadcastStartedEvtMsg) {
    val ev = new DeskshareStartRtmpRecordEvent()
    ev.setMeetingId(msg.header.meetingId)
    ev.setStreamPath(msg.body.stream)

    record(msg.header.meetingId, ev.toMap)
  }

  private def handleScreenshareRtmpBroadcastStoppedEvtMsg(msg: ScreenshareRtmpBroadcastStoppedEvtMsg) {
    val ev = new DeskshareStopRtmpRecordEvent()
    ev.setMeetingId(msg.header.meetingId)
    ev.setStreamPath(msg.body.stream)

    record(msg.header.meetingId, ev.toMap)
  }

  /*
  private def handleDeskShareNotifyViewersRTMP(msg: DeskShareNotifyViewersRTMP) {
    val ev = new DeskShareNotifyViewersRTMPRecordEvent()
    ev.setMeetingId(msg.header.meetingId)
    ev.setStreamPath(msg.streamPath)
    ev.setBroadcasting(msg.broadcasting)

    record(msg.header.meetingId, JavaConverters.mapAsScalaMap(ev.toMap).toMap)
  }
  */

  private def handleRecordingStatusChangedEvtMsg(msg: RecordingStatusChangedEvtMsg) {
    val ev = new RecordStatusRecordEvent()
    ev.setMeetingId(msg.header.meetingId)
    ev.setUserId(msg.body.setBy)
    ev.setRecordingStatus(msg.body.recording)

    record(msg.header.meetingId, ev.toMap)
  }

  private def handleEndAndKickAllSysMsg(msg: EndAndKickAllSysMsg): Unit = {
    val ev = new EndAndKickAllRecordEvent()
    ev.setMeetingId(msg.header.meetingId)

    record(msg.header.meetingId, ev.toMap)
  }

  private def handleRecordingChapterBreakSysMsg(msg: RecordingChapterBreakSysMsg): Unit = {
    val ev = new RecordChapterBreakRecordEvent()
    ev.setMeetingId(msg.header.meetingId)
    ev.setChapterBreakTimestamp(msg.body.timestamp)

    record(msg.header.meetingId, ev.toMap)
  }

  private def handlePollStartedEvtMsg(msg: PollStartedEvtMsg): Unit = {
    val ev = new PollStartedRecordEvent()
    ev.setPollId(msg.body.pollId)
    ev.setAnswers(msg.body.poll.answers)

    record(msg.header.meetingId, ev.toMap)
  }

  private def handleUserRespondedToPollRecordMsg(msg: UserRespondedToPollRecordMsg): Unit = {
    val ev = new UserRespondedToPollRecordEvent()
    ev.setPollId(msg.body.pollId)
    ev.setUserId(msg.header.userId)
    ev.setAnswerId(msg.body.answerId)

    record(msg.header.meetingId, ev.toMap)
  }

  private def handlePollStoppedEvtMsg(msg: PollStoppedEvtMsg): Unit = {
    pollStoppedRecordHelper(msg.header.meetingId, msg.body.pollId)
  }

  private def handlePollShowResultEvtMsg(msg: PollShowResultEvtMsg): Unit = {
    pollStoppedRecordHelper(msg.header.meetingId, msg.body.pollId)
  }

  private def pollStoppedRecordHelper(meetingId: String, pollId: String): Unit = {
    val ev = new PollStoppedRecordEvent()
    ev.setPollId(pollId)

    record(meetingId, ev.toMap)
  }
}
