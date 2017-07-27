package org.bigbluebutton.core.running

import org.bigbluebutton.common2.domain.DefaultProps
import org.bigbluebutton.core.api._
import org.bigbluebutton.core.apps._
import org.bigbluebutton.core.models._
import org.bigbluebutton.core2.MeetingStatus2x

class LiveMeeting(
    val props:            DefaultProps,
    val status:           MeetingStatus2x,
    val screenshareModel: ScreenshareModel,
    val chatModel:        ChatModel,
    val layoutModel:      LayoutModel,
    val layouts:          Layouts,
    val registeredUsers:  RegisteredUsers,
    val polls:            Polls, // 2x
    val wbModel:          WhiteboardModel,
    val presModel:        PresentationModel,
    val breakoutRooms:    BreakoutRooms,
    val captionModel:     CaptionModel,
    val notesModel:       SharedNotesModel,
    val webcams:          Webcams,
    val voiceUsers:       VoiceUsers,
    val users2x:          Users2x,
    val guestsWaiting:    GuestsWaiting
) {

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
