package org.bigbluebutton

import akka.actor.TypedActor.context
import akka.actor.{Actor, ActorLogging, ActorSystem, AddressFromURIString, Props}
import akka.pattern.AskTimeoutException
import org.bigbluebutton.common2.domain.DefaultProps
import org.bigbluebutton.common2.msgs.{BbbCommonEnvCoreMsg, MeetingEndingEvtMsg, MeetingInfoAnalyticsServiceMsg}
import akka.pattern.ask
import akka.util.Timeout
import org.bigbluebutton.common2.api.{ApiResponse, ApiResponseFailure, CreateMeetingApiMsg}

import scala.concurrent.duration.DurationInt
import scala.language.postfixOps
//import org.bigbluebutton.AkkaRemoteActor.remoteBbbActor

import scala.concurrent.{Await, ExecutionContextExecutor, Future}
import scala.concurrent.Future

object AkkaRemoteActor {
//  implicit val system = ActorSystem("bbb-meeting-api")

  def props(): Props = Props(classOf[AkkaRemoteActor])

//  val remoteBbbActor = context.actorSelection("akka.tcp://bigbluebutton-apps-system@127.0.1.1:25520/user/bigbluebutton-actor")

  def kkk() = {

  }

}

class AkkaRemoteActor extends Actor with ActorLogging {
  import scala.concurrent.ExecutionContext.Implicits.global

  implicit val timeout: Timeout = 2 seconds

  val selection = context.actorSelection("akka://bigbluebutton-apps-system@127.0.0.1:2552/user/bigbluebutton-actor")

  @throws[Exception](classOf[Exception])
  override def preStart(): Unit = {
//    val remoteActor = context.actorSelection("akka.tcp://bigbluebutton-apps-system@127.0.0.1:2552/user/bigbluebutton-actor")

//    val remoteActor = context.actorSelection("akka.tcp://RemoteSystem@127.0.0.1:5150/user/remote")
//    import akka.actor.ActorSystem
//    import com.typesafe.config.ConfigFactory
//    val system = ActorSystem.create("local", ConfigFactory.load("application.conf"))

//    val address = AddressFromURIString("akka.tcp://RemoteSystem@192.168.1.2:25527/user/remote")

//    val remoteActor = context.actorSelection("akka://RemoteSystem@192.168.1.2:25527/user/remote")





//    for (res <- context.actorSelection("akka://RemoteSystem@192.168.1.2:25527/user/remote").resolveOne()) {
//      println(res)
//    }

    selection.resolveOne().map({
      actorRef => println(s"Conexão estabelecida com sucesso com $actorRef")
    })

    println("That 's remote:" + selection)
    selection ! "hi"

//    import akka.actor.ActorRef
//    remoteActor.tell("trying to connect...", ActorRef.noSender)

  }



  override def receive: Receive = {
    case msg: BbbCommonEnvCoreMsg => handle(msg)
    case "sendBla" => selection ! "outra coisa"
    case m:String => {
      println(s"RECEBI ALGO EIN......$m")
//      sender() ! "kkkkk"
    }
    case _ => println("RECEBI ALGO EIN......")
//    case _ => // ignore other messages
  }

  def handle(msg: BbbCommonEnvCoreMsg): Unit = {
    msg.core match {
      case m: MeetingInfoAnalyticsServiceMsg =>println("Received MeetingInfoAnalyticsServiceMsg")
      case m: MeetingEndingEvtMsg => println("Received MeetingEndingEvtMsg")
      case _                      => // ignore
    }
  }

  def createMeeting(defaultprops: DefaultProps): Future[ApiResponse] = {
    val future = selection.ask(CreateMeetingApiMsg(defaultprops)).mapTo[ApiResponse]
    future.recover {
      case e: AskTimeoutException => ApiResponseFailure("Request Timeout error")
    }
  }

//  def test() = {
//    println("That 's remote:" + remoteBbbActor)
//    remoteBbbActor ! "hi"
//  }


//  def createMeeting(defaultprops: DefaultProps): Future[ApiResponse] = {
//    val future = remoteBbbActor.ask(CreateMeetingApiMsg(defaultprops)).mapTo[ApiResponse]
//    future.recover {
//      case e: AskTimeoutException => ApiResponseFailure("Request Timeout error")
//    }
//  }

}
