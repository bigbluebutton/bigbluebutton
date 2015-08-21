package org.bigbluebutton.core

import org.bigbluebutton.core.api._
import scala.collection.JavaConversions._
import java.util.ArrayList
import scala.collection.mutable.ArrayBuffer
import org.bigbluebutton.core.apps.Page
import org.bigbluebutton.core.apps.Presentation
import org.bigbluebutton.core.recorders.VoiceEventRecorder
import akka.actor.ActorSystem
import org.bigbluebutton.core.apps.AnnotationVO
import akka.pattern.{ ask, pipe }
import akka.util.Timeout
import scala.concurrent.duration._
import scala.util.Success
import scala.util.Failure
import org.bigbluebutton.core.service.recorder.RecorderApplication
import org.bigbluebutton.common.messages.IBigBlueButtonMessage;
import org.bigbluebutton.common.messages.StartCustomPollRequestMessage

class BigBlueButtonInGW(val system: ActorSystem, recorderApp: RecorderApplication, messageSender: MessageSender,
    voiceEventRecorder: VoiceEventRecorder, val red5DeskShareIP: String, val red5DeskShareApp: String) extends IBigBlueButtonInGW {

  val log = system.log
  val bbbActor = system.actorOf(BigBlueButtonActor.props(system, recorderApp, messageSender, voiceEventRecorder), "bigbluebutton-actor")

  def handleBigBlueButtonMessage(message: IBigBlueButtonMessage) {
    message match {
      case msg: StartCustomPollRequestMessage => {
        bbbActor ! new StartCustomPollRequest(msg.payload.meetingId, msg.payload.requesterId, msg.payload.pollType, msg.payload.answers)
      }
    }
  }

  // Meeting
  def createMeeting2(meetingID: String, externalMeetingID: String, meetingName: String, record: Boolean,
    voiceBridge: String, duration: Long, autoStartRecording: Boolean,
    allowStartStopRecording: Boolean, moderatorPass: String, viewerPass: String,
    createTime: Long, createDate: String) {

    val mProps = new MeetingProperties(meetingID, externalMeetingID, meetingName, record,
      voiceBridge, duration, autoStartRecording, allowStartStopRecording,
      moderatorPass, viewerPass, createTime, createDate, red5DeskShareIP, red5DeskShareApp)
    bbbActor ! new CreateMeeting(meetingID, mProps)
  }

  def destroyMeeting(meetingID: String) {
    bbbActor ! new DestroyMeeting(meetingID)
  }

  def getAllMeetings(meetingID: String) {
    bbbActor ! new GetAllMeetingsRequest("meetingId")
  }

  def isAliveAudit(aliveId: String) {
    bbbActor ! new KeepAliveMessage(aliveId)
  }

  def lockSettings(meetingID: String, locked: java.lang.Boolean,
    lockSettings: java.util.Map[String, java.lang.Boolean]) {

  }

  def statusMeetingAudit(meetingID: String) {

  }

  def endMeeting(meetingID: String) {
    bbbActor ! new EndMeeting(meetingID)
  }

  def endAllMeetings() {

  }

  /**
   * ***********************************************************
   * Message Interface for Users
   * ***********************************************************
   */
  def validateAuthToken(meetingId: String, userId: String, token: String, correlationId: String, sessionId: String) {
    bbbActor ! new ValidateAuthToken(meetingId, userId, token, correlationId, sessionId)
  }

  def registerUser(meetingID: String, userID: String, name: String, role: String, extUserID: String, authToken: String): Unit = {
    val userRole = if (role == "MODERATOR") Role.MODERATOR else Role.VIEWER
    bbbActor ! new RegisterUser(meetingID, userID, name, userRole, extUserID, authToken)
  }

  def sendLockSettings(meetingID: String, userId: String, settings: java.util.Map[String, java.lang.Boolean]) {
    // Convert java.util.Map to scala.collection.immutable.Map
    // settings.mapValues -> convaert java Map to scala mutable Map
    // v => v.booleanValue() -> convert java Boolean to Scala Boolean
    // toMap -> converts from scala mutable map to scala immutable map
    val s = settings.mapValues(v => v.booleanValue() /* convert java Boolean to Scala Boolean */ ).toMap
    val disableCam = s.getOrElse("disableCam", false)
    val disableMic = s.getOrElse("disableMic", false)
    val disablePrivChat = s.getOrElse("disablePrivateChat", false)
    val disablePubChat = s.getOrElse("disablePublicChat", false)
    val lockedLayout = s.getOrElse("lockedLayout", false)
    var lockOnJoin = s.getOrElse("lockOnJoin", false)
    var lockOnJoinConfigurable = s.getOrElse("lockOnJoinConfigurable", false)

    val permissions = new Permissions(disableCam = disableCam,
      disableMic = disableMic,
      disablePrivChat = disablePrivChat,
      disablePubChat = disablePubChat,
      lockedLayout = lockedLayout,
      lockOnJoin = lockOnJoin,
      lockOnJoinConfigurable = lockOnJoinConfigurable)

    bbbActor ! new SetLockSettings(meetingID, userId, permissions)
  }

  def initLockSettings(meetingID: String, settings: java.util.Map[String, java.lang.Boolean]) {
    // Convert java.util.Map to scala.collection.immutable.Map
    // settings.mapValues -> convert java Map to scala mutable Map
    // v => v.booleanValue() -> convert java Boolean to Scala Boolean
    // toMap -> converts from scala mutable map to scala immutable map
    val s = settings.mapValues(v => v.booleanValue() /* convert java Boolean to Scala Boolean */ ).toMap
    val disableCam = s.getOrElse("disableCam", false)
    val disableMic = s.getOrElse("disableMic", false)
    val disablePrivChat = s.getOrElse("disablePrivateChat", false)
    val disablePubChat = s.getOrElse("disablePublicChat", false)
    val lockedLayout = s.getOrElse("lockedLayout", false)
    val lockOnJoin = s.getOrElse("lockOnJoin", false)
    val lockOnJoinConfigurable = s.getOrElse("lockOnJoinConfigurable", false)
    val permissions = new Permissions(disableCam = disableCam,
      disableMic = disableMic,
      disablePrivChat = disablePrivChat,
      disablePubChat = disablePubChat,
      lockedLayout = lockedLayout,
      lockOnJoin = lockOnJoin,
      lockOnJoinConfigurable = lockOnJoinConfigurable)

    bbbActor ! new InitLockSettings(meetingID, permissions)
  }

  def initAudioSettings(meetingID: String, requesterID: String, muted: java.lang.Boolean) {
    bbbActor ! new InitAudioSettings(meetingID, requesterID, muted.booleanValue())
  }

  def getLockSettings(meetingId: String, userId: String) {
    bbbActor ! new GetLockSettings(meetingId, userId)
  }

  def lockUser(meetingId: String, requesterID: String, lock: Boolean, userId: String) {
    bbbActor ! new LockUserRequest(meetingId, requesterID, userId, lock)
  }

  def setRecordingStatus(meetingId: String, userId: String, recording: java.lang.Boolean) {
    bbbActor ! new SetRecordingStatus(meetingId, userId, recording.booleanValue())
  }

  def getRecordingStatus(meetingId: String, userId: String) {
    bbbActor ! new GetRecordingStatus(meetingId, userId)
  }

  // Users
  def userRaiseHand(meetingId: String, userId: String) {
    bbbActor ! new UserRaiseHand(meetingId, userId)
  }

  def lowerHand(meetingId: String, userId: String, loweredBy: String) {
    bbbActor ! new UserLowerHand(meetingId, userId, loweredBy)
  }

  def ejectUserFromMeeting(meetingId: String, userId: String, ejectedBy: String) {
    bbbActor ! new EjectUserFromMeeting(meetingId, userId, ejectedBy)
  }

  def shareWebcam(meetingId: String, userId: String, stream: String) {
    bbbActor ! new UserShareWebcam(meetingId, userId, stream)
  }

  def unshareWebcam(meetingId: String, userId: String, stream: String) {
    bbbActor ! new UserUnshareWebcam(meetingId, userId, stream)
  }

  def setUserStatus(meetingID: String, userID: String, status: String, value: Object) {
    bbbActor ! new ChangeUserStatus(meetingID, userID, status, value)
  }

  def getUsers(meetingID: String, requesterID: String) {
    bbbActor ! new GetUsers(meetingID, requesterID)
  }

  def userLeft(meetingID: String, userID: String, sessionId: String): Unit = {
    bbbActor ! new UserLeaving(meetingID, userID, sessionId)
  }

  def userJoin(meetingID: String, userID: String, authToken: String): Unit = {
    bbbActor ! new UserJoining(meetingID, userID, authToken)
  }

  def assignPresenter(meetingID: String, newPresenterID: String, newPresenterName: String, assignedBy: String): Unit = {
    bbbActor ! new AssignPresenter(meetingID, newPresenterID, newPresenterName, assignedBy)
  }

  def getCurrentPresenter(meetingID: String, requesterID: String): Unit = {
    // do nothing
  }

  def userConnectedToGlobalAudio(voiceConf: String, userid: String, name: String) {
    // we are required to pass the meeting_id as first parameter (just to satisfy trait)
    // but it's not used anywhere. That's why we pass voiceConf twice instead
    bbbActor ! new UserConnectedToGlobalAudio(voiceConf, voiceConf, userid, name)
  }

  def userDisconnectedFromGlobalAudio(voiceConf: String, userid: String, name: String) {
    // we are required to pass the meeting_id as first parameter (just to satisfy trait)
    // but it's not used anywhere. That's why we pass voiceConf twice instead
    bbbActor ! new UserDisconnectedFromGlobalAudio(voiceConf, voiceConf, userid, name)
  }

  /**
   * ************************************************************************************
   * Message Interface for Presentation
   * ************************************************************************************
   */

  def clear(meetingID: String) {
    bbbActor ! new ClearPresentation(meetingID)
  }

  def sendConversionUpdate(messageKey: String, meetingId: String, code: String, presentationId: String, presName: String) {
    bbbActor ! new PresentationConversionUpdate(meetingId, messageKey, code, presentationId, presName)
  }

  def sendPageCountError(messageKey: String, meetingId: String, code: String, presentationId: String, numberOfPages: Int, maxNumberPages: Int, presName: String) {
    bbbActor ! new PresentationPageCountError(meetingId, messageKey, code, presentationId, numberOfPages, maxNumberPages, presName)
  }

  def sendSlideGenerated(messageKey: String, meetingId: String, code: String, presentationId: String, numberOfPages: Int, pagesCompleted: Int, presName: String) {
    bbbActor ! new PresentationSlideGenerated(meetingId, messageKey, code, presentationId, numberOfPages, pagesCompleted, presName)
  }

  def generatePresentationPages(presId: String, numPages: Int, presBaseUrl: String): scala.collection.immutable.HashMap[String, Page] = {
    var pages = new scala.collection.immutable.HashMap[String, Page]
    val baseUrl =
      for (i <- 1 to numPages) {
        val id = presId + "/" + i
        val num = i;
        val current = if (i == 1) true else false
        val thumbnail = presBaseUrl + "/thumbnail/" + i
        val swfUri = presBaseUrl + "/slide/" + i

        val txtUri = presBaseUrl + "/textfiles/" + i
        val svgUri = presBaseUrl + "/svg/" + i

        val p = new Page(id = id, num = num, thumbUri = thumbnail, swfUri = swfUri,
          txtUri = txtUri, svgUri = svgUri,
          current = current)
        pages += (p.id -> p)
      }

    pages
  }

  def sendConversionCompleted(messageKey: String, meetingId: String, code: String, presentationId: String, numPages: Int, presName: String, presBaseUrl: String) {

    val pages = generatePresentationPages(presentationId, numPages, presBaseUrl)
    val presentation = new Presentation(id = presentationId, name = presName, pages = pages)
    bbbActor ! new PresentationConversionCompleted(meetingId, messageKey, code, presentation)

  }

  def removePresentation(meetingID: String, presentationID: String) {
    bbbActor ! new RemovePresentation(meetingID, presentationID)
  }

  def getPresentationInfo(meetingID: String, requesterID: String, replyTo: String) {
    bbbActor ! new GetPresentationInfo(meetingID, requesterID, replyTo)
  }

  def sendCursorUpdate(meetingID: String, xPercent: Double, yPercent: Double) {
    bbbActor ! new SendCursorUpdate(meetingID, xPercent, yPercent)
  }

  def resizeAndMoveSlide(meetingID: String, xOffset: Double, yOffset: Double, widthRatio: Double, heightRatio: Double) {
    bbbActor ! new ResizeAndMoveSlide(meetingID, xOffset, yOffset, widthRatio, heightRatio)
  }

  def gotoSlide(meetingID: String, pageId: String) {
    //	  println("**** Forwarding GotoSlide for meeting[" + meetingID + "] ****")
    bbbActor ! new GotoSlide(meetingID, pageId)
  }

  def sharePresentation(meetingID: String, presentationID: String, share: Boolean) {
    bbbActor ! new SharePresentation(meetingID, presentationID, share)
  }

  def getSlideInfo(meetingID: String, requesterID: String, replyTo: String) {
    bbbActor ! new GetSlideInfo(meetingID, requesterID, replyTo)
  }

  /**
   * ***********************************************************************
   * Message Interface for Layout
   * *******************************************************************
   */

  def getCurrentLayout(meetingID: String, requesterID: String) {
    bbbActor ! new GetCurrentLayoutRequest(meetingID, requesterID)
  }

  def broadcastLayout(meetingID: String, requesterID: String, layout: String) {
    bbbActor ! new BroadcastLayoutRequest(meetingID, requesterID, layout)
  }

  def lockLayout(meetingId: String, setById: String, lock: Boolean, viewersOnly: Boolean, layout: String) {
    if (layout != null) {
      bbbActor ! new LockLayoutRequest(meetingId, setById, lock, viewersOnly, Some(layout))
    } else {
      bbbActor ! new LockLayoutRequest(meetingId, setById, lock, viewersOnly, None)
    }

  }

  /**
   * *******************************************************************
   * Message Interface for Chat
   * *****************************************************************
   */

  def getChatHistory(meetingID: String, requesterID: String, replyTo: String) {
    bbbActor ! new GetChatHistoryRequest(meetingID, requesterID, replyTo)
  }

  def sendPublicMessage(meetingID: String, requesterID: String, message: java.util.Map[String, String]) {
    // Convert java Map to Scala Map, then convert Mutable map to immutable map
    bbbActor ! new SendPublicMessageRequest(meetingID, requesterID, mapAsScalaMap(message).toMap)
  }

  def sendPrivateMessage(meetingID: String, requesterID: String, message: java.util.Map[String, String]) {
    bbbActor ! new SendPrivateMessageRequest(meetingID, requesterID, mapAsScalaMap(message).toMap)
  }

  /**
   * *******************************************************************
   * Message Interface for Whiteboard
   * *****************************************************************
   */
  private def buildAnnotation(annotation: scala.collection.mutable.Map[String, Object]): Option[AnnotationVO] = {
    var shape: Option[AnnotationVO] = None

    val id = annotation.getOrElse("id", null).asInstanceOf[String]
    val shapeType = annotation.getOrElse("type", null).asInstanceOf[String]
    val status = annotation.getOrElse("status", null).asInstanceOf[String]
    val wbId = annotation.getOrElse("whiteboardId", null).asInstanceOf[String]
    //    println("** GOT ANNOTATION status[" + status + "] shape=[" + shapeType + "]");

    if (id != null && shapeType != null && status != null && wbId != null) {
      shape = Some(new AnnotationVO(id, status, shapeType, annotation.toMap, wbId))
    }

    shape
  }

  def sendWhiteboardAnnotation(meetingID: String, requesterID: String, annotation: java.util.Map[String, Object]) {
    val ann: scala.collection.mutable.Map[String, Object] = mapAsScalaMap(annotation)

    buildAnnotation(ann) match {
      case Some(shape) => {
        bbbActor ! new SendWhiteboardAnnotationRequest(meetingID, requesterID, shape)
      }
      case None => // do nothing
    }
  }

  def requestWhiteboardAnnotationHistory(meetingID: String, requesterID: String, whiteboardId: String, replyTo: String) {
    bbbActor ! new GetWhiteboardShapesRequest(meetingID, requesterID, whiteboardId, replyTo)
  }

  def clearWhiteboard(meetingID: String, requesterID: String, whiteboardId: String) {
    bbbActor ! new ClearWhiteboardRequest(meetingID, requesterID, whiteboardId)
  }

  def undoWhiteboard(meetingID: String, requesterID: String, whiteboardId: String) {
    bbbActor ! new UndoWhiteboardRequest(meetingID, requesterID, whiteboardId)
  }

  def enableWhiteboard(meetingID: String, requesterID: String, enable: java.lang.Boolean) {
    bbbActor ! new EnableWhiteboardRequest(meetingID, requesterID, enable)
  }

  def isWhiteboardEnabled(meetingID: String, requesterID: String, replyTo: String) {
    bbbActor ! new IsWhiteboardEnabledRequest(meetingID, requesterID, replyTo)
  }

  /**
   * *******************************************************************
   * Message Interface for Voice
   * *****************************************************************
   */

  def muteAllExceptPresenter(meetingID: String, requesterID: String, mute: java.lang.Boolean) {
    bbbActor ! new MuteAllExceptPresenterRequest(meetingID, requesterID, mute)
  }

  def muteAllUsers(meetingID: String, requesterID: String, mute: java.lang.Boolean) {
    bbbActor ! new MuteMeetingRequest(meetingID, requesterID, mute)
  }

  def isMeetingMuted(meetingID: String, requesterID: String) {
    bbbActor ! new IsMeetingMutedRequest(meetingID, requesterID)
  }

  def muteUser(meetingID: String, requesterID: String, userID: String, mute: java.lang.Boolean) {
    bbbActor ! new MuteUserRequest(meetingID, requesterID, userID, mute)
  }

  def lockMuteUser(meetingID: String, requesterID: String, userID: String, lock: java.lang.Boolean) {
    bbbActor ! new LockUserRequest(meetingID, requesterID, userID, lock)
  }

  def ejectUserFromVoice(meetingId: String, userId: String, ejectedBy: String) {
    bbbActor ! new EjectUserFromVoiceRequest(meetingId, userId, ejectedBy)
  }

  def voiceUserJoined(voiceConfId: String, voiceUserId: String, userId: String, callerIdName: String,
    callerIdNum: String, muted: java.lang.Boolean, talking: java.lang.Boolean) {

    bbbActor ! new UserJoinedVoiceConfMessage(voiceConfId, voiceUserId, userId, callerIdName,
      callerIdNum, muted, talking)

  }

  def voiceUserLeft(voiceConfId: String, voiceUserId: String) {
    bbbActor ! new UserLeftVoiceConfMessage(voiceConfId, voiceUserId)
  }

  def voiceUserLocked(voiceConfId: String, voiceUserId: String, locked: java.lang.Boolean) {
    bbbActor ! new UserLockedInVoiceConfMessage(voiceConfId, voiceUserId, locked)
  }

  def voiceUserMuted(voiceConfId: String, voiceUserId: String, muted: java.lang.Boolean) {
    bbbActor ! new UserMutedInVoiceConfMessage(voiceConfId, voiceUserId, muted)
  }

  def voiceUserTalking(voiceConfId: String, voiceUserId: String, talking: java.lang.Boolean) {
    bbbActor ! new UserTalkingInVoiceConfMessage(voiceConfId, voiceUserId, talking)
  }

  def voiceRecording(voiceConfId: String, recordingFile: String, timestamp: String, recording: java.lang.Boolean) {
    bbbActor ! new VoiceConfRecordingStartedMessage(voiceConfId, recordingFile, recording, timestamp)
  }

  /**
   * *******************************************************************
   * Message Interface for DeskShare
   * *****************************************************************
   */
  def deskShareStarted(conferenceName: String, callerId: String, callerIdName: String) {
    bbbActor ! new DeskShareStartedRequest(conferenceName, callerId, callerIdName)
  }

  def deskShareStopped(conferenceName: String, callerId: String, callerIdName: String) {
    bbbActor ! new DeskShareStoppedRequest(conferenceName, callerId, callerIdName)
  }
  def deskShareRecordingStarted(conferenceName: String, filename: String, timestamp: String) {
    bbbActor ! new DeskShareRecordingStartedRequest(conferenceName, filename, timestamp)
  }

  def deskShareRecordingStopped(conferenceName: String, filename: String, timestamp: String) {
    bbbActor ! new DeskShareRecordingStoppedRequest(conferenceName, filename, timestamp)
  }

  def deskShareRTMPBroadcastStarted(conferenceName: String, streamname: String, videoWidth: Int, videoHeight: Int, timestamp: String) {
    bbbActor ! new DeskShareRTMPBroadcastStartedRequest(conferenceName, streamname, videoWidth, videoHeight, timestamp)
  }

  def deskShareRTMPBroadcastStopped(conferenceName: String, streamname: String, videoWidth: Int, videoHeight: Int, timestamp: String) {
    bbbActor ! new DeskShareRTMPBroadcastStoppedRequest(conferenceName, streamname, videoWidth, videoHeight, timestamp)
  }

  // Polling
  def votePoll(meetingId: String, userId: String, pollId: String, questionId: Integer, answerId: Integer) {
    bbbActor ! new RespondToPollRequest(meetingId, userId, pollId, questionId, answerId)
  }

  def startPoll(meetingId: String, requesterId: String, pollId: String, pollType: String) {
    bbbActor ! new StartPollRequest(meetingId, requesterId, pollType)
  }

  def stopPoll(meetingId: String, userId: String, pollId: String) {
    bbbActor ! new StopPollRequest(meetingId, userId)
  }

  def showPollResult(meetingId: String, requesterId: String, pollId: String, show: java.lang.Boolean) {
    if (show) {
      bbbActor ! new ShowPollResultRequest(meetingId, requesterId, pollId)
    } else {
      bbbActor ! new HidePollResultRequest(meetingId, requesterId, pollId)
    }
  }
}
