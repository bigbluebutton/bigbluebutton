package org.bigbluebutton.core.running

import org.bigbluebutton.core.{ MeetingModel, MeetingProperties }
import org.bigbluebutton.core.apps._
import org.bigbluebutton.core.models.{ MeetingStatus, RegisteredUsers, Users }

class MeetingStateModel(val mProps: MeetingProperties,
  val registeredUsers: RegisteredUsers,
  val chatModel: ChatModel,
  val layoutModel: LayoutModel,
  val meetingModel: MeetingModel,
  val users: Users,
  val pollModel: PollModel,
  val wbModel: WhiteboardModel,
  val presModel: PresentationModel,
  val breakoutModel: BreakoutRoomModel,
  val captionModel: CaptionModel,
  val meetingStatus: MeetingStatus)

