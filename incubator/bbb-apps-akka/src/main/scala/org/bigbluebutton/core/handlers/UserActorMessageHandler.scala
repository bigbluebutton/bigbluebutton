package org.bigbluebutton.core.handlers

import org.bigbluebutton.SystemConfiguration
import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.core.api._
import org.bigbluebutton.core.domain.{ User3x, _ }
import org.bigbluebutton.core.models._

class UserActorMessageHandler(user: RegisteredUser2x, outGW: OutMessageGateway) extends SystemConfiguration {

  private val userState: UserState = new UserState(user)

  def handleValidateAuthToken2x(msg: ValidateAuthToken, meeting: MeetingStateModel): Unit = {
    def sendResponse(user: RegisteredUser2x): Unit = {
      // TODO: Send response with user status
      outGW.send(new ValidateAuthTokenReply2x(msg.meetingId, msg.userId, msg.token, true))
    }

    for {
      user <- RegisteredUsers2x.findWithToken(msg.token, meeting.registeredUsers.toVector)
    } yield sendResponse(user)
  }

  def handleEjectUserFromMeeting(msg: EjectUserFromMeeting, meeting: MeetingStateModel): Unit = {

  }

  def handleUserJoinWeb2x(msg: NewUserPresence2x, meeting: MeetingStateModel): Unit = {
    def becomePresenter(user: User3x): Unit = {
      // TODO: Become presenter if only moderator in meeting
      if (user.isModerator && !Users3x.hasPresenter(meeting.users.toVector)) {
        val u = User3x.add(user, PresenterRole)
        meeting.users.save(u)
        // Send presenter assigned message
      }
    }

    def process(user: User3x): Unit = {
      meeting.users.save(user)
      outGW.send(new UserJoinedEvent2x(msg.meetingId, meeting.props.recordingProp.recorded, user))
      becomePresenter(user)
    }

    Users3x.findWithId(msg.userId, meeting.users.toVector) match {
      case Some(user) =>
        // Find presence associated with this session
        val presence = User3x.findWithPresenceId(user.presence, msg.presenceId)

      // TODO: Send reconnecting message
      case None =>
        for {
          ru <- RegisteredUsers2x.findWithToken(msg.token, meeting.registeredUsers.toVector)
          u = User3x.create(msg.userId, ru.extId, ru.name, ru.roles)
          presence = User3x.create(msg.presenceId, msg.userAgent)
          user = User3x.add(u, presence)
        } yield process(user)
    }

  }

  def handleUserLeave2xCommand(msg: UserLeave2xCommand, meeting: MeetingStateModel): Unit = {
    Users3x.findWithId(msg.userId, meeting.users.toVector) match {
      case Some(user) =>
        // Find presence associated with this session
        val presence = User3x.findWithPresenceId(user.presence, msg.presenceId)

      // TODO: Send reconnecting message
      case None =>

    }
  }

  def handleViewWebCamRequest2x(msg: ViewWebCamRequest2x, meeting: MeetingStateModel): Unit = {
    def send(tokens: Set[String]): Unit = {
      if (tokens.contains(msg.token)) {
        // send media info
      }
    }

    for {
      user <- Users3x.findWithId(msg.userId, meeting.users.toVector)
    } yield send(userState.get.tokens)

  }

  def handleShareWebCamRequest2x(msg: ShareWebCamRequest2x, meeting: MeetingStateModel): Unit = {
    def send(): Unit = {

    }

    for {
      user <- Users3x.findWithId(msg.userId, meeting.users.toVector)
      presence <- User3x.findWithPresenceId(user.presence, msg.presenceId)
    } yield send()

  }

  def handleUserShareWebCam2x(msg: UserShareWebCam2x, meeting: MeetingStateModel): Unit = {
    def send(): Unit = {

    }

    for {
      user <- Users3x.findWithId(msg.userId, meeting.users.toVector)
      presence <- User3x.findWithPresenceId(user.presence, msg.presenceId)
    } yield send()

  }

  def handleUserUnShareWebCam2x(msg: UserUnShareWebCam2x, meeting: MeetingStateModel): Unit = {
    def send(): Unit = {

    }

    for {
      user <- Users3x.findWithId(msg.userId, meeting.users.toVector)
      presence <- User3x.findWithPresenceId(user.presence, msg.presenceId)
    } yield send()
  }
}
