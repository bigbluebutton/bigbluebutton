package org.bigbluebutton.endpoint.redis

import scala.collection.immutable.StringOps
import scala.collection.JavaConverters._
import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.common2.redis.{ RedisConfig, RedisStorageProvider }
import org.bigbluebutton.core.apps.groupchats.GroupChatApp
import org.bigbluebutton.core.record.events._
import akka.actor.Actor
import akka.actor.ActorLogging
import akka.actor.ActorSystem
import akka.actor.Props
import org.bigbluebutton.service.HealthzService

import scala.concurrent.duration._
import scala.concurrent._
import ExecutionContext.Implicits.global

case object CheckRecordingDBStatus

object RedisRecorderActor {
  def props(
      system:         ActorSystem,
      redisConfig:    RedisConfig,
      healthzService: HealthzService
  ): Props =
    Props(
      classOf[RedisRecorderActor],
      system,
      redisConfig,
      healthzService
    )
}

class RedisRecorderActor(
    system:         ActorSystem,
    redisConfig:    RedisConfig,
    healthzService: HealthzService
)
  extends RedisStorageProvider(
    system,
    "BbbAppsAkkaRecorder",
    redisConfig
  ) with Actor with ActorLogging {

  system.scheduler.schedule(1.minutes, 1.minutes, self, CheckRecordingDBStatus)

  private def record(session: String, message: java.util.Map[java.lang.String, java.lang.String]): Unit = {
    redis.recordAndExpire(session, message)
  }

  def receive = {
    //=============================
    // 2x messages
    case msg: BbbCommonEnvCoreMsg => handleBbbCommonEnvCoreMsg(msg)
    case CheckRecordingDBStatus   => checkRecordingDBStatus()
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
      case m: SetPresentationDownloadableEvtMsg     => handleSetPresentationDownloadableEvtMsg(m)
      case m: SetCurrentPresentationEvtMsg          => handleSetCurrentPresentationEvtMsg(m)
      case m: CreateNewPresentationPodEvtMsg        => handleCreateNewPresentationPodEvtMsg(m)
      case m: RemovePresentationPodEvtMsg           => handleRemovePresentationPodEvtMsg(m)
      case m: SetPresenterInPodRespMsg              => handleSetPresenterInPodRespMsg(m)

      // Whiteboard
      case m: SendWhiteboardAnnotationsEvtMsg       => handleSendWhiteboardAnnotationsEvtMsg(m)
      case m: SendCursorPositionEvtMsg              => handleSendCursorPositionEvtMsg(m)
      case m: ClearWhiteboardEvtMsg                 => handleClearWhiteboardEvtMsg(m)
      case m: DeleteWhiteboardAnnotationsEvtMsg     => handleDeleteWhiteboardAnnotationsEvtMsg(m)

      // User
      case m: UserJoinedMeetingEvtMsg               => handleUserJoinedMeetingEvtMsg(m)
      case m: UserLeftMeetingEvtMsg                 => handleUserLeftMeetingEvtMsg(m)
      case m: PresenterAssignedEvtMsg               => handlePresenterAssignedEvtMsg(m)
      case m: UserEmojiChangedEvtMsg                => handleUserEmojiChangedEvtMsg(m)
      case m: UserRoleChangedEvtMsg                 => handleUserRoleChangedEvtMsg(m)
      case m: UserBroadcastCamStartedEvtMsg         => handleUserBroadcastCamStartedEvtMsg(m)
      case m: UserBroadcastCamStoppedEvtMsg         => handleUserBroadcastCamStoppedEvtMsg(m)

      // Voice
      case m: UserJoinedVoiceConfToClientEvtMsg     => handleUserJoinedVoiceConfToClientEvtMsg(m)
      case m: UserLeftVoiceConfToClientEvtMsg       => handleUserLeftVoiceConfToClientEvtMsg(m)
      case m: UserMutedVoiceEvtMsg                  => handleUserMutedVoiceEvtMsg(m)
      case m: UserTalkingVoiceEvtMsg                => handleUserTalkingVoiceEvtMsg(m)

      case m: VoiceRecordingStartedEvtMsg           => handleVoiceRecordingStartedEvtMsg(m)
      case m: VoiceRecordingStoppedEvtMsg           => handleVoiceRecordingStoppedEvtMsg(m)

      case m: AudioFloorChangedEvtMsg               => handleAudioFloorChangedEvtMsg(m)

      // Caption
      case m: EditCaptionHistoryEvtMsg              => handleEditCaptionHistoryEvtMsg(m)

      // Pads
      case m: PadCreatedRespMsg                     => handlePadCreatedRespMsg(m)

      // Screenshare
      case m: ScreenshareRtmpBroadcastStartedEvtMsg => handleScreenshareRtmpBroadcastStartedEvtMsg(m)
      case m: ScreenshareRtmpBroadcastStoppedEvtMsg => handleScreenshareRtmpBroadcastStoppedEvtMsg(m)
      //case m: DeskShareNotifyViewersRTMP  => handleDeskShareNotifyViewersRTMP(m)

      // AudioCaptions
      case m: TranscriptUpdatedEvtMsg               => handleTranscriptUpdatedEvtMsg(m)

      // Meeting
      case m: RecordingStatusChangedEvtMsg          => handleRecordingStatusChangedEvtMsg(m)
      case m: RecordStatusResetSysMsg               => handleRecordStatusResetSysMsg(m)
      case m: WebcamsOnlyForModeratorChangedEvtMsg  => handleWebcamsOnlyForModeratorChangedEvtMsg(m)
      case m: MeetingEndingEvtMsg                   => handleEndAndKickAllSysMsg(m)
      case m: MeetingCreatedEvtMsg                  => handleStarterConfigurations(m)

      // Recording
      case m: RecordingChapterBreakSysMsg           => handleRecordingChapterBreakSysMsg(m)

      // Poll
      case m: PollStartedEvtMsg                     => handlePollStartedEvtMsg(m)
      case m: UserRespondedToPollRecordMsg          => handleUserRespondedToPollRecordMsg(m)
      case m: PollStoppedEvtMsg                     => handlePollStoppedEvtMsg(m)
      case m: PollShowResultEvtMsg                  => handlePollShowResultEvtMsg(m)

      // ExternalVideo
      case m: StartExternalVideoEvtMsg              => handleStartExternalVideoEvtMsg(m)
      case m: UpdateExternalVideoEvtMsg             => handleUpdateExternalVideoEvtMsg(m)
      case m: StopExternalVideoEvtMsg               => handleStopExternalVideoEvtMsg(m)

      case _                                        => // message not to be recorded.
    }
  }

  private def handleGroupChatMessageBroadcastEvtMsg(msg: GroupChatMessageBroadcastEvtMsg) {
    if (msg.body.chatId == GroupChatApp.MAIN_PUBLIC_CHAT) {
      val ev = new PublicChatRecordEvent()
      ev.setMeetingId(msg.header.meetingId)
      ev.setSenderId(msg.body.msg.sender.id)
      ev.setMessage(msg.body.msg.message)
      ev.setSenderRole(msg.body.msg.sender.role)

      val isModerator = msg.body.msg.sender.role == "MODERATOR"
      ev.setChatEmphasizedText(msg.body.msg.chatEmphasizedText && isModerator)

      record(msg.header.meetingId, ev.toMap.asJava)
    }
  }

  private def handleClearPublicChatHistoryEvtMsg(msg: ClearPublicChatHistoryEvtMsg) {
    val ev = new ClearPublicChatRecordEvent()
    ev.setMeetingId(msg.header.meetingId)

    record(msg.header.meetingId, ev.toMap.asJava)
  }

  private def handlePresentationConversionCompletedEvtMsg(msg: PresentationConversionCompletedEvtMsg) {
    val ev = new ConversionCompletedPresentationRecordEvent()
    ev.setMeetingId(msg.header.meetingId)
    ev.setPodId(msg.body.podId)
    ev.setPresentationName(msg.body.presentation.id)
    ev.setOriginalFilename(msg.body.presentation.name)

    record(msg.header.meetingId, ev.toMap.asJava)

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

    record(msg.header.meetingId, ev.toMap.asJava)
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

    record(msg.header.meetingId, ev.toMap.asJava)
  }

  private def handleRemovePresentationEvtMsg(msg: RemovePresentationEvtMsg) {
    val ev = new RemovePresentationRecordEvent()
    ev.setMeetingId(msg.header.meetingId)
    ev.setPodId(msg.body.podId)
    ev.setPresentationName(msg.body.presentationId)

    record(msg.header.meetingId, ev.toMap.asJava)
  }

  private def handleSetPresentationDownloadableEvtMsg(msg: SetPresentationDownloadableEvtMsg) {
    val ev = new SetPresentationDownloadable()
    ev.setMeetingId(msg.header.meetingId)
    ev.setPodId(msg.body.podId)
    ev.setPresentationName(msg.body.presentationId)
    ev.setDownloadable(msg.body.downloadable)

    record(msg.header.meetingId, ev.toMap.asJava)
  }

  private def handleSetCurrentPresentationEvtMsg(msg: SetCurrentPresentationEvtMsg) {
    recordSharePresentationEvent(msg.header.meetingId, msg.body.podId, msg.body.presentationId)
  }

  private def handleCreateNewPresentationPodEvtMsg(msg: CreateNewPresentationPodEvtMsg) {
    val ev = new CreatePresentationPodRecordEvent()
    ev.setMeetingId(msg.header.meetingId)
    ev.setPodId(msg.body.podId)
    ev.setCurrentPresenter(msg.body.currentPresenterId)

    record(msg.header.meetingId, ev.toMap.asJava)
  }

  private def handleRemovePresentationPodEvtMsg(msg: RemovePresentationPodEvtMsg) {
    val ev = new RemovePresentationPodRecordEvent()
    ev.setMeetingId(msg.header.meetingId)
    ev.setPodId(msg.body.podId)

    record(msg.header.meetingId, ev.toMap.asJava)
  }

  private def handleSetPresenterInPodRespMsg(msg: SetPresenterInPodRespMsg) {
    val ev = new SetPresenterInPodRecordEvent()
    ev.setMeetingId(msg.header.meetingId)
    ev.setPodId(msg.body.podId)
    ev.setNextPresenterId(msg.body.nextPresenterId)

    record(msg.header.meetingId, ev.toMap.asJava)
  }

  private def recordSharePresentationEvent(meetingId: String, podId: String, presentationId: String) {
    val ev = new SharePresentationRecordEvent()
    ev.setMeetingId(meetingId)
    ev.setPodId(podId)
    ev.setPresentationName(presentationId)
    ev.setShare(true)

    record(meetingId, ev.toMap.asJava)
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

  private def handleSendWhiteboardAnnotationsEvtMsg(msg: SendWhiteboardAnnotationsEvtMsg) {
    // filter poll annotations that are still not tldraw ready
    msg.body.annotations.filter(!_.annotationInfo.contains("answers")).foreach(annotation => {
      val ev = new AddTldrawShapeWhiteboardRecordEvent()
      ev.setMeetingId(msg.header.meetingId)
      ev.setPresentation(getPresentationId(annotation.wbId))
      ev.setPageNumber(getPageNum(annotation.wbId))
      ev.setWhiteboardId(annotation.wbId)
      ev.setUserId(annotation.userId)
      ev.setAnnotationId(annotation.id)
      ev.addAnnotation(annotation.annotationInfo)

      record(msg.header.meetingId, ev.toMap.asJava)
    })
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

    record(msg.header.meetingId, ev.toMap.asJava)
  }

  private def handleClearWhiteboardEvtMsg(msg: ClearWhiteboardEvtMsg) {
    val ev = new ClearWhiteboardRecordEvent()
    ev.setMeetingId(msg.header.meetingId)
    ev.setPresentation(getPresentationId(msg.body.whiteboardId))
    ev.setPageNumber(getPageNum(msg.body.whiteboardId))
    ev.setWhiteboardId(msg.body.whiteboardId)
    ev.setUserId(msg.body.userId)
    ev.setFullClear(msg.body.fullClear)

    record(msg.header.meetingId, ev.toMap.asJava)
  }

  private def handleDeleteWhiteboardAnnotationsEvtMsg(msg: DeleteWhiteboardAnnotationsEvtMsg) {
    msg.body.annotationsIds.foreach(annotationId => {
      val ev = new DeleteTldrawShapeRecordEvent()
      ev.setMeetingId(msg.header.meetingId)
      ev.setPresentation(getPresentationId(msg.body.whiteboardId))
      ev.setPageNumber(getPageNum(msg.body.whiteboardId))
      ev.setWhiteboardId(msg.body.whiteboardId)
      ev.setUserId(msg.header.userId)
      ev.setShapeId(annotationId)
      record(msg.header.meetingId, ev.toMap.asJava)
    })
  }

  private def handleUserJoinedMeetingEvtMsg(msg: UserJoinedMeetingEvtMsg): Unit = {
    val ev = new ParticipantJoinRecordEvent()
    ev.setMeetingId(msg.header.meetingId)
    ev.setUserId(msg.body.intId)
    ev.setExternalUserId(msg.body.extId)
    ev.setName(msg.body.name)
    ev.setRole(msg.body.role)

    record(msg.header.meetingId, ev.toMap.asJava)
  }

  private def handleUserLeftMeetingEvtMsg(msg: UserLeftMeetingEvtMsg): Unit = {
    val ev = new ParticipantLeftRecordEvent()
    ev.setMeetingId(msg.header.meetingId)
    ev.setUserId(msg.body.intId)

    record(msg.header.meetingId, ev.toMap.asJava)
  }

  private def handlePresenterAssignedEvtMsg(msg: PresenterAssignedEvtMsg): Unit = {
    val ev = new AssignPresenterRecordEvent()
    ev.setMeetingId(msg.header.meetingId)
    ev.setUserId(msg.body.presenterId)
    ev.setName(msg.body.presenterName)
    ev.setAssignedBy(msg.body.assignedBy)

    record(msg.header.meetingId, ev.toMap.asJava)
  }
  private def handleUserEmojiChangedEvtMsg(msg: UserEmojiChangedEvtMsg) {
    handleUserStatusChange(msg.header.meetingId, msg.body.userId, "emojiStatus", msg.body.emoji)
  }

  private def handleUserRoleChangedEvtMsg(msg: UserRoleChangedEvtMsg) {
    handleUserStatusChange(msg.header.meetingId, msg.body.userId, "role", msg.body.role)
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

    record(meetingId, ev.toMap.asJava)
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

    record(msg.header.meetingId, ev.toMap.asJava)
  }

  private def handleUserLeftVoiceConfToClientEvtMsg(msg: UserLeftVoiceConfToClientEvtMsg) {
    val ev = new ParticipantLeftVoiceRecordEvent()
    ev.setMeetingId(msg.header.meetingId)
    ev.setBridge(msg.body.voiceConf)
    ev.setParticipant(msg.body.intId)

    record(msg.header.meetingId, ev.toMap.asJava)
  }

  private def handleUserMutedVoiceEvtMsg(msg: UserMutedVoiceEvtMsg) {
    val ev = new ParticipantMutedVoiceRecordEvent()
    ev.setMeetingId(msg.header.meetingId)
    ev.setBridge(msg.body.voiceConf)
    ev.setParticipant(msg.body.intId)
    ev.setMuted(msg.body.muted)

    record(msg.header.meetingId, ev.toMap.asJava)
  }

  private def handleUserTalkingVoiceEvtMsg(msg: UserTalkingVoiceEvtMsg) {
    val ev = new ParticipantTalkingVoiceRecordEvent()
    ev.setMeetingId(msg.header.meetingId)
    ev.setBridge(msg.body.voiceConf)
    ev.setParticipant(msg.body.intId)
    ev.setTalking(msg.body.talking)

    record(msg.header.meetingId, ev.toMap.asJava)
  }

  private def handleVoiceRecordingStartedEvtMsg(msg: VoiceRecordingStartedEvtMsg) {
    val ev = new StartRecordingVoiceRecordEvent()
    ev.setMeetingId(msg.header.meetingId)
    ev.setBridge(msg.body.voiceConf)
    ev.setRecordingTimestamp(msg.body.timestamp)
    ev.setFilename(msg.body.stream)

    record(msg.header.meetingId, ev.toMap.asJava)
  }

  private def handleVoiceRecordingStoppedEvtMsg(msg: VoiceRecordingStoppedEvtMsg) {
    val ev = new StopRecordingVoiceRecordEvent()
    ev.setMeetingId(msg.header.meetingId)
    ev.setBridge(msg.body.voiceConf)
    ev.setRecordingTimestamp(msg.body.timestamp)
    ev.setFilename(msg.body.stream)

    record(msg.header.meetingId, ev.toMap.asJava)
  }

  private def handleAudioFloorChangedEvtMsg(msg: AudioFloorChangedEvtMsg) {
    val ev = new AudioFloorChangedRecordEvent()
    ev.setMeetingId(msg.header.meetingId)
    ev.setBridge(msg.body.voiceConf)
    ev.setParticipant(msg.body.intId)
    ev.setFloor(msg.body.floor)
    ev.setLastFloorTime(msg.body.lastFloorTime)

    record(msg.header.meetingId, ev.toMap.asJava)
  }

  private def handleEditCaptionHistoryEvtMsg(msg: EditCaptionHistoryEvtMsg) {
    val ev = new EditCaptionHistoryRecordEvent()
    ev.setMeetingId(msg.header.meetingId)
    ev.setStartIndex(msg.body.startIndex)
    ev.setEndIndex(msg.body.endIndex)
    ev.setName(msg.body.name)
    ev.setLocale(msg.body.locale)
    ev.setText(msg.body.text)

    record(msg.header.meetingId, ev.toMap.asJava)
  }

  private def handlePadCreatedRespMsg(msg: PadCreatedRespMsg) {
    val ev = new PadCreatedRecordEvent()
    ev.setMeetingId(msg.header.meetingId)
    ev.setPadId(msg.body.padId)

    record(msg.header.meetingId, ev.toMap.asJava)
  }

  private def handleScreenshareRtmpBroadcastStartedEvtMsg(msg: ScreenshareRtmpBroadcastStartedEvtMsg) {
    val ev = new DeskshareStartRtmpRecordEvent()
    ev.setMeetingId(msg.header.meetingId)
    ev.setStreamPath(msg.body.stream)

    record(msg.header.meetingId, ev.toMap.asJava)
  }

  private def handleScreenshareRtmpBroadcastStoppedEvtMsg(msg: ScreenshareRtmpBroadcastStoppedEvtMsg) {
    val ev = new DeskshareStopRtmpRecordEvent()
    ev.setMeetingId(msg.header.meetingId)
    ev.setStreamPath(msg.body.stream)

    record(msg.header.meetingId, ev.toMap.asJava)
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

  private def handleTranscriptUpdatedEvtMsg(msg: TranscriptUpdatedEvtMsg) {
    val ev = new TranscriptUpdatedRecordEvent()
    ev.setMeetingId(msg.header.meetingId)
    ev.setLocale(msg.body.locale)
    ev.setTranscript(msg.body.transcript)

    record(msg.header.meetingId, ev.toMap.asJava)
  }

  private def handleStartExternalVideoEvtMsg(msg: StartExternalVideoEvtMsg) {
    val ev = new StartExternalVideoRecordEvent()
    ev.setMeetingId(msg.header.meetingId)
    ev.setExternalVideoUrl(msg.body.externalVideoUrl)

    record(msg.header.meetingId, ev.toMap.asJava)
  }

  private def handleUpdateExternalVideoEvtMsg(msg: UpdateExternalVideoEvtMsg) {
    val ev = new UpdateExternalVideoRecordEvent()
    ev.setMeetingId(msg.header.meetingId)
    ev.setStatus(msg.body.status)
    ev.setRate(msg.body.rate)
    ev.setTime(msg.body.time)
    ev.setState(msg.body.state)

    record(msg.header.meetingId, ev.toMap.asJava)
  }

  private def handleStopExternalVideoEvtMsg(msg: StopExternalVideoEvtMsg) {
    val ev = new StopExternalVideoRecordEvent()
    ev.setMeetingId(msg.header.meetingId)

    record(msg.header.meetingId, ev.toMap.asJava)
  }

  private def handleRecordingStatusChangedEvtMsg(msg: RecordingStatusChangedEvtMsg) {
    val ev = new RecordStatusRecordEvent()
    ev.setMeetingId(msg.header.meetingId)
    ev.setUserId(msg.body.setBy)
    ev.setRecordingStatus(msg.body.recording)

    record(msg.header.meetingId, ev.toMap.asJava)
  }

  private def handleRecordStatusResetSysMsg(msg: RecordStatusResetSysMsg) {
    val ev = new RecordStatusResetEvent()
    ev.setMeetingId(msg.header.meetingId)
    ev.setUserId(msg.body.setBy)
    ev.setRecordingStatus(msg.body.recording)

    record(msg.header.meetingId, ev.toMap.asJava)
  }

  private def handleWebcamsOnlyForModeratorChangedEvtMsg(msg: WebcamsOnlyForModeratorChangedEvtMsg) {
    val ev = new WebcamsOnlyForModeratorRecordEvent()
    ev.setMeetingId(msg.header.meetingId)
    ev.setUserId(msg.body.setBy)
    ev.setWebcamsOnlyForModerator(msg.body.webcamsOnlyForModerator)

    record(msg.header.meetingId, ev.toMap.asJava)
  }

  private def handleEndAndKickAllSysMsg(msg: MeetingEndingEvtMsg): Unit = {
    val ev = new EndAndKickAllRecordEvent()
    ev.setMeetingId(msg.header.meetingId)
    ev.setReason(msg.body.reason)
    record(msg.header.meetingId, ev.toMap.asJava)
  }

  private def handleRecordingChapterBreakSysMsg(msg: RecordingChapterBreakSysMsg): Unit = {
    val ev = new RecordChapterBreakRecordEvent()
    ev.setMeetingId(msg.header.meetingId)
    ev.setChapterBreakTimestamp(msg.body.timestamp)

    record(msg.header.meetingId, ev.toMap.asJava)
  }

  private def handlePollStartedEvtMsg(msg: PollStartedEvtMsg): Unit = {
    val ev = new PollStartedRecordEvent()
    ev.setPollId(msg.body.pollId)
    ev.setQuestion(msg.body.question)
    ev.setAnswers(msg.body.poll.answers)
    ev.setType(msg.body.pollType)
    ev.setSecretPoll(msg.body.secretPoll)

    record(msg.header.meetingId, ev.toMap.asJava)
  }

  private def handleUserRespondedToPollRecordMsg(msg: UserRespondedToPollRecordMsg): Unit = {
    val ev = new UserRespondedToPollRecordEvent()
    ev.setPollId(msg.body.pollId)
    if (msg.body.isSecret) {
      ev.setUserId("")
    } else {
      ev.setUserId(msg.header.userId)
    }
    ev.setAnswerId(msg.body.answerId)
    ev.setAnswer(msg.body.answer)

    record(msg.header.meetingId, ev.toMap.asJava)
  }

  private def handlePollStoppedEvtMsg(msg: PollStoppedEvtMsg): Unit = {
    val ev = new PollStoppedRecordEvent()
    ev.setPollId(msg.body.pollId)

    record(msg.header.meetingId, ev.toMap.asJava)
  }

  private def handlePollShowResultEvtMsg(msg: PollShowResultEvtMsg): Unit = {
    val ev = new PollPublishedRecordEvent()
    ev.setPollId(msg.body.pollId)
    ev.setQuestion(msg.body.poll.questionText.getOrElse(""))
    ev.setAnswers(msg.body.poll.answers)
    ev.setNumRespondents(msg.body.poll.numRespondents)
    ev.setNumResponders(msg.body.poll.numResponders)

    record(msg.header.meetingId, ev.toMap.asJava)
  }

  private def checkRecordingDBStatus(): Unit = {
    if (redis.checkConnectionStatusBasic)
      healthzService.sendRecordingDBStatusMessage(System.currentTimeMillis())
    else
      log.error("recording database is not available.")
  }

  private def handleStarterConfigurations(msg: MeetingCreatedEvtMsg): Unit = {
    val ev = new MeetingConfigurationEvent()
    ev.setWebcamsOnlyForModerator(msg.body.props.usersProp.webcamsOnlyForModerator)
    record(msg.body.props.meetingProp.intId, ev.toMap().asJava)
  }

}
