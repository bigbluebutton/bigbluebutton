package org.bigbluebutton.core.domain

import com.softwaremill.quicklens._

class UserState(user: RegisteredUser2x) {

  private var status: UserStatus = UserState.create(user.pinNumber, SessionId("none"))

  def get: UserStatus = status

}

object UserState {
  def create(pinNumber: PinNumber, sessionId: SessionId): UserStatus =
    UserStatus(pinNumber, false, JoinedOn(0L), LeftOn(0L), Set.empty)

}

case class UserStatus(pinNumber: PinNumber,
  // If user is joined in the meeting.
  joined: Boolean = false,
  joinedOn: JoinedOn,
  // Time user left the meeting. Allows us
  // to remove user after a certain time.
  leftOn: LeftOn,
  tokens: Set[String])
