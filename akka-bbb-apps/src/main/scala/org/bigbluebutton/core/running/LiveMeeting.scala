package org.bigbluebutton.core.running

import java.util.concurrent.TimeUnit

import akka.actor.ActorContext
import akka.event.Logging
import org.bigbluebutton.core.api._
import org.bigbluebutton.core.apps._
import org.bigbluebutton.core.bus.IncomingEventBus
import org.bigbluebutton.core.models.{ RegisteredUsers, Users }
import org.bigbluebutton.core.{ MeetingModel, MeetingProperties, OutMessageGateway }

class LiveMeeting(val mProps: MeetingProperties,
    val eventBus: IncomingEventBus,
    val chatModel: ChatModel,
    val layoutModel: LayoutModel,
    val meetingModel: MeetingModel,
    private val usersModel: UsersModel,
    val users: Users,
    val registeredUsers: RegisteredUsers,
    val pollModel: PollModel,
    val wbModel: WhiteboardModel,
    val presModel: PresentationModel,
    val breakoutModel: BreakoutRoomModel,
    val captionModel: CaptionModel,
    val notesModel: SharedNotesModel)(implicit val context: ActorContext) {

  val log = Logging(context.system, getClass)

  def hasMeetingEnded(): Boolean = {
    meetingModel.hasMeetingEnded()
  }

  def webUserJoined() {
    if (Users.numWebUsers(users.toVector) > 0) {
      meetingModel.resetLastWebUserLeftOn()
    }
  }

  def setCurrentPresenterInfo(pres: Presenter) {
    usersModel.setCurrentPresenterInfo(pres)
  }

  def getCurrentPresenterInfo(): Presenter = {
    usersModel.getCurrentPresenterInfo()
  }

  def addGlobalAudioConnection(userID: String): Boolean = {
    usersModel.addGlobalAudioConnection(userID)
  }

  def removeGlobalAudioConnection(userID: String): Boolean = {
    usersModel.removeGlobalAudioConnection(userID)
  }

  def startRecordingVoice() {
    usersModel.startRecordingVoice()
  }

  def stopRecordingVoice() {
    usersModel.stopRecordingVoice()
  }

  def isVoiceRecording: Boolean = {
    usersModel.isVoiceRecording
  }

  def startCheckingIfWeNeedToEndVoiceConf() {
    if (Users.numWebUsers(users.toVector) == 0 && !mProps.isBreakout) {
      meetingModel.lastWebUserLeft()
      log.debug("MonitorNumberOfWebUsers started for meeting [" + mProps.meetingID + "]")
    }
  }

  def sendTimeRemainingNotice() {
    val now = timeNowInSeconds

    if (mProps.duration > 0 && (((meetingModel.startedOn + mProps.duration) - now) < 15)) {
      //  log.warning("MEETING WILL END IN 15 MINUTES!!!!")
    }
  }

  def timeNowInMinutes(): Long = {
    TimeUnit.NANOSECONDS.toMinutes(System.nanoTime())
  }

  def timeNowInSeconds(): Long = {
    TimeUnit.NANOSECONDS.toSeconds(System.nanoTime())
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
