package org.bigbluebutton.service

import akka.actor.{ Actor, ActorLogging, ActorRef, ActorSystem, Props }
import akka.pattern.ask
import akka.pattern.AskTimeoutException
import akka.util.Timeout
import org.bigbluebutton.MeetingInfoAnalytics
import org.bigbluebutton.common2.msgs.{ BbbCommonEnvCoreMsg, MeetingInfoAnalyticsServiceMsg }

import scala.concurrent.duration.DurationInt
import scala.concurrent.{ ExecutionContextExecutor, Future }

sealed trait MeetingInfoMessage

case object GetMeetingInfoMessage extends MeetingInfoMessage
case class MeetingInfoResponseMsg(optionMeetingInfoAnalytics: Option[MeetingInfoAnalytics]) extends MeetingInfoMessage

object MeetingInfoService {
  def apply(system: ActorSystem, meetingInfoActor: ActorRef) = new MeetingInfoService(system, meetingInfoActor)
}

class MeetingInfoService(system: ActorSystem, meetingInfoActor: ActorRef) {
  implicit def executionContext: ExecutionContextExecutor = system.dispatcher
  implicit val timeout: Timeout = 2 seconds

  def getAnalytics(): Future[MeetingInfoResponseMsg] = {
    val future = meetingInfoActor.ask(GetMeetingInfoMessage).mapTo[MeetingInfoResponseMsg]

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

  override def receive: Receive = {
    case msg: BbbCommonEnvCoreMsg => handle(msg)
    case GetMeetingInfoMessage =>
      sender ! MeetingInfoResponseMsg(optionMeetingInfo)
    case _ => // ignore other messages
  }

  def handle(msg: BbbCommonEnvCoreMsg): Unit = {
    msg.core match {
      case m: MeetingInfoAnalyticsServiceMsg => {
        optionMeetingInfo = Option.apply(MeetingInfoAnalytics(m.body.meetingInfo.name, m.body.meetingInfo.externalId,
          m.body.meetingInfo.internalId, m.body.meetingInfo.hasUserJoined, m.body.meetingInfo.isMeetingRecorded, m.body.meetingInfo.webcams,
          m.body.meetingInfo.audio, m.body.meetingInfo.screenshare, m.body.meetingInfo.users, m.body.meetingInfo.presentation,
          m.body.meetingInfo.breakoutRoom))
      }
      case _ => // ignore
    }
  }
}