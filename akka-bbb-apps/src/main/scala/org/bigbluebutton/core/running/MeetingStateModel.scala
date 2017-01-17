package org.bigbluebutton.core.running

import org.bigbluebutton.core.{ MeetingModel, MeetingProperties }
import org.bigbluebutton.core.apps._

class MeetingStateModel(val mProps: MeetingProperties,
  val chatModel: ChatModel,
  val layoutModel: LayoutModel,
  val meetingModel: MeetingModel,
  val usersModel: UsersModel,
  val pollModel: PollModel,
  val wbModel: WhiteboardModel,
  val presModel: PresentationModel,
  val breakoutModel: BreakoutRoomModel,
  val captionModel: CaptionModel)

