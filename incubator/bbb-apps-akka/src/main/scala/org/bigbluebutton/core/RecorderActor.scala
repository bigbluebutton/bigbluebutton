package org.bigbluebutton.core

import akka.actor.Actor
import akka.actor.ActorLogging
import akka.actor.Props
import org.bigbluebutton.core.api._
import scala.collection.JavaConversions._
import org.bigbluebutton.core.service.recorder.RecorderApplication
import org.bigbluebutton.core.recorders.events.PublicChatRecordEvent
import org.bigbluebutton.core.recorders.events.ConversionCompletedPresentationRecordEvent
import org.bigbluebutton.core.recorders.events.GotoSlidePresentationRecordEvent
import org.bigbluebutton.core.recorders.events.ResizeAndMoveSlidePresentationRecordEvent
import org.bigbluebutton.core.recorders.events.RemovePresentationPresentationRecordEvent
import org.bigbluebutton.core.recorders.events.SharePresentationPresentationRecordEvent
import org.bigbluebutton.core.recorders.events.CursorUpdateRecordEvent
import org.bigbluebutton.core.recorders.events.AssignPresenterRecordEvent
import org.bigbluebutton.core.recorders.events.ParticipantStatusChangeRecordEvent
import org.bigbluebutton.core.recorders.events.ParticipantLeftRecordEvent
import org.bigbluebutton.core.recorders.events.RecordStatusRecordEvent
import org.bigbluebutton.core.recorders.events.ParticipantLeftVoiceRecordEvent
import org.bigbluebutton.core.recorders.events.ParticipantJoinedVoiceRecordEvent
import org.bigbluebutton.core.recorders.events.ParticipantTalkingVoiceRecordEvent
import org.bigbluebutton.core.recorders.events.ParticipantMutedVoiceRecordEvent
import org.bigbluebutton.core.recorders.events.StartRecordingVoiceRecordEvent
import org.bigbluebutton.core.recorders.events.ParticipantJoinRecordEvent
import org.bigbluebutton.core.recorders.events.ParticipantEndAndKickAllRecordEvent
import org.bigbluebutton.core.recorders.events.UndoShapeWhiteboardRecordEvent
import org.bigbluebutton.core.recorders.events.ClearPageWhiteboardRecordEvent
import org.bigbluebutton.core.recorders.events.AddShapeWhiteboardRecordEvent
import org.bigbluebutton.core.recorders.events.DeskShareStartRTMPRecordEvent
import org.bigbluebutton.core.recorders.events.DeskShareStopRTMPRecordEvent
import org.bigbluebutton.core.recorders.events.DeskShareNotifyViewersRTMPRecordEvent
// import org.bigbluebutton.core.service.whiteboard.WhiteboardKeyUtil
import org.bigbluebutton.common.messages.WhiteboardKeyUtil
import org.bigbluebutton.core.recorders.events.ModifyTextWhiteboardRecordEvent
import org.bigbluebutton.core.recorders.events.EditCaptionHistoryRecordEvent
import scala.collection.immutable.StringOps

object RecorderActor {
  def props(recorder: RecorderApplication): Props =
    Props(classOf[RecorderActor], recorder)
}

