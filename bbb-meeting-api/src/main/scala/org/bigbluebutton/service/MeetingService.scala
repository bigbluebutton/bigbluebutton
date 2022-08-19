package org.bigbluebutton.service
import akka.actor.{ActorSystem, Props}
import akka.pattern.ask
import akka.pattern.AskTimeoutException
import akka.util.Timeout
import com.typesafe.config.{Config, ConfigFactory}
import org.bigbluebutton.common2.api.{ApiResponse, ApiResponseFailure, CreateMeetingApiMsg, EndMeetingApiMsg, GetUserApiMsg, RegisterUser, RegisterUserApiMsg}

import org.bigbluebutton.common2.domain.DefaultProps

import scala.language.postfixOps
import scala.concurrent.duration.DurationInt
import scala.concurrent.{Await, ExecutionContextExecutor, Future}

object MeetingService {
  val configRemote: Config = ConfigFactory.load().getConfig("bbbAkkaApps")
  val system = ActorSystem("bbb-meeting-api-remote-actor" , configRemote)
  val bbbAkkaAppsActor = system.actorSelection("akka://bigbluebutton-apps-system@127.0.0.1:2552/user/bigbluebutton-actor")

  implicit def executionContext: ExecutionContextExecutor = MeetingService.system.dispatcher
  implicit val timeout: Timeout = 2 seconds

  bbbAkkaAppsActor.resolveOne().map({
    actorRef => println(s"Communication with BBBAkkaApps established! $actorRef")
  })
  

  def createMeeting(defaultprops: DefaultProps): Future[ApiResponse] = {
    val future = MeetingService.bbbAkkaAppsActor.ask(CreateMeetingApiMsg(defaultprops)).mapTo[ApiResponse]
    future.recover {
      case e: AskTimeoutException => ApiResponseFailure("Request Timeout error")
    }
  }

  def endMeeting(meetingID: String): Future[ApiResponse] = {
    val future = MeetingService.bbbAkkaAppsActor.ask(EndMeetingApiMsg(meetingID)).mapTo[ApiResponse]

    future.recover {
      case e: AskTimeoutException => ApiResponseFailure("Request Timeout error")
    }
  }

  def registerUser(regUser: RegisterUser) = {
    val future = MeetingService.bbbAkkaAppsActor.ask(RegisterUserApiMsg(regUser)).mapTo[ApiResponse]

    future.recover {
      case e: AskTimeoutException => ApiResponseFailure("Request Timeout error")
    }
  }

  def findUser(meetingId: String, userIntId: String) = {
    val future = MeetingService.bbbAkkaAppsActor.ask(GetUserApiMsg(meetingId, userIntId)).mapTo[ApiResponse]

    future.recover {
      case e: AskTimeoutException => ApiResponseFailure("Request Timeout error")
    }
  }

}