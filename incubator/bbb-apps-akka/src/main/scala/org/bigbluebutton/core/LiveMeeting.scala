package org.bigbluebutton.core

import org.bigbluebutton.core.domain.{ IntUserId, MeetingProperties, Permissions }
import org.bigbluebutton.core.handlers._
import java.util.concurrent.TimeUnit
import org.bigbluebutton.core.api._
import org.bigbluebutton.core.bus.IncomingEventBus
import akka.actor.ActorContext
import akka.event.Logging
import org.bigbluebutton.core.models._

class LiveMeeting(val props: MeetingProperties,
  val eventBus: IncomingEventBus,
  val outGW: OutMessageGateway,
  val chatModel: ChatModel,
  val layoutModel: LayoutModel,
  val pollModel: PollModel,
  val wbModel: WhiteboardModel,
  val presModel: PresentationModel,
  val breakoutModel: BreakoutRoomModel,
  val captionModel: CaptionModel)(implicit val context: ActorContext)
    extends PresentationHandler
    with LayoutHandler with ChatHandler with WhiteboardHandler with PollHandler
    with BreakoutRoomHandler with CaptionHandler with UsersHandler {

  val log = Logging(context.system, getClass)

  object Meeting extends Meeting
  val meeting = Meeting

  def webUserJoined() {
    if (meeting.numWebUsers > 0) {
      meeting.resetLastWebUserLeftOn()
    }
  }

  def startRecordingIfAutoStart() {
    if (props.recorded.value && !meeting.isRecording && props.autoStartRecording && meeting.numWebUsers == 1) {
      log.info("Auto start recording. meetingId={}", props.id)
      meeting.recordingStarted()
      outGW.send(new RecordingStatusChanged(props.id, props.recorded, IntUserId("system"), meeting.isRecording))
    }
  }

  def stopAutoStartedRecording() {
    if (props.recorded.value && meeting.isRecording && props.autoStartRecording && meeting.numWebUsers == 0) {
      log.info("Last web user left. Auto stopping recording. meetingId={}", props.id)
      meeting.recordingStopped()
      outGW.send(new RecordingStatusChanged(props.id, props.recorded, IntUserId("system"), meeting.isRecording))
    }
  }

  def startCheckingIfWeNeedToEndVoiceConf() {
    if (meeting.numWebUsers == 0) {
      meeting.lastWebUserLeft()
      log.debug("MonitorNumberOfWebUsers started for meeting [" + props.id + "]")
    }
  }

  def sendTimeRemainingNotice() {
    val now = timeNowInSeconds

    if (props.duration > 0 && (((meeting.startedOn + props.duration) - now) < 15)) {
      //  log.warning("MEETING WILL END IN 15 MINUTES!!!!")
    }
  }

  def handleMonitorNumberOfWebUsers(msg: MonitorNumberOfUsers) {
    if (meeting.numWebUsers == 0 && meeting.lastWebUserLeftOn > 0) {
      if (timeNowInMinutes - meeting.lastWebUserLeftOn > 2) {
        log.info("Empty meeting. Ejecting all users from voice. meetingId={}", props.id)
        outGW.send(new EjectAllVoiceUsers(props.id, props.recorded, props.voiceConf))
      }
    }
  }

  def handleSendTimeRemainingUpdate(msg: SendTimeRemainingUpdate) {
    if (props.duration > 0) {
      val endMeetingTime = meeting.startedOn + (props.duration * 60)
      val timeRemaining = endMeetingTime - timeNowInSeconds
      outGW.send(new MeetingTimeRemainingUpdate(props.id, props.recorded, timeRemaining.toInt))
    }
    if (!props.isBreakout && breakoutModel.getRooms().length > 0) {
      val room = breakoutModel.getRooms()(0)
      val endMeetingTime = meeting.breakoutRoomsStartedOn + (meeting.breakoutRoomsdurationInMinutes * 60)
      val timeRemaining = endMeetingTime - timeNowInSeconds
      outGW.send(new BreakoutRoomsTimeRemainingUpdateOutMessage(props.id, props.recorded, timeRemaining.toInt))
    } else if (meeting.breakoutRoomsStartedOn != 0) {
      meeting.breakoutRoomsdurationInMinutes = 0
      meeting.breakoutRoomsStartedOn = 0
    }
  }

  def handleExtendMeetingDuration(msg: ExtendMeetingDuration) {

  }

  def timeNowInMinutes(): Long = {
    TimeUnit.NANOSECONDS.toMinutes(System.nanoTime())
  }

  def timeNowInSeconds(): Long = {
    TimeUnit.NANOSECONDS.toSeconds(System.nanoTime())
  }

  def handleEndMeeting(msg: EndMeeting) {
    meeting.meetingHasEnded()
    outGW.send(new MeetingEnded(msg.meetingId, props.recorded, props.voiceConf.value))
    outGW.send(new DisconnectAllUsers(msg.meetingId))
  }

  def handleVoiceConfRecordingStartedMessage(msg: VoiceConfRecordingStartedMessage) {
    if (msg.recording) {
      meeting.setVoiceRecordingFilename(msg.recordStream)
      outGW.send(new VoiceRecordingStarted(props.id, props.recorded,
        msg.recordStream, msg.timestamp, props.voiceConf.value))
    } else {
      meeting.setVoiceRecordingFilename("")
      outGW.send(new VoiceRecordingStopped(props.id, props.recorded,
        msg.recordStream, msg.timestamp, props.voiceConf.value))
    }
  }

  def handleSetRecordingStatus(msg: SetRecordingStatus) {
    log.info("Change recording status. meetingId=" + props.id + " recording=" + msg.recording)
    if (props.allowStartStopRecording && meeting.isRecording != msg.recording) {
      if (msg.recording) {
        meeting.recordingStarted()
      } else {
        meeting.recordingStopped()
      }

      outGW.send(new RecordingStatusChanged(props.id, props.recorded, msg.userId, msg.recording))
    }
  }

  def handleGetRecordingStatus(msg: GetRecordingStatus) {
    outGW.send(new GetRecordingStatusReply(props.id, props.recorded, msg.userId, meeting.isRecording.booleanValue()))
  }

  def lockLayout(lock: Boolean) {
    meeting.lockLayout(lock)
  }

  def newPermissions(np: Permissions) {
    meeting.setPermissions(p = np)
  }

  def permissionsEqual(other: Permissions): Boolean = meeting.permissionsEqual(other)
}
