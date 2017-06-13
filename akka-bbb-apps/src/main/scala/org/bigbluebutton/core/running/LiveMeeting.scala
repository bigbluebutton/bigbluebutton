package org.bigbluebutton.core.running

import java.util.concurrent.TimeUnit

import org.bigbluebutton.common2.domain.DefaultProps
import org.bigbluebutton.core.api._
import org.bigbluebutton.core.apps._
import org.bigbluebutton.core.models._
import org.bigbluebutton.core2.MeetingStatus2x

class LiveMeeting(val props: DefaultProps,
  val status: MeetingStatus2x,
  val chatModel: ChatModel,
  val layoutModel: LayoutModel,
  val users: Users,
  val registeredUsers: RegisteredUsers,
  val pollModel: PollModel,
  val wbModel: WhiteboardModel,
  val presModel: PresentationModel,
  val breakoutRooms: BreakoutRooms,
  val captionModel: CaptionModel,
  val notesModel: SharedNotesModel,
  val webcams: Webcams,
  val voiceUsers: VoiceUsers,
  val voiceUsersState: VoiceUsersState,
  val users2x: Users2x,
  val usersState: UsersState)
    extends ChatModelTrait {

  def hasMeetingEnded(): Boolean = {
    MeetingStatus2x.hasMeetingEnded(status)
  }

  def webUserJoined() {
    if (Users.numWebUsers(users) > 0) {
      MeetingStatus2x.resetLastWebUserLeftOn(status)
    }
  }

  def startCheckingIfWeNeedToEndVoiceConf() {
    if (Users.numWebUsers(users) == 0 && !props.meetingProp.isBreakout) {
      MeetingStatus2x.lastWebUserLeft(status)
    }
  }

  def sendTimeRemainingNotice() {
    val now = timeNowInSeconds

    if (props.durationProps.duration > 0 && (((MeetingStatus2x.startedOn(status) + props.durationProps.duration) - now) < 15)) {
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
    MeetingStatus2x.lockLayout(status, lock)
  }

  def newPermissions(np: Permissions) {
    MeetingStatus2x.setPermissions(status, np)
  }

  def permissionsEqual(other: Permissions): Boolean = {
    MeetingStatus2x.permissionsEqual(status, other)
  }

}
