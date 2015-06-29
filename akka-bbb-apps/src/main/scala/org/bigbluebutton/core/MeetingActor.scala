package org.bigbluebutton.core

import akka.actor.Actor
import akka.actor.ActorRef
import akka.actor.ActorLogging
import akka.actor.Props
import org.bigbluebutton.core.apps.UsersApp
import org.bigbluebutton.core.api._
import org.bigbluebutton.core.apps.PresentationApp
import org.bigbluebutton.core.apps.LayoutApp
import org.bigbluebutton.core.apps.ChatApp
import org.bigbluebutton.core.apps.WhiteboardApp
import java.util.concurrent.TimeUnit
import org.bigbluebutton.core.util._
import scala.concurrent.duration._
import org.bigbluebutton.core.apps.PollApp
import org.bigbluebutton.core.apps.ChatModel
import org.bigbluebutton.core.apps.LayoutModel

case object StopMeetingActor
case class MeetingProperties(meetingID: String, externalMeetingID: String, meetingName: String, recorded: Boolean,
  voiceBridge: String, duration: Long, autoStartRecording: Boolean, allowStartStopRecording: Boolean,
  moderatorPass: String, viewerPass: String, createTime: Long, createDate: String,
  red5DeskShareIP: String, red5DeskShareApp: String)

object MeetingActor {
  def props(mProps: MeetingProperties, outGW: MessageOutGateway): Props =
    Props(classOf[MeetingActor], mProps: MeetingProperties, outGW)
}

class MeetingActor(val mProps: MeetingProperties, val outGW: MessageOutGateway)
    extends Actor with UsersApp with PresentationApp
    with LayoutApp with ChatApp with MeetingMessageHandler
    with ActorLogging {

  val chatModel = new ChatModel()
  val layoutModel = new LayoutModel()
  val meetingModel = new MeetingModel()

  import context.dispatcher
  context.system.scheduler.schedule(2 seconds, 5 seconds, self, "MonitorNumberOfWebUsers")

  outGW.send(new GetUsersInVoiceConference(mProps.meetingID, mProps.recorded, mProps.voiceBridge))

  def receive = {
    case "StartTimer" =>
      handleStartTimer
    case "Hello" =>
      handleHello
    case "MonitorNumberOfWebUsers" =>
      handleMonitorNumberOfWebUsers()
    case msg: ValidateAuthToken =>
      handleValidateAuthToken(msg)
    case msg: RegisterUser =>
      handleRegisterUser(msg)
    case msg: UserJoinedVoiceConfMessage =>
      handleUserJoinedVoiceConfMessage(msg)
    case msg: UserLeftVoiceConfMessage =>
      handleUserLeftVoiceConfMessage(msg)
    case msg: UserMutedInVoiceConfMessage =>
      handleUserMutedInVoiceConfMessage(msg)
    case msg: UserTalkingInVoiceConfMessage =>
      handleUserTalkingInVoiceConfMessage(msg)
    case msg: VoiceConfRecordingStartedMessage =>
      handleVoiceConfRecordingStartedMessage(msg)
    //    case msg: DeskShareRecordingStartedRequest =>
    //      handleDeskShareRecordingStartedRequest(msg)
    //    case msg: DeskShareRecordingStoppedRequest =>
    //      handleDeskShareRecordingStoppedRequest(msg)
    case msg: DeskShareStartedRequest =>
      handleDeskShareStartedRequest(msg)
    case msg: DeskShareStoppedRequest =>
      handleDeskShareStoppedRequest(msg)
    case msg: UserJoining =>
      handleUserJoin(msg)
    case msg: UserLeaving =>
      handleUserLeft(msg)
    case msg: AssignPresenter =>
      handleAssignPresenter(msg)
    case msg: GetUsers =>
      handleGetUsers(msg)
    case msg: ChangeUserStatus =>
      handleChangeUserStatus(msg)
    case msg: EjectUserFromMeeting =>
      handleEjectUserFromMeeting(msg)
    case msg: UserRaiseHand =>
      handleUserRaiseHand(msg)
    case msg: UserLowerHand =>
      handleUserLowerHand(msg)
    case msg: UserShareWebcam =>
      handleUserShareWebcam(msg)
    case msg: UserUnshareWebcam =>
      handleUserunshareWebcam(msg)
    case msg: MuteMeetingRequest =>
      handleMuteMeetingRequest(msg)
    case msg: MuteAllExceptPresenterRequest =>
      handleMuteAllExceptPresenterRequest(msg)
    case msg: IsMeetingMutedRequest =>
      handleIsMeetingMutedRequest(msg)
    case msg: MuteUserRequest =>
      handleMuteUserRequest(msg)
    case msg: EjectUserFromVoiceRequest =>
      handleEjectUserRequest(msg)
    case msg: SetLockSettings =>
      handleSetLockSettings(msg)
    case msg: GetLockSettings =>
      handleGetLockSettings(msg)
    case msg: LockUserRequest =>
      handleLockUserRequest(msg)
    case msg: InitLockSettings =>
      handleInitLockSettings(msg)
    case msg: InitAudioSettings =>
      handleInitAudioSettings(msg)
    case msg: GetChatHistoryRequest =>
      handleGetChatHistoryRequest(msg)
    case msg: SendPublicMessageRequest =>
      handleSendPublicMessageRequest(msg)
    case msg: SendPrivateMessageRequest =>
      handleSendPrivateMessageRequest(msg)
    case msg: UserConnectedToGlobalAudio =>
      handleUserConnectedToGlobalAudio(msg)
    case msg: UserDisconnectedFromGlobalAudio =>
      handleUserDisconnectedFromGlobalAudio(msg)
    case msg: GetCurrentLayoutRequest =>
      handleGetCurrentLayoutRequest(msg)
    case msg: BroadcastLayoutRequest =>
      handleBroadcastLayoutRequest(msg)
    case msg: InitializeMeeting =>
      handleInitializeMeeting(msg)
    case msg: ClearPresentation =>
      handleClearPresentation(msg)
    case msg: PresentationConversionUpdate =>
      handlePresentationConversionUpdate(msg)
    case msg: PresentationPageCountError =>
      handlePresentationPageCountError(msg)
    case msg: PresentationSlideGenerated =>
      handlePresentationSlideGenerated(msg)
    case msg: PresentationConversionCompleted =>
      handlePresentationConversionCompleted(msg)
    case msg: RemovePresentation =>
      handleRemovePresentation(msg)
    case msg: GetPresentationInfo =>
      handleGetPresentationInfo(msg)
    case msg: SendCursorUpdate =>
      handleSendCursorUpdate(msg)
    case msg: ResizeAndMoveSlide =>
      handleResizeAndMoveSlide(msg)
    case msg: GotoSlide =>
      handleGotoSlide(msg)
    case msg: SharePresentation =>
      handleSharePresentation(msg)
    case msg: GetSlideInfo =>
      handleGetSlideInfo(msg)
    case msg: PreuploadedPresentations =>
      handlePreuploadedPresentations(msg)
    case msg: SendWhiteboardAnnotationRequest =>
      handleSendWhiteboardAnnotationRequest(msg)
    case msg: GetWhiteboardShapesRequest =>
      handleGetWhiteboardShapesRequest(msg)
    case msg: ClearWhiteboardRequest =>
      handleClearWhiteboardRequest(msg)
    case msg: UndoWhiteboardRequest =>
      handleUndoWhiteboardRequest(msg)
    case msg: EnableWhiteboardRequest =>
      handleEnableWhiteboardRequest(msg)
    case msg: IsWhiteboardEnabledRequest =>
      handleIsWhiteboardEnabledRequest(msg)
    case msg: SetRecordingStatus =>
      handleSetRecordingStatus(msg)
    case msg: GetRecordingStatus =>
      handleGetRecordingStatus(msg)
    case msg: CreatePollRequest =>
      handleCreatePollRequest(msg)
    case msg: StartPollRequest =>
      handleStartPollRequest(msg)
    case msg: StopPollRequest =>
      handleStopPollRequest(msg)
    case msg: ShowPollResultRequest =>
      handleShowPollResultRequest(msg)
    case msg: HidePollResultRequest =>
      handleHidePollResultRequest(msg)
    case msg: VotePollRequest =>
      handleVotePollRequest(msg)
    case msg: GetPollRequest =>
      handleGetPollRequest(msg)

    case msg: EndMeeting => handleEndMeeting(msg)
    case StopMeetingActor => //exit
    case _ => // do nothing
  }

  def hasMeetingEnded(): Boolean = {
    meetingModel.hasMeetingEnded()
  }

  private def handleStartTimer() {
    //    println("***************timer started******************")
    //    val timerActor = new TimerActor(2000, self, "Hello")
    //    timerActor.start
  }

  private def handleHello() {
    //    println("***************hello received on [" + System.currentTimeMillis() + "]******************")

    //    val timerActor = new TimerActor(2000, self, "Hello")    
    //    timerActor.start
  }

  def webUserJoined() {
    if (users.numWebUsers > 0) {
      meetingModel.resetLastWebUserLeftOn()
    }
  }

  def startRecordingIfAutoStart() {
    if (mProps.recorded && !meetingModel.isRecording() && mProps.autoStartRecording && users.numWebUsers == 1) {
      log.info("Auto start recording for meeting=[" + mProps.meetingID + "]")
      meetingModel.recordingStarted()
      outGW.send(new RecordingStatusChanged(mProps.meetingID, mProps.recorded, "system", meetingModel.isRecording()))
    }
  }

  def stopAutoStartedRecording() {
    if (mProps.recorded && meetingModel.isRecording() && mProps.autoStartRecording && users.numWebUsers == 0) {
      log.info("Last web user left. Auto stopping recording for meeting=[{}", mProps.meetingID)
      meetingModel.recordingStopped()
      outGW.send(new RecordingStatusChanged(mProps.meetingID, mProps.recorded, "system", meetingModel.isRecording()))
    }
  }

  def startCheckingIfWeNeedToEndVoiceConf() {
    if (users.numWebUsers == 0) {
      meetingModel.lastWebUserLeft()
      log.debug("MonitorNumberOfWebUsers started for meeting [" + mProps.meetingID + "]")
    }
  }

  def handleMonitorNumberOfWebUsers() {
    // println("BACK TIMER")
    if (users.numWebUsers == 0 && meetingModel.lastWebUserLeftOn > 0) {
      if (timeNowInMinutes - meetingModel.lastWebUserLeftOn > 2) {
        log.info("MonitorNumberOfWebUsers empty for meeting [" + mProps.meetingID + "]. Ejecting all users from voice.")
        outGW.send(new EjectAllVoiceUsers(mProps.meetingID, mProps.recorded, mProps.voiceBridge))

      }
    }

    val now = timeNowInMinutes

    println("(" + meetingModel.startedOn + "+" + mProps.duration + ") - " + now + " = " + ((meetingModel.startedOn + mProps.duration) - now) + " < 15")

    if (mProps.duration > 0 && (((meetingModel.startedOn + mProps.duration) - now) < 15)) {
      log.warning("MEETING WILL END IN 15 MINUTES!!!!")
    }
  }

  def timeNowInMinutes(): Long = {
    TimeUnit.NANOSECONDS.toMinutes(System.nanoTime())
  }

  def sendMeetingHasEnded(userId: String) {
    outGW.send(new MeetingHasEnded(mProps.meetingID, userId))
    outGW.send(new DisconnectUser(mProps.meetingID, userId))
  }

  private def handleEndMeeting(msg: EndMeeting) {
    meetingModel.meetingHasEnded
    outGW.send(new MeetingEnded(msg.meetingID, mProps.recorded, mProps.voiceBridge))
    outGW.send(new DisconnectAllUsers(msg.meetingID))
  }

  private def handleVoiceConfRecordingStartedMessage(msg: VoiceConfRecordingStartedMessage) {
    if (msg.recording) {
      meetingModel.setVoiceRecordingFilename(msg.recordStream)
      outGW.send(new VoiceRecordingStarted(mProps.meetingID, mProps.recorded, msg.recordStream, msg.timestamp, mProps.voiceBridge))
    } else {
      meetingModel.setVoiceRecordingFilename("")
      outGW.send(new VoiceRecordingStopped(mProps.meetingID, mProps.recorded, msg.recordStream, msg.timestamp, mProps.voiceBridge))
    }
  }

  private def handleSetRecordingStatus(msg: SetRecordingStatus) {
    log.debug("Change recording status for meeting [" + mProps.meetingID + "], recording=[" + msg.recording + "]")
    if (mProps.allowStartStopRecording && meetingModel.isRecording() != msg.recording) {
      if (msg.recording) {
        meetingModel.recordingStarted()
      } else {
        meetingModel.recordingStopped()
      }
      log.debug("Sending recording status for meeting [" + mProps.meetingID + "], recording=[" + msg.recording + "]")
      outGW.send(new RecordingStatusChanged(mProps.meetingID, mProps.recorded, msg.userId, msg.recording))
    }
  }

  private def handleGetRecordingStatus(msg: GetRecordingStatus) {
    outGW.send(new GetRecordingStatusReply(mProps.meetingID, mProps.recorded, msg.userId, meetingModel.isRecording().booleanValue()))
  }

  def lockLayout(lock: Boolean) {
    meetingModel.lockLayout(lock)
  }

  def newPermissions(np: Permissions) {
    meetingModel.setPermissions(np)
  }

  def permissionsEqual(other: Permissions): Boolean = {
    meetingModel.permissionsEqual(other)
  }

  // If the meeting is recorded, tell FS to record video
  private def handleDeskShareStartedRequest(msg: DeskShareStartedRequest) {
    println("\n\n\nMeetingActor-handleDeskShareStartedRequest\n")
    println("isRecording=" + meetingModel.isRecording())

    //TODO check for autoRecord

    val timestamp = System.currentTimeMillis().toString()
    //    val streamPath = "rtmp://" + mProps.red5DeskShareIP + "/" + mProps.red5DeskShareApp + "/abc/dev-test" //TODO change this
    val streamPath = "rtmp://192.168.0.109/" + mProps.red5DeskShareApp + "/abc/dev-test" //TODO change this
    // rtmp://192.168.0.109/live/abc/dev-test
    println("CURRENTLY THE STREAMPATH=" + streamPath)

    println("IS BROADCASTING RTMP = " + meetingModel.isBroadcastingRTMP())
    // Tell FreeSwitch to broadcast to RTMP
    outGW.send(new DeskShareStartRTMPBroadcast(msg.conferenceName, streamPath, timestamp))
    meetingModel.broadcastingRTMPStarted()

    if (meetingModel.isRecording()) {
      println("IS RECORDING")

      //TODO this path should be changed back 
      //      val filepath = "/var/freeswitch/meetings/" + mProps.meetingID + "-" + timestamp + ".mp4"
      val filepath = "/home/debian/" + mProps.meetingID + "-" + timestamp + ".mp4"

      meetingModel.recordingStarted()
      meetingModel.setVoiceRecordingFilename(filepath)

      // Tell FreeSwitch to start recording to a file
      outGW.send(new DeskShareStartRecording(msg.conferenceName, filepath, timestamp))
    } else {
      println("IS NOT RECORDING")
    }
  }

  private def handleDeskShareStoppedRequest(msg: DeskShareStoppedRequest) {
    println("\n\n\nMeetingActor-handleDeskShareStoppedRequest\n")
    println("isRecording=" + meetingModel.isRecording())

    // Tell FreeSwitch to stop broadcasting to RTMP
    val timestamp = System.currentTimeMillis().toString()
    println("IS BROADCASTING RTMP = " + meetingModel.isBroadcastingRTMP())
    //    val streamPath = "rtmp://" + mProps.red5DeskShareIP + "/" + mProps.red5DeskShareApp + "/abc/dev-test" //TODO change this
    val streamPath = "rtmp://192.168.0.109/" + mProps.red5DeskShareApp + "/abc/dev-test" //TODO change this
    outGW.send(new DeskShareStopRTMPBroadcast(msg.conferenceName, streamPath, timestamp))
    meetingModel.broadcastingRTMPStoppped()

    if (meetingModel.isRecording()) {
      println("STOPPING WHEN IT IS RECORDING")
      val timestamp = System.currentTimeMillis().toString()

      meetingModel.recordingStopped()

      // Tell FreeSwitch to stop recording to a file
      outGW.send(new DeskShareStopRecording(msg.conferenceName, meetingModel.getVoiceRecordingFilename(), timestamp))
    } else {
      println("ERROR: STOP REC BUT IT WAS NOT RECORDING?!")
    }
  }

  private def handleDeskShareRecordingStartedRequest(msg: DeskShareRecordingStartedRequest) {
    //TODO
  }

  private def handleDeskShareRecordingStoppedRequest(msg: DeskShareRecordingStoppedRequest) {
    //TODO
  }
}