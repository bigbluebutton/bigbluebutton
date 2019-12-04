package org.bigbluebutton.app.screenshare.redis

import com.fasterxml.jackson.databind.JsonNode
import org.bigbluebutton.app.screenshare.server.sessions.messages.{ MeetingCreated, MeetingEnded, RecordingChapterBreak }
import akka.actor.{ Actor, ActorLogging, ActorRef, Props }

import scala.reflect.runtime.universe._
import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.common2.bus.ReceivedJsonMessage

object ReceivedJsonMsgHandlerActor {
  def props(screenshareManager: ActorRef): Props =
    Props(classOf[ReceivedJsonMsgHandlerActor], screenshareManager)
}

class ReceivedJsonMsgHandlerActor(screenshareManager: ActorRef)
  extends Actor with ActorLogging {

  object JsonDeserializer extends Deserializer

  def receive = {
    case msg: ReceivedJsonMessage =>
      //log.debug("handling {} - {}", msg.channel, msg.data)
      handleReceivedJsonMessage(msg)
    case _ => // do nothing
  }

  def handleReceivedJsonMessage(msg: ReceivedJsonMessage): Unit = {
    for {
      envJsonNode <- JsonDeserializer.toBbbCommonEnvJsNodeMsg(msg.data)
    } yield handle(envJsonNode.envelope, envJsonNode.core)
  }

  def deserialize[B <: BbbCoreMsg](jsonNode: JsonNode)(implicit tag: TypeTag[B]): Option[B] = {
    val (result, error) = JsonDeserializer.toBbbCommonMsg[B](jsonNode)

    result match {
      case Some(msg) =>
        Some(msg.asInstanceOf[B])
      case None =>
        log.error("Failed to deserialize message " + error)
        None
    }
  }

  def handle(envelope: BbbCoreEnvelope, jsonNode: JsonNode): Unit = {
    envelope.name match {
      case MeetingCreatedEvtMsg.NAME =>
        for {
          m <- deserialize[MeetingCreatedEvtMsg](jsonNode)
        } yield {
          screenshareManager ! new MeetingCreated(m.body.props.meetingProp.intId, m.body.props.recordProp.record)
        }
      case MeetingDestroyedEvtMsg.NAME =>
        for {
          m <- deserialize[MeetingDestroyedEvtMsg](jsonNode)
        } yield {
          screenshareManager ! new MeetingEnded(m.body.meetingId)
        }
      case RecordingChapterBreakSysMsg.NAME =>
        for {
          m <- deserialize[RecordingChapterBreakSysMsg](jsonNode)
        } yield {
          screenshareManager ! new RecordingChapterBreak(m.body.meetingId, m.body.timestamp)
        }
      case _ =>
      // log.error("Cannot route envelope name " + envelope.name)
      // do nothing
    }
  }

}
