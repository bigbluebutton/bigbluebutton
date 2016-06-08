package org.bigbluebutton.core.models

import org.bigbluebutton.core.domain.{ Abilities2x, MeetingProperties2x }

case class MeetingAbilities(removed: Set[Abilities2x], added: Set[Abilities2x])

class MeetingPermissions {
  private var permissions: MeetingAbilities = new MeetingAbilities(Set.empty, Set.empty)

  def get: MeetingAbilities = permissions
  def save(abilities: MeetingAbilities): Unit = permissions = abilities
}

class MeetingStateModel(
  val props: MeetingProperties2x,
  val abilities: MeetingPermissions,
  val registeredUsers: RegisteredUsers2x,
  val users: Users3x,
  val chats: ChatModel,
  val layouts: LayoutModel,
  val polls: PollModel,
  val whiteboards: WhiteboardModel,
  val presentations: PresentationModel,
  val breakoutRooms: BreakoutRoomModel,
  val captions: CaptionModel,
  val status: MeetingStatus)

class MeetingStatus {
  private var status: Meeting3x = new Meeting3x()

  def get: Meeting3x = status

  def save(meeting: Meeting3x): Unit = {
    status = meeting
  }
}
