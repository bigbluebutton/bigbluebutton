package org.bigbluebutton.api2.bus

import java.io.{ PrintWriter, StringWriter }

import akka.actor.SupervisorStrategy.Resume
import akka.actor.{ Actor, ActorLogging, OneForOneStrategy, Props }
import org.bigbluebutton.common2.redis.MessageSender
import scala.concurrent.duration._

object MessageSenderActor {
  def props(msgSender: MessageSender): Props = Props(classOf[MessageSenderActor], msgSender)
}

class MessageSenderActor(msgSender: MessageSender) extends Actor with ActorLogging {

  override val supervisorStrategy = OneForOneStrategy(maxNrOfRetries = 10, withinTimeRange = 1 minute) {
    case e: Exception => {
      val sw: StringWriter = new StringWriter()
      sw.write("An exception has been thrown on MessageSenderActor, exception message [" + e.getMessage() + "] (full stacktrace below)\n")
      e.printStackTrace(new PrintWriter(sw))
      log.error(sw.toString())
      Resume
    }
  }

  def receive = {
    case msg: JsonMsgToSendToAkkaApps => msgSender.send(msg.channel, msg.json)
  }

}
