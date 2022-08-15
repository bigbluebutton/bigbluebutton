package org.bigbluebutton

import org.bigbluebutton.controller.{Create, HelloWorld}
import akka.actor.ActorSystem
import akka.actor.TypedActor.context
import akka.http.scaladsl.server.Route
import akka.http.scaladsl.server.Directives._
import akka.http.scaladsl.Http
import akka.stream.ActorMaterializer
import org.bigbluebutton.service.{MeetingService}

import scala.concurrent.ExecutionContext

object Server {

  //Meeting service
//  implicit val system = ActorSystem("bbb-meeting-api")
//  val meetingActorRef = system.actorOf(MeetingActor.props())
  //outBus2.subscribe(meetingActorRef, outBbbMsgMsgChannel)
  //bbbMsgBus.subscribe(meetingActorRef, analyticsChannel)

//  val remoteBbbActor = context.actorSelection("akka.tcp://bigbluebutton-apps-system@127.0.0.1:5150/user/bigbluebutton-actor")





  val route: Route = pathPrefix("api") {
    HelloWorld.route ~
    Create.route
  }

  def main(args: Array[String]): Unit = {
    implicit val actorSystem: ActorSystem = ActorSystem()
    implicit val executionContext: ExecutionContext = actorSystem.dispatcher
    implicit val actorMaterializer: ActorMaterializer = ActorMaterializer()
    Http().bindAndHandle(route, Settings.Http.host, Settings.Http.port)


    val remoteBbbActor = context.actorSelection("akka.tcp://bigbluebutton-apps-system@127.0.1.1:25520/user/bigbluebutton-actor")
    println("That 's remote:" + remoteBbbActor)
    remoteBbbActor ! "hi"

    //val meetingAPIService = MeetingService(actorSystem, remoteBbbActor)


  }
}
