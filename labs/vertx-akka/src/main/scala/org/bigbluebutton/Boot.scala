package org.bigbluebutton

import akka.actor.{ ActorSystem, Props }
import scala.concurrent.duration._
import scala.concurrent.{ Future, Await }
import scala.concurrent.ExecutionContext.Implicits.global
import org.bigbluebutton.vertx.HelloWorld
import io.vertx.core.Vertx
import org.bigbluebutton.vertx.AkkaToVertxGateway
import org.bigbluebutton.vertx.IVertxToAkkaGateway
import org.bigbluebutton.vertx.VertxToAkkaBus

object Boot extends App with SystemConfiguration {

  implicit val system = ActorSystem("vertx-akka-system")

  val vertx = Vertx.vertx()

  val vertxGW = new AkkaToVertxGateway(vertx)

  val echoActor = system.actorOf(EchoService.props(vertxGW, vertx), "echo-actor")
  val authActor = system.actorOf(AuthService.props(vertxGW), "auth-actor")

  val akkaGW = new VertxToAkkaGateway(system, vertx, authActor, echoActor)
  val vertxToAkkaBus = new VertxToAkkaBus(vertx, akkaGW)
  val connectionManager = new ConnectionManager(system, vertx)

  val hello = new HelloWorld(vertx, akkaGW, connectionManager);
  hello.startup()

}
