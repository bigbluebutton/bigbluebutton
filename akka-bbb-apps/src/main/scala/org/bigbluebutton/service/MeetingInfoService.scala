package org.bigbluebutton.service

import akka.actor.{ Actor, ActorLogging, ActorRef, ActorSystem, Props }
import akka.pattern.ask
import akka.pattern.AskTimeoutException
import akka.util.Timeout
import org.bigbluebutton.MeetingInfoAnalytics
import org.bigbluebutton.common2.msgs.{ BbbCommonEnvCoreMsg, MeetingEndingEvtMsg, MeetingInfoAnalyticsServiceMsg }

import scala.collection.mutable
import scala.concurrent.duration.DurationInt
import scala.concurrent.{ ExecutionContextExecutor, Future }

sealed trait MeetingInfoMessage

case class GetMeetingInfoMessage(meetingId: String) extends MeetingInfoMessage
case object GetMeetingsInfoMessage extends MeetingInfoMessage
case class MeetingInfoResponseMsg(optionMeetingInfoAnalytics: Option[MeetingInfoAnalytics]) extends MeetingInfoMessage
case class MeetingInfoListResponseMsg(optionMeetingsInfoAnalytics: Option[List[MeetingInfoAnalytics]]) extends MeetingInfoMessage

object MeetingInfoService {
  def apply(system: ActorSystem, meetingInfoActor: ActorRef) = new MeetingInfoService(system, meetingInfoActor)
}

class MeetingInfoService(system: ActorSystem, meetingInfoActor: ActorRef) {
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

  def getAnalytics(meetingId: String): Future[MeetingInfoResponseMsg] = {
    val future = meetingInfoActor.ask(GetMeetingInfoMessage(meetingId)).mapTo[MeetingInfoResponseMsg]

    future.recover {
      case e: AskTimeoutException => {
        MeetingInfoResponseMsg(None)
      }
    }
  }
}

object MeetingInfoActor {
  def props(): Props = Props(classOf[MeetingInfoActor])
}

class MeetingInfoActor extends Actor with ActorLogging {
  var optionMeetingInfo: Option[MeetingInfoAnalytics] = None
  var meetingInfoMap: mutable.HashMap[String, MeetingInfoAnalytics] = mutable.HashMap.empty[String, MeetingInfoAnalytics]

  override def receive: Receive = {
    case msg: BbbCommonEnvCoreMsg => handle(msg)
    case GetMeetingsInfoMessage =>
      if (meetingInfoMap.size > 0) {
        sender ! MeetingInfoListResponseMsg(Option(meetingInfoMap.values.toList))
      } else {
        sender ! MeetingInfoListResponseMsg(None)
      }
    case GetMeetingInfoMessage(meetingId) =>
      meetingInfoMap.get(meetingId) match {
        case Some(meetingInfoAnalytics) =>
          sender ! MeetingInfoResponseMsg(Option(meetingInfoAnalytics))
        case None => sender ! MeetingInfoResponseMsg(None)
      }
    case _ => // ignore other messages
  }

  def handle(msg: BbbCommonEnvCoreMsg): Unit = {
    msg.core match {
      case m: MeetingInfoAnalyticsServiceMsg =>
        val meetingInternalId = m.body.meetingInfo.internalId

        optionMeetingInfo = Option.apply(MeetingInfoAnalytics(m.body.meetingInfo.name, m.body.meetingInfo.externalId,
          meetingInternalId, m.body.meetingInfo.hasUserJoined, m.body.meetingInfo.isMeetingRecorded, m.body.meetingInfo.webcams,
          m.body.meetingInfo.audio, m.body.meetingInfo.screenshare, m.body.meetingInfo.users, m.body.meetingInfo.presentation,
          m.body.meetingInfo.breakoutRoom))

        meetingInfoMap.get(meetingInternalId) match {
          case Some(_) => {
            meetingInfoMap(meetingInternalId) = optionMeetingInfo.get
          }
          case None => meetingInfoMap += (meetingInternalId -> optionMeetingInfo.get)
        }
      case m: MeetingEndingEvtMsg => meetingInfoMap -= m.body.meetingId
      case _                      => // ignore
    }
  }
}