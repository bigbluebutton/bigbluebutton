package org.bigbluebutton.api2.meeting

import akka.actor.{Actor, ActorLogging, Props}
import org.bigbluebutton.api.domain.UserSession
import org.bigbluebutton.api2.bus.MsgToAkkaAppsEventBus
import org.bigbluebutton.common2.domain.DefaultProps
import org.bigbluebutton.api2.util.Util2
import org.bigbluebutton.common2.msgs.{BbbCommonEnvCoreMsg, MeetingCreatedEvtMsg}

sealed trait ApiMsg
case class CreateBreakoutRoomMsg(meetingId: String, parentMeetingId: String,
                                 name: String, sequence: Integer, freeJoin: Boolean, voiceConfId: String,
                                 viewerPassword: String, moderatorPassword: String, duration: Int,
                                 sourcePresentationId: String, sourcePresentationSlide: Int,
                                 record: Boolean) extends ApiMsg

case class AddUserSession(token: String, session: UserSession)
case class RegisterUser(meetingId: String, intUserId: String, name: String, role: String,
                        extUserId: String, authToken: String, avatarURL: String,
                        guest: Boolean, authed: Boolean, guestStatus: String)


case class CreateMeetingMsg(defaultProps: DefaultProps)



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
    case msg: RegisterUser => handleRegisterUser(msg)
    case msg: BbbCommonEnvCoreMsg => handleBbbCommonEnvCoreMsg(msg)
  }

  def handleCreateMeeting(msg: CreateMeetingMsg): Unit = {
    log.debug("Received create meeting request for {} {} ", msg.defaultProps.meetingProp.intId,
      msg.defaultProps.meetingProp.name)
    for {
      mid <- Util2.getFirstPartOfMeetingId(msg.defaultProps.meetingProp.intId)
    } yield {
      MeetingsManager.findMeetingThatStartsWith(manager, mid) match {
        case Some(m) => replyWithDuplicateMeeting(msg)
        case None => createNewMeeting(msg)
          log.debug("Received create meeting request for {} {} ", msg.defaultProps.meetingProp.intId,
            msg.defaultProps.meetingProp.name)
          sendCreateMeetingRequestToAkkaApps(msg.defaultProps)
          replyWithCreatedMeeting()
      }
    }
  }



  def replyWithDuplicateMeeting(msg: CreateMeetingMsg): Unit = {
    log.warning("Duplicate create meeting request for {} {} ", msg.defaultProps.meetingProp.intId,
      msg.defaultProps.meetingProp.name)
  }

  def createNewMeeting(msg: CreateMeetingMsg): RunningMeeting = {
    MeetingsManager.create(manager, msg.defaultProps)
  }

  def replyWithCreatedMeeting(): Unit = {

  }

  def handleRegisterUser(msg: RegisterUser): Unit = {
    sendRegisterUserRequestToAkkaApps(msg)
  }

  private def handleBbbCommonEnvCoreMsg(msg: BbbCommonEnvCoreMsg): Unit = {
    msg.core match {
      case m: MeetingCreatedEvtMsg => handleMeetingCreatedEvtMsg(m)
      case _ => log.error("***** Cannot handle " + msg.envelope.name)
    }
  }
}
