package org.bigbluebutton.api2.meeting

import akka.actor.{Actor, ActorLogging, Props}
import org.bigbluebutton.api.domain.UserSession
import org.bigbluebutton.api2.bus.MsgToAkkaAppsEventBus
import org.bigbluebutton.common2.domain.DefaultProps
import org.bigbluebutton.api2.util.Util2
import org.bigbluebutton.common.messages.UserJoinedVoiceMessage
import org.bigbluebutton.common2.messages.MeetingCreatedEvtMsg


sealed trait ApiMsg
case class CreateBreakoutRoomMsg(meetingId: String, parentMeetingId: String,
                                 name: String, sequence: Integer, voiceConfId: String,
                                 viewerPassword: String, moderatorPassword: String, duration: Int,
                                 sourcePresentationId: String, sourcePresentationSlide: Int,
                                 record: Boolean) extends ApiMsg
case class EndBreakoutRoomMsg() extends ApiMsg
case class KeepAliveReply() extends ApiMsg
case class MeetingDestoyedMsg() extends ApiMsg
case class MeetingStartedMsg() extends ApiMsg
case class AddUserSession(token: String, session: UserSession)
case class RegisterUser(meetingId: String, intUserId: String, name: String, role: String,
                        extUserId: String, authToken: String, avatarURL: String,
                        guest: Boolean, authed: Boolean)
case class GetUserSession(token: String)
case class RemoveUserSession(token: String)
case object PurgeRegisteredUsers
case class GetMeetings()
case class GetSessions()

case class CreateMeetingMsg(defaultProps: DefaultProps)

case class GetMeeting(meetingId: String)
case class GetMeetingsWithId(meetingId: String)
case class GetNotEndedMeetingWithId(meetingId: String)
case class IsMeetingWithVoiceBridgeExist(voiceBridge: String)

case class EndMeeting(meetingId: String)
case class AddUserCustomData(meetingId: String, userId: String, userCustomData: collection.immutable.Map[String, String])
case class UserJoinedVoice(msg: UserJoinedVoiceMessage)
case class UserLeftVoice(msg: UserLeftVoice)
case class UserListeningOnly(msg: UserListeningOnly)
case class UserSharedWebcam(msg: UserSharedWebcam)
case class UserUnsharedWebcam(msg: UserUnsharedWebcam)

object MeetingsManagerActor {
  def props(msgToAkkaAppsEventBus: MsgToAkkaAppsEventBus): Props =
    Props(classOf[MeetingsManagerActor], msgToAkkaAppsEventBus)
}

class MeetingsManagerActor(val msgToAkkaAppsEventBus: MsgToAkkaAppsEventBus)
  extends Actor with ActorLogging
    with ToAkkaAppsSendersTrait
    with FromAkkaAppsHandlersTrait {

  private val manager = new MeetingsManager

  def receive = {
    case msg: CreateMeetingMsg => handleCreateMeeting(msg)
    case msg: MeetingCreatedEvtMsg => handleMeetingCreatedEvtMsg(msg)
  }

  def handleCreateMeeting(msg: CreateMeetingMsg): Unit = {
    for {
      mid <- Util2.getFirstPartOfMeetingId(msg.defaultProps.meetingProp.intId)
    } yield {
      MeetingsManager.findMeetingThatStartsWith(manager, mid) match {
        case Some(m) => replyWithDuplicateMeeting()
        case None => createNewMeeting(msg)
          sendCreateMeetingRequestToAkkaApps(msg.defaultProps)
          replyWithCreatedMeeting()
      }
    }
  }



  def replyWithDuplicateMeeting(): Unit = {

  }

  def createNewMeeting(msg: CreateMeetingMsg): RunningMeeting = {
    MeetingsManager.create(manager, msg.defaultProps)
  }

  def replyWithCreatedMeeting(): Unit = {

  }

}