class RecorderActor(val recorder: RecorderApplication)
    extends Actor with ActorLogging {

  def receive = {
    case msg: SendPublicMessageEvent => handleSendPublicMessageEvent(msg)
    case msg: ClearPresentationOutMsg => handleClearPresentationOutMsg(msg)
    case msg: RemovePresentationOutMsg => handleRemovePresentationOutMsg(msg)
    case msg: SendCursorUpdateOutMsg => handleSendCursorUpdateOutMsg(msg)
    case msg: ResizeAndMoveSlideOutMsg => handleResizeAndMoveSlideOutMsg(msg)
    case msg: GotoSlideOutMsg => handleGotoSlideOutMsg(msg)
    case msg: SharePresentationOutMsg => handleSharePresentationOutMsg(msg)
    case msg: EndAndKickAll => handleEndAndKickAll(msg)
    case msg: PresenterAssigned => handleAssignPresenter(msg)
    case msg: UserJoined => handleUserJoined(msg)
    case msg: UserLeft => handleUserLeft(msg)
    case msg: UserStatusChange => handleUserStatusChange(msg)
    case msg: UserVoiceMuted => handleUserVoiceMuted(msg)
    case msg: UserVoiceTalking => handleUserVoiceTalking(msg)
    case msg: UserJoinedVoice => handleUserJoinedVoice(msg)
    case msg: UserLeftVoice => handleUserLeftVoice(msg)
    case msg: RecordingStatusChanged => handleRecordingStatusChanged(msg)
    case msg: UserChangedEmojiStatus => handleChangedUserEmojiStatus(msg)
    case msg: UserSharedWebcam => handleUserSharedWebcam(msg)
    case msg: UserUnsharedWebcam => handleUserUnsharedWebcam(msg)
    case msg: VoiceRecordingStarted => handleVoiceRecordingStarted(msg)
    case msg: VoiceRecordingStopped => handleVoiceRecordingStopped(msg)
    case msg: SendWhiteboardAnnotationEvent => handleSendWhiteboardAnnotationEvent(msg)
    case msg: ClearWhiteboardEvent => handleClearWhiteboardEvent(msg)
    case msg: UndoWhiteboardEvent => handleUndoWhiteboardEvent(msg)
    case msg: EditCaptionHistoryReply => handleEditCaptionHistoryReply(msg)
    case msg: DeskShareStartRTMPBroadcast => handleDeskShareStartRTMPBroadcast(msg)
    case msg: DeskShareStopRTMPBroadcast => handleDeskShareStopRTMPBroadcast(msg)
    case msg: DeskShareNotifyViewersRTMP => handleDeskShareNotifyViewersRTMP(msg)
    case _ => // do nothing
  }

  private def handleSendPublicMessageEvent(msg: SendPublicMessageEvent) {
    if (msg.recorded.value) {
      val message = mapAsJavaMap(msg.message)
      val ev = new PublicChatRecordEvent()
      ev.setTimestamp(TimestampGenerator.generateTimestamp)
      ev.setMeetingId(msg.meetingId.value)
      ev.setSender(message.get("fromUsername"))
      ev.setMessage(message.get("message"))
      ev.setColor(message.get("fromColor"))
      recorder.record(msg.meetingId.value, ev)
    }
  }

  private def handleClearPresentationOutMsg(msg: ClearPresentationOutMsg) {
    println("                  handleClearPresentationOutMsg ")
  }

  private def handlePresentationConversionDone(msg: PresentationConversionDone) {
    if (msg.recorded.value) {
      val event = new ConversionCompletedPresentationRecordEvent()
      event.setMeetingId(msg.meetingId.value)
      event.setTimestamp(TimestampGenerator.generateTimestamp)
      event.setPresentationName(msg.presentation.id)
      event.setOriginalFilename(msg.presentation.name)
      recorder.record(msg.meetingId.value, event)
    }

  }

  private def handleGotoSlideOutMsg(msg: GotoSlideOutMsg) {
    if (msg.recorded.value) {
      val event = new GotoSlidePresentationRecordEvent()
      event.setMeetingId(msg.meetingId.value)
      event.setTimestamp(TimestampGenerator.generateTimestamp)
      event.setSlide(msg.page.num)
      event.setId(msg.page.id)
      event.setNum(msg.page.num)
      event.setThumbUri(msg.page.thumbUri)
      event.setSwfUri(msg.page.swfUri)
      event.setTxtUri(msg.page.txtUri)
      event.setSvgUri(msg.page.svgUri)
      event.setXOffset(msg.page.xOffset)
      event.setYOffset(msg.page.yOffset)
      event.setWidthRatio(msg.page.widthRatio)
      event.setHeightRatio(msg.page.heightRatio)
      recorder.record(msg.meetingId.value, event)
    }
  }

  private def handleResizeAndMoveSlideOutMsg(msg: ResizeAndMoveSlideOutMsg) {
    if (msg.recorded.value) {
      val event = new ResizeAndMoveSlidePresentationRecordEvent()
      event.setMeetingId(msg.meetingId.value)
      event.setTimestamp(TimestampGenerator.generateTimestamp)
      event.setId(msg.page.id)
      event.setNum(msg.page.num)
      event.setThumbUri(msg.page.thumbUri)
      event.setSwfUri(msg.page.swfUri)
      event.setTxtUri(msg.page.txtUri)
      event.setSvgUri(msg.page.svgUri)
      event.setXOffset(msg.page.xOffset)
      event.setYOffset(msg.page.yOffset)
      event.setWidthRatio(msg.page.widthRatio)
      event.setHeightRatio(msg.page.heightRatio)

      recorder.record(msg.meetingId.value, event)
    }
  }

  private def handleRemovePresentationOutMsg(msg: RemovePresentationOutMsg) {
    if (msg.recorded.value) {
      val event = new RemovePresentationPresentationRecordEvent()
      event.setMeetingId(msg.meetingId.value)
      event.setTimestamp(TimestampGenerator.generateTimestamp())
      event.setPresentationName(msg.presentationId.value)
      recorder.record(msg.meetingId.value, event)
    }
  }

  private def handleSharePresentationOutMsg(msg: SharePresentationOutMsg) {
    if (msg.recorded.value) {
      val event = new SharePresentationPresentationRecordEvent()
      event.setMeetingId(msg.meetingId.value)
      event.setTimestamp(TimestampGenerator.generateTimestamp)
      event.setPresentationName(msg.presentation.id)
      event.setOriginalFilename(msg.presentation.name)
      event.setShare(true)
      recorder.record(msg.meetingId.value, event)
    }
  }

  private def handleSendCursorUpdateOutMsg(msg: SendCursorUpdateOutMsg) {
    if (msg.recorded.value) {
      val event = new CursorUpdateRecordEvent()
      event.setMeetingId(msg.meetingId.value)
      event.setTimestamp(TimestampGenerator.generateTimestamp)
      event.setXPercent(msg.xPercent)
      event.setYPercent(msg.yPercent)

      recorder.record(msg.meetingId.value, event)
    }
  }

  private def handleEndAndKickAll(msg: EndAndKickAll): Unit = {
    if (msg.recorded.value) {
      val ev = new ParticipantEndAndKickAllRecordEvent()
      ev.setTimestamp(TimestampGenerator.generateTimestamp)
      ev.setMeetingId(msg.meetingId.value)
      recorder.record(msg.meetingId.value, ev)
    }
  }

  private def handleUserJoined(msg: UserJoined): Unit = {
    if (msg.recorded.value) {
      val ev = new ParticipantJoinRecordEvent()
      ev.setTimestamp(TimestampGenerator.generateTimestamp)
      ev.setUserId(msg.user.id.value)
      ev.setName(msg.user.name.value)
      ev.setMeetingId(msg.meetingId.value)
      ev.setRole(msg.user.roles.toArray.toString)

      recorder.record(msg.meetingId.value, ev)
    }
  }

  def handleVoiceRecordingStarted(msg: VoiceRecordingStarted) {
    if (msg.recorded.value) {
      val evt = new StartRecordingVoiceRecordEvent(true)
      evt.setMeetingId(msg.meetingId.value)
      evt.setTimestamp(TimestampGenerator.generateTimestamp)
      evt.setBridge(msg.confNum)
      evt.setRecordingTimestamp(msg.timestamp)
      evt.setFilename(msg.recordingFile)
      recorder.record(msg.meetingId.value, evt)
    }
  }

  def handleVoiceRecordingStopped(msg: VoiceRecordingStopped) {
    if (msg.recorded.value) {
      val evt = new StartRecordingVoiceRecordEvent(false)
      evt.setMeetingId(msg.meetingId.value)
      evt.setTimestamp(TimestampGenerator.generateTimestamp)
      evt.setBridge(msg.confNum)
      evt.setRecordingTimestamp(msg.timestamp)
      evt.setFilename(msg.recordingFile)
      recorder.record(msg.meetingId.value, evt)
    }
  }

  def handleUserVoiceMuted(msg: UserVoiceMuted) {
    if (msg.recorded.value) {
      val ev = new ParticipantMutedVoiceRecordEvent()
      ev.setMeetingId(msg.meetingId.value)
      ev.setTimestamp(TimestampGenerator.generateTimestamp)
      ev.setBridge(msg.confNum.value)
      ev.setParticipant(msg.user.voiceUser.id.value)
      ev.setMuted(msg.user.voiceUser.muted.value)

      recorder.record(msg.meetingId.value, ev)
    }
  }

  def handleUserVoiceTalking(msg: UserVoiceTalking) {
    if (msg.recorded.value) {
      val evt = new ParticipantTalkingVoiceRecordEvent()
      evt.setMeetingId(msg.meetingId.value)
      evt.setTimestamp(TimestampGenerator.generateTimestamp)
      evt.setBridge(msg.confNum.value)
      evt.setParticipant(msg.user.id.value)
      evt.setTalking(msg.user.voiceUser.talking.value)

      recorder.record(msg.meetingId.value, evt)
    }
  }

  def handleUserJoinedVoice(msg: UserJoinedVoice) {
    if (msg.recorded.value) {
      val evt = new ParticipantJoinedVoiceRecordEvent()
      evt.setMeetingId(msg.meetingId.value)
      evt.setTimestamp(TimestampGenerator.generateTimestamp)
      evt.setBridge(msg.confNum.value)
      evt.setParticipant(msg.user.voiceUser.id.value)
      evt.setCallerName(msg.user.voiceUser.callerId.name.value)
      evt.setCallerNumber(msg.user.voiceUser.callerId.number.value)
      evt.setMuted(msg.user.voiceUser.muted.value)
      evt.setTalking(msg.user.voiceUser.talking.value)

      recorder.record(msg.meetingId.value, evt)
    }
  }

  def handleUserLeftVoice(msg: UserLeftVoice) {
    if (msg.recorded.value) {
      val evt = new ParticipantLeftVoiceRecordEvent()
      evt.setMeetingId(msg.meetingId.value)
      evt.setTimestamp(TimestampGenerator.generateTimestamp)
      evt.setBridge(msg.confNum.value)
      evt.setParticipant(msg.user.voiceUser.id.value)
      recorder.record(msg.meetingId.value, evt)
    }
  }

  def handleRecordingStatusChanged(msg: RecordingStatusChanged) {
    if (msg.recorded.value) {
      val evt = new RecordStatusRecordEvent()
      evt.setMeetingId(msg.meetingId.value)
      evt.setTimestamp(TimestampGenerator.generateTimestamp)
      evt.setUserId(msg.userId.value)
      evt.setRecordingStatus(msg.recording.toString)

      recorder.record(msg.meetingId.value, evt)
    }
  }

  private def handleUserLeft(msg: UserLeft): Unit = {
    if (msg.recorded.value) {
      val ev = new ParticipantLeftRecordEvent()
      ev.setTimestamp(TimestampGenerator.generateTimestamp)
      ev.setUserId(msg.user.id.value)
      ev.setMeetingId(msg.meetingId.value)

      recorder.record(msg.meetingId.value, ev)
    }

  }

  private def handleChangedUserEmojiStatus(msg: UserChangedEmojiStatus) {
    if (msg.recorded.value) {
      val status = UserStatusChange(msg.meetingId, msg.recorded,
        msg.userId, "emojiStatus", msg.emojiStatus.value)
      handleUserStatusChange(status)
    }

  }

  private def handleUserSharedWebcam(msg: UserSharedWebcam) {
    if (msg.recorded.value) {
      val status = UserStatusChange(msg.meetingId, msg.recorded,
        msg.userId, "hasStream", "true,stream=" + msg.stream)
      handleUserStatusChange(status)
    }

  }

  private def handleUserUnsharedWebcam(msg: UserUnsharedWebcam) {
    if (msg.recorded.value) {
      val status = UserStatusChange(msg.meetingId, msg.recorded,
        msg.userId, "hasStream", "false,stream=" + msg.stream)
      handleUserStatusChange(status)
    }

  }

  private def handleUserStatusChange(msg: UserStatusChange): Unit = {
    if (msg.recorded.value) {
      val ev = new ParticipantStatusChangeRecordEvent()
      ev.setTimestamp(TimestampGenerator.generateTimestamp)
      ev.setUserId(msg.userId.value)
      ev.setMeetingId(msg.meetingId.value)
      ev.setStatus(msg.status)
      ev.setValue(msg.value.toString())

      recorder.record(msg.meetingId.value, ev)
    }
  }

  private def handleAssignPresenter(msg: PresenterAssigned): Unit = {
    if (msg.recorded.value) {
      val event = new AssignPresenterRecordEvent()
      event.setMeetingId(msg.meetingId.value)
      event.setTimestamp(TimestampGenerator.generateTimestamp)
      event.setUserId(msg.presenter.id.value)
      event.setName(msg.presenter.name.value)
      event.setAssignedBy(msg.presenter.assignedBy.value)

      recorder.record(msg.meetingId.value, event)
    }

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

  private def getPageNum(whiteboardId: String): String = {
    val strId = new StringOps(whiteboardId)
    val ids = strId.split('/')
    var pageNum = "0"
    if (ids.length == 2) {
      pageNum = ids(1)
    }
    pageNum
  }

  private def handleSendWhiteboardAnnotationEvent(msg: SendWhiteboardAnnotationEvent) {
    if (msg.recorded.value) {
      if ((msg.shape.shapeType == WhiteboardKeyUtil.TEXT_TYPE) && (msg.shape.status != WhiteboardKeyUtil.TEXT_CREATED_STATUS)) {

        val event = new ModifyTextWhiteboardRecordEvent()
        event.setMeetingId(msg.meetingId.value)
        event.setTimestamp(TimestampGenerator.generateTimestamp)
        event.setPresentation(getPresentationId(msg.whiteboardId))
        event.setPageNumber(getPageNum(msg.whiteboardId))
        event.setWhiteboardId(msg.whiteboardId)
        event.addAnnotation(mapAsJavaMap(msg.shape.shape))
        recorder.record(msg.meetingId.value, event)
      } else if ((msg.shape.shapeType == WhiteboardKeyUtil.POLL_RESULT_TYPE)) {
        val event = new AddShapeWhiteboardRecordEvent()
        event.setMeetingId(msg.meetingId.value)
        event.setTimestamp(TimestampGenerator.generateTimestamp)
        event.setPresentation(getPresentationId(msg.whiteboardId))
        event.setPageNumber(getPageNum(msg.whiteboardId))
        event.setWhiteboardId(msg.whiteboardId);
        event.addAnnotation(mapAsJavaMap(msg.shape.shape))
        recorder.record(msg.meetingId.value, event)
      } else {
        val event = new AddShapeWhiteboardRecordEvent()
        event.setMeetingId(msg.meetingId.value)
        event.setTimestamp(TimestampGenerator.generateTimestamp)
        event.setPresentation(getPresentationId(msg.whiteboardId))
        event.setPageNumber(getPageNum(msg.whiteboardId))
        event.setWhiteboardId(msg.whiteboardId);
        event.addAnnotation(mapAsJavaMap(msg.shape.shape))
        recorder.record(msg.meetingId.value, event)
      }
    }

  }

  private def handleClearWhiteboardEvent(msg: ClearWhiteboardEvent) {
    if (msg.recorded.value) {
      val event = new ClearPageWhiteboardRecordEvent()
      event.setMeetingId(msg.meetingId.value)
      event.setTimestamp(TimestampGenerator.generateTimestamp)
      event.setPresentation(getPresentationId(msg.whiteboardId))
      event.setPageNumber(getPageNum(msg.whiteboardId))
      event.setWhiteboardId(msg.whiteboardId)
      recorder.record(msg.meetingId.value, event)
    }

  }

  private def handleUndoWhiteboardEvent(msg: UndoWhiteboardEvent) {
    if (msg.recorded.value) {
      val event = new UndoShapeWhiteboardRecordEvent()
      event.setMeetingId(msg.meetingId.value)
      event.setTimestamp(TimestampGenerator.generateTimestamp)
      event.setPresentation(getPresentationId(msg.whiteboardId))
      event.setPageNumber(getPageNum(msg.whiteboardId))
      event.setWhiteboardId(msg.whiteboardId)
      event.setShapeId(msg.shapeId);
      recorder.record(msg.meetingId.value, event)
    }

  }

  private def handleEditCaptionHistoryReply(msg: EditCaptionHistoryReply) {
    if (msg.recorded.value) {
      val ev = new EditCaptionHistoryRecordEvent()
      ev.setTimestamp(TimestampGenerator.generateTimestamp)
      ev.setMeetingId(msg.meetingId.value)
      ev.setStartIndex(msg.startIndex.toString())
      ev.setEndIndex(msg.endIndex.toString())
      ev.setLocale(msg.locale)
      ev.setText(msg.text)
      recorder.record(msg.meetingId.value, ev)
    }
  }

  private def handleDeskShareStartRTMPBroadcast(msg: DeskShareStartRTMPBroadcast) {
    val event = new DeskShareStartRTMPRecordEvent()
    event.setMeetingId(msg.conferenceName)
    event.setStreamPath(msg.streamPath)
    event.setTimestamp(TimestampGenerator.generateTimestamp)
    log.info("handleDeskShareStartRTMPBroadcast " + msg.conferenceName)
    recorder.record(msg.conferenceName, event)
  }

  private def handleDeskShareStopRTMPBroadcast(msg: DeskShareStopRTMPBroadcast) {
    val event = new DeskShareStopRTMPRecordEvent()
    event.setMeetingId(msg.conferenceName)
    event.setStreamPath(msg.streamPath)
    event.setTimestamp(TimestampGenerator.generateTimestamp)
    log.info("handleDeskShareStopRTMPBroadcast " + msg.conferenceName)
    recorder.record(msg.conferenceName, event)
  }

  private def handleDeskShareNotifyViewersRTMP(msg: DeskShareNotifyViewersRTMP) {
    val event = new DeskShareNotifyViewersRTMPRecordEvent()
    event.setMeetingId(msg.meetingID)
    event.setStreamPath(msg.streamPath)
    event.setBroadcasting(msg.broadcasting)
    event.setTimestamp(TimestampGenerator.generateTimestamp)

    log.info("handleDeskShareNotifyViewersRTMP " + msg.meetingID)
    recorder.record(msg.meetingID, event)
  }
}
