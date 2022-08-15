package org.bigbluebutton.service

import akka.actor.Status.{Failure, Status, Success}
import akka.actor.TypedActor.context
import akka.actor.{Actor, ActorLogging, ActorRef, ActorSelection, ActorSystem, Props}
import akka.pattern.ask
import akka.pattern.AskTimeoutException
import akka.util.Timeout
import com.typesafe.sslconfig.ssl.SystemConfiguration
//import org.bigbluebutton.SystemConfiguration
import org.bigbluebutton.common2.domain.DefaultProps
import org.bigbluebutton.common2.msgs.{BbbCommonEnvCoreMsg, MeetingEndingEvtMsg, MeetingInfoAnalyticsServiceMsg}
import org.bigbluebutton.model.{ApiResponse, ApiResponseFailure, CreateMeetingApiMsg, EndMeetingApiMsg, GetUserApiMsg, RegisterUserApiMsg}
//import org.bigbluebutton.core.bus.{BigBlueButtonEvent, InternalEventBus}
//import org.bigbluebutton.service.MeetingService.meetings
import scala.language.postfixOps
import scala.collection.mutable
import scala.concurrent.duration.DurationInt
import scala.concurrent.{Await, ExecutionContextExecutor, Future}

//sealed trait MeetingMessage

//case class GetMeetingMessage(meetingId: String) extends MeetingMessage
//case object GetMeetingsInfoMessage extends MeetingMessage
//case class MeetingResponseMsg(optionMeetingInfoAnalytics: Option[MeetingInfoAnalytics]) extends MeetingMessage
//case class MeetingListResponseMsg(optionMeetingsInfoAnalytics: Option[List[MeetingInfoAnalytics]]) extends MeetingMessage

object MeetingService {

//  var system: ActorSystem
//  var actorRef: ActorSelection

  implicit val system = ActorSystem("bbb-meeting-api")
  val remoteBbbActor = context.actorSelection("akka.tcp://bigbluebutton-apps-system@127.0.1.1:25520/user/bigbluebutton-actor")

//  var meetings: Map[String, DefaultProps] = Map()
//  def apply(localActor: ActorSystem, remoteActor: ActorSelection) = {
//    system = localActor
//    actorRef = remoteActor
//  }

  implicit def executionContext: ExecutionContextExecutor = system.dispatcher
  implicit val timeout: Timeout = 2 seconds

  case class MeetingCreateResp(
                                msg:              String,
                              )

  def createMeeting(defaultprops: DefaultProps): Future[ApiResponse] = {
    val future = remoteBbbActor.ask(CreateMeetingApiMsg(defaultprops)).mapTo[ApiResponse]
    future.recover {
      case e: AskTimeoutException => ApiResponseFailure("Request Timeout error")
    }
  }

  def endMeeting(meetingID: String): Future[ApiResponse] = {
    val future = remoteBbbActor.ask(EndMeetingApiMsg(meetingID)).mapTo[ApiResponse]

    future.recover {
      case e: AskTimeoutException => ApiResponseFailure("Request Timeout error")
    }
  }

  def registerUser(regUser: RegisterUser) = {
    val future = remoteBbbActor.ask(RegisterUserApiMsg(regUser)).mapTo[ApiResponse]

    future.recover {
      case e: AskTimeoutException => ApiResponseFailure("Request Timeout error")
    }
  }

  def findUser(meetingId: String, userIntId: String) = {
    val future = remoteBbbActor.ask(GetUserApiMsg(meetingId, userIntId)).mapTo[ApiResponse]

    future.recover {
      case e: AskTimeoutException => ApiResponseFailure("Request Timeout error")
    }
  }

}
/*
object MeetingActor {
  def props(): Props = Props(classOf[MeetingActor])
}

class MeetingActor extends Actor with ActorLogging {
  var optionMeeting: Option[MeetingInfoAnalytics] = None
  var meetingInfoMap: mutable.HashMap[String, MeetingInfoAnalytics] = mutable.HashMap.empty[String, MeetingInfoAnalytics]

  override def receive: Receive = {
    case msg: BbbCommonEnvCoreMsg => handle(msg)
    case GetMeetingsInfoMessage =>
      if (meetingInfoMap.size > 0) {
        sender ! MeetingListResponseMsg(Option(meetingInfoMap.values.toList))
      } else {
        sender ! MeetingListResponseMsg(None)
      }
    case GetMeetingMessage(meetingId) =>
      meetingInfoMap.get(meetingId) match {
        case Some(meetingInfoAnalytics) =>
          sender ! MeetingResponseMsg(Option(meetingInfoAnalytics))
        case None => sender ! MeetingResponseMsg(None)
      }
    case _ => // ignore other messages
  }

  def handle(msg: BbbCommonEnvCoreMsg): Unit = {
    msg.core match {
      case m: MeetingInfoAnalyticsServiceMsg =>
        val meetingInternalId = m.body.meetingInfo.internalId

        optionMeeting = Option.apply(MeetingInfoAnalytics(m.body.meetingInfo.name, m.body.meetingInfo.externalId,
          meetingInternalId, m.body.meetingInfo.hasUserJoined, m.body.meetingInfo.isMeetingRecorded, m.body.meetingInfo.webcams,
          m.body.meetingInfo.audio, m.body.meetingInfo.screenshare, m.body.meetingInfo.users, m.body.meetingInfo.presentation,
          m.body.meetingInfo.breakoutRoom))

        meetingInfoMap.get(meetingInternalId) match {
          case Some(_) => {
            meetingInfoMap(meetingInternalId) = optionMeeting.get
          }
          case None => meetingInfoMap += (meetingInternalId -> optionMeeting.get)
        }
      case m: MeetingEndingEvtMsg => meetingInfoMap -= m.body.meetingId
      case _                      => // ignore
    }
  }

}
 */