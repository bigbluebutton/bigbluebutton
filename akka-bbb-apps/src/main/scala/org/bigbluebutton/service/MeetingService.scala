package org.bigbluebutton.service

import akka.actor.Status.{Failure, Status, Success}
import akka.actor.{Actor, ActorLogging, ActorRef, ActorSystem, Props}
import akka.pattern.ask
import akka.pattern.AskTimeoutException
import akka.util.Timeout
import org.bigbluebutton.{MeetingInfoAnalytics, SystemConfiguration}
import org.bigbluebutton.api.meeting.MsgBuilder
import org.bigbluebutton.api.meeting.join.RegisterUser
import org.bigbluebutton.common2.domain.DefaultProps
import org.bigbluebutton.common2.msgs.{BbbCommonEnvCoreMsg, MeetingEndingEvtMsg, MeetingInfoAnalyticsServiceMsg}
import org.bigbluebutton.core.api.{ApiResponse, ApiResponseFailure, CreateMeetingApiMsg, GetUserApiMsg, RegisterUserApiMsg}
import org.bigbluebutton.core.bus.{BigBlueButtonEvent, InternalEventBus}
import org.bigbluebutton.service.MeetingService.meetings

import scala.collection.mutable
import scala.concurrent.duration.DurationInt
import scala.concurrent.{Await, ExecutionContextExecutor, Future}

sealed trait MeetingMessage

case class GetMeetingMessage(meetingId: String) extends MeetingMessage
//case object GetMeetingsInfoMessage extends MeetingMessage
case class MeetingResponseMsg(optionMeetingInfoAnalytics: Option[MeetingInfoAnalytics]) extends MeetingMessage
case class MeetingListResponseMsg(optionMeetingsInfoAnalytics: Option[List[MeetingInfoAnalytics]]) extends MeetingMessage

object MeetingService {
  var meetings: Map[String, DefaultProps] = Map()
  def apply(system: ActorSystem, meetingInfoActor: ActorRef, eventBus: InternalEventBus, actorRef: ActorRef) = new MeetingService(system, meetingInfoActor, eventBus, actorRef)
}

class MeetingService(system: ActorSystem, meetingInfoActor: ActorRef, eventBus: InternalEventBus, actorRef: ActorRef) extends SystemConfiguration {
  implicit def executionContext: ExecutionContextExecutor = system.dispatcher
  implicit val timeout: Timeout = 2 seconds

  def getAnalytics(): Future[MeetingInfoListResponseMsg] = {
    val future = meetingInfoActor.ask(GetMeetingsInfoMessage).mapTo[MeetingInfoListResponseMsg]

    future.recover {
      case e: AskTimeoutException => {
        MeetingInfoListResponseMsg(None)
      }
    }
  }

  //  def createMeeting(defaultprops: DefaultProps): Future[MeetingResponseMsg] = {
  //  def getAnalytics(meetingId: String): Future[MeetingInfoResponseMsg] = {
  //    val future = meetingInfoActor.ask(GetMeetingInfoMessage(meetingId)).mapTo[MeetingInfoResponseMsg]
  //
  //    future.recover {
  //      case e: AskTimeoutException => {
  //        MeetingInfoResponseMsg(None)
  //      }
  //    }
  //  }

  case class MeetingCreateResp(
      msg:              String,
  )

//  case class MeetingCreateResponseMsg(optionMeetingCreateResp: Option[String])

  def createMeeting(defaultprops: DefaultProps): Future[ApiResponse] = {
//    val msg = MsgBuilder.buildCreateMeetingRequestToAkkaApps(defaultprops)

    // with SystemConfiguration
    //      eventBus.publish(BigBlueButtonEvent(meetingManagerChannel,msg)
    //    eventBus.publish(BigBlueButtonEvent(meetingManagerChannel, CreateMeetingApiMsg(defaultprops)))

    //    actorRef ! CreateMeetingApiMsg(defaultprops)

    println("enviando......!!!!!!!!!!!")

//    val future = actorRef ? CreateMeetingApiMsg(defaultprops).mapTo[ApiResponse]
    val future = actorRef.ask(CreateMeetingApiMsg(defaultprops)).mapTo[ApiResponse]

    future.onComplete(resp => {
      println("RECEBEUUU RESPOSTA!!! :D")
      println(resp)
      meetings += (defaultprops.meetingProp.intId -> defaultprops)
    })

    future.recover {
      case e: AskTimeoutException => {
        ApiResponseFailure("Request Timeout error")
      }
    }



    // val result = Await.result(future, timeout.duration).asInstanceOf[String]
    //println(result)

    // result

    //      val future = meetingInfoActor.ask(GetMeetingMessage(meetingId)).mapTo[MeetingResponseMsg]
    //
    //      future.recover {
    //        case e: AskTimeoutException => {
    //          MeetingResponseMsg(None)
    //        }
    //      }
  }

  def registerUser(regUser: RegisterUser) = {
//    val msg = MsgBuilder.buildRegisterUserRequestToAkkaApps(regUser)

    // with SystemConfiguration
    //      eventBus.publish(BigBlueButtonEvent(meetingManagerChannel,msg)
    //    eventBus.publish(BigBlueButtonEvent(meetingManagerChannel, CreateMeetingApiMsg(defaultprops)))

    //    actorRef ! CreateMeetingApiMsg(defaultprops)

    val future = actorRef.ask(RegisterUserApiMsg(regUser)).mapTo[ApiResponse]

    println("RECEBEU RESPOSTA!!!!!!!!!!!")

    future.recover {
      case e: AskTimeoutException => {
        ApiResponseFailure("Request Timeout error")
      }
    }

//
//    val future = actorRef ? RegisterUserApiMsg(regUser)
//    val result = Await.result(future, timeout.duration).asInstanceOf[String]
//    println(result)

    //      val future = meetingInfoActor.ask(GetMeetingMessage(meetingId)).mapTo[MeetingResponseMsg]
    //
    //      future.recover {
    //        case e: AskTimeoutException => {
    //          MeetingResponseMsg(None)
    //        }
    //      }
  }

  def findUser(meetingId: String, userIntId: String) = {
    //    val msg = MsgBuilder.buildRegisterUserRequestToAkkaApps(regUser)

    // with SystemConfiguration
    //      eventBus.publish(BigBlueButtonEvent(meetingManagerChannel,msg)
    //    eventBus.publish(BigBlueButtonEvent(meetingManagerChannel, CreateMeetingApiMsg(defaultprops)))

    //    actorRef ! CreateMeetingApiMsg(defaultprops)

    val future = actorRef.ask(GetUserApiMsg(meetingId, userIntId)).mapTo[ApiResponse]

    println("RECEBEU RESPOSTA!!!!!!!!!!!")

    future.recover {
      case e: AskTimeoutException => {
        ApiResponseFailure("Request Timeout error")
      }
    }

    //
    //    val future = actorRef ? RegisterUserApiMsg(regUser)
    //    val result = Await.result(future, timeout.duration).asInstanceOf[String]
    //    println(result)

    //      val future = meetingInfoActor.ask(GetMeetingMessage(meetingId)).mapTo[MeetingResponseMsg]
    //
    //      future.recover {
    //        case e: AskTimeoutException => {
    //          MeetingResponseMsg(None)
    //        }
    //      }
  }

}

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