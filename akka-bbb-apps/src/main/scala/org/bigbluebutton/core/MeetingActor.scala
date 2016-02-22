package org.bigbluebutton.core

import akka.actor.Actor
import akka.actor.ActorRef
import akka.actor.ActorLogging
import akka.actor.Props
import org.bigbluebutton.core.api._
import java.util.concurrent.TimeUnit
import org.bigbluebutton.core.util._
import scala.concurrent.duration._
import org.bigbluebutton.core.apps.{ PollApp, UsersApp, PresentationApp, LayoutApp, ChatApp, WhiteboardApp, SharedNotesApp }
import org.bigbluebutton.core.apps.{ ChatModel, LayoutModel, UsersModel, PollModel, WhiteboardModel, SharedNotesModel }
import org.bigbluebutton.core.apps.PresentationModel

object MeetingActor {
  def props(mProps: MeetingProperties, outGW: OutMessageGateway): Props =
    Props(classOf[MeetingActor], mProps: MeetingProperties, outGW)
}

class MeetingActor(val mProps: MeetingProperties, val outGW: OutMessageGateway)
    extends Actor with UsersApp with PresentationApp
    with LayoutApp with ChatApp with WhiteboardApp with PollApp
    with SharedNotesApp with ActorLogging {

  val chatModel = new ChatModel()
  val layoutModel = new LayoutModel()
  val meetingModel = new MeetingModel()
  val usersModel = new UsersModel()
  val pollModel = new PollModel()
  val wbModel = new WhiteboardModel()
  val presModel = new PresentationModel()
  val notesModel = new SharedNotesModel()

  import context.dispatcher
  context.system.scheduler.schedule(2 seconds, 30 seconds, self, "MonitorNumberOfWebUsers")

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
    case msg: ChangeUserRole =>
      handleChangeUserRole(msg)
    case msg: EjectUserFromMeeting =>
      handleEjectUserFromMeeting(msg)
    case msg: UserEmojiStatus =>
      handleUserEmojiStatus(msg)
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
    case msg: ClearChatHistoryRequest =>
      handleClearChatHistoryRequest(msg)
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
    case msg: StartCustomPollRequest =>
      handleStartCustomPollRequest(msg)
    case msg: StartPollRequest =>
      handleStartPollRequest(msg)
    case msg: StopPollRequest =>
      handleStopPollRequest(msg)
    case msg: ShowPollResultRequest =>
      handleShowPollResultRequest(msg)
    case msg: HidePollResultRequest =>
      handleHidePollResultRequest(msg)
    case msg: RespondToPollRequest =>
      handleRespondToPollRequest(msg)
    case msg: GetPollRequest =>
      handleGetPollRequest(msg)
    case msg: GetCurrentPollRequest =>
      handleGetCurrentPollRequest(msg)
    case msg: GetGuestPolicy =>
      handleGetGuestPolicy(msg)
    case msg: SetGuestPolicy =>
      handleSetGuestPolicy(msg)
    case msg: RespondToGuest =>
      handleRespondToGuest(msg)
    case msg: PatchDocumentRequest =>
      handlePatchDocumentRequest(msg)
    case msg: GetCurrentDocumentRequest =>
      handleGetCurrentDocumentRequest(msg)
    case msg: CreateAdditionalNotesRequest =>
      handleCreateAdditionalNotesRequest(msg)
    case msg: DestroyAdditionalNotesRequest =>
      handleDestroyAdditionalNotesRequest(msg)
    case msg: RequestAdditionalNotesSetRequest =>
      handleRequestAdditionalNotesSetRequest(msg)

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
    if (usersModel.numWebUsers > 0) {
      meetingModel.resetLastWebUserLeftOn()
    }
  }

  def startRecordingIfAutoStart() {
    if (mProps.recorded && !meetingModel.isRecording() && mProps.autoStartRecording && usersModel.numWebUsers == 1) {
      log.info("Auto start recording. meetingId={}", mProps.meetingID)
      meetingModel.recordingStarted()
      outGW.send(new RecordingStatusChanged(mProps.meetingID, mProps.recorded, "system", meetingModel.isRecording()))
    }
  }

  def stopAutoStartedRecording() {
    if (mProps.recorded && meetingModel.isRecording() && mProps.autoStartRecording && usersModel.numWebUsers == 0) {
      log.info("Last web user left. Auto stopping recording. meetingId={}", mProps.meetingID)
      meetingModel.recordingStopped()
      outGW.send(new RecordingStatusChanged(mProps.meetingID, mProps.recorded, "system", meetingModel.isRecording()))
    }
  }

  def startCheckingIfWeNeedToEndVoiceConf() {
    if (usersModel.numWebUsers == 0) {
      meetingModel.lastWebUserLeft()
      log.debug("MonitorNumberOfWebUsers started for meeting [" + mProps.meetingID + "]")
    }
  }

  def handleMonitorNumberOfWebUsers() {
    //    println("BACK TIMER")
    if (usersModel.numWebUsers == 0 && meetingModel.lastWebUserLeftOn > 0) {
      if (timeNowInMinutes - meetingModel.lastWebUserLeftOn > 2) {
        log.info("Empty meeting. Ejecting all users from voice. meetingId={}", mProps.meetingID)
        outGW.send(new EjectAllVoiceUsers(mProps.meetingID, mProps.recorded, mProps.voiceBridge))
      }
    }

    val now = timeNowInMinutes

    //    println("(" + meetingModel.startedOn + "+" + mProps.duration + ") - " + now + " = " + ((meetingModel.startedOn + mProps.duration) - now) + " < 15")

    if (mProps.duration > 0 && (((meetingModel.startedOn + mProps.duration) - now) < 15)) {
      //  log.warning("MEETING WILL END IN 15 MINUTES!!!!")
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
    log.info("Change recording status. meetingId=" + mProps.meetingID + " recording=" + msg.recording)
    if (mProps.allowStartStopRecording && meetingModel.isRecording() != msg.recording) {
      if (msg.recording) {
        meetingModel.recordingStarted()
      } else {
        meetingModel.recordingStopped()
      }

      outGW.send(new RecordingStatusChanged(mProps.meetingID, mProps.recorded, msg.userId, msg.recording))
    }
  }

  private def handleGetRecordingStatus(msg: GetRecordingStatus) {
    outGW.send(new GetRecordingStatusReply(mProps.meetingID, mProps.recorded, msg.userId, meetingModel.isRecording().booleanValue()))
  }

  private def handleGetGuestPolicy(msg: GetGuestPolicy) {
    outGW.send(new GetGuestPolicyReply(msg.meetingID, mProps.recorded, msg.requesterID, meetingModel.getGuestPolicy().toString()))
  }

  private def handleSetGuestPolicy(msg: SetGuestPolicy) {
    meetingModel.setGuestPolicy(msg.policy)
    meetingModel.setGuestPolicySetBy(msg.setBy)
    outGW.send(new GuestPolicyChanged(msg.meetingID, mProps.recorded, meetingModel.getGuestPolicy().toString()))
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

}