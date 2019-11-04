package org.bigbluebutton

import org.bigbluebutton.vertx.IAkkaToVertxGateway
import akka.pattern.{ ask, pipe }
import akka.util.Timeout
import scala.concurrent.duration._
import scala.util.Success
import scala.util.Failure
import akka.actor.ActorRef
import io.vertx.core.Vertx
import io.vertx.core.eventbus.MessageConsumer
import io.vertx.core.Handler
import io.vertx.core.eventbus.Message
import akka.actor.ActorSystem

class VertxToAkkaGateway(system: ActorSystem, vertx: Vertx,
                         authService: ActorRef,
                         echoService: ActorRef) extends IAkkaToVertxGateway {
  implicit def executionContext = system.dispatcher

  val consumer: MessageConsumer[String] = vertx.eventBus().consumer("foofoofoo")

  def handle(m: Message[String]) = println(m.body())

  consumer.handler(new MyHandler())

  def sendWithReply(json: String, replyChannel: String) {
    val future = authService.ask(json)(5 seconds)

    future onComplete {
      case Success(result) => {
        vertx.eventBus().send("reply-channel", "You can come in.")
      }
      case Failure(failure) => {
        vertx.eventBus().send("reply-channel", "You can NOT come in.")
      }
    }
  }

  def send(json: String) {
    echoService ! json
  }
}

class MyHandler extends Handler[Message[String]] {
  def handle(message: Message[String]) = {
    println("My Handler " + message.body())
  }
}