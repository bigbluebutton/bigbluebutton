package org.bigbluebutton

import akka.actor.ActorSystem
import org.bigbluebutton.vertx.HelloWorld
import io.vertx.core.Vertx
import org.bigbluebutton.client.{ ClientGWApplication, MsgToClientGW }
import org.bigbluebutton.client.bus.InternalMessageBus
import org.bigbluebutton.vertx.AkkaToVertxGateway
import org.bigbluebutton.vertx.VertxToAkkaBus

object Boot extends App with SystemConfiguration {

  implicit val system = ActorSystem("vertx-akka-system")

  val vertx = Vertx.vertx()

  val vertxGW = new AkkaToVertxGateway(vertx)

  val echoActor = system.actorOf(EchoService.props(vertxGW, vertx), "echo-actor")
  val authActor = system.actorOf(AuthService.props(vertxGW), "auth-actor")

  val akkaGW = new VertxToAkkaGateway(system, vertx, authActor, echoActor)
  val vertxToAkkaBus = new VertxToAkkaBus(vertx, akkaGW)
  val connEventBus = new InternalMessageBus
  val connectionManager = new ConnectionManager(system, vertx, connEventBus)

  val msgToClientGW = new MsgToClientGW
  val clientGW = new ClientGWApplication(system, msgToClientGW, connEventBus)

  val hello = new HelloWorld(vertx, akkaGW, connectionManager)
  hello.startup()

}
