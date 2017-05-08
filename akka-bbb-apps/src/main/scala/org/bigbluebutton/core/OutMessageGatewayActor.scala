package org.bigbluebutton.core

import akka.actor.Actor
import akka.actor.ActorLogging
import akka.actor.Props
import akka.actor.OneForOneStrategy
import akka.actor.SupervisorStrategy.Resume
import java.io.{ PrintWriter, StringWriter }
import org.bigbluebutton.core.api._
import scala.concurrent.duration._
import org.bigbluebutton.core.service.recorder.RecorderApplication

object OutMessageGatewayActor {
  def props(meetingId: String, recorder: RecorderApplication, sender: MessageSender): Props =
    Props(classOf[OutMessageGatewayActor], meetingId, recorder, sender)
}

class OutMessageGatewayActor(val meetingId: String, val recorder: RecorderApplication, val msgSender: MessageSender)
    extends Actor with ActorLogging {

  private val recorderActor = context.actorOf(RecorderActor.props(recorder), "recorderActor-" + meetingId)
  private val msgSenderActor = context.actorOf(MessageSenderActor.props(msgSender), "senderActor-" + meetingId)

  override val supervisorStrategy = OneForOneStrategy(maxNrOfRetries = 10, withinTimeRange = 1 minute) {
    case e: Exception => {
      val sw: StringWriter = new StringWriter()
      sw.write("An exception has been thrown on OutMessageGatewayActor, exception message [" + e.getMessage() + "] (full stacktrace below)\n")
      e.printStackTrace(new PrintWriter(sw))
      log.error(sw.toString())
      Resume
    }
  }

  def receive = {
    case msg: IOutMessage => {
      msgSenderActor forward msg
      recorderActor forward msg
    }
    case _ => // do nothing
  }

}