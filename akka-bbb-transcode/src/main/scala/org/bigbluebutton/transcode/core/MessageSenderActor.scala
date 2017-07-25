package org.bigbluebutton.transcode.core

import akka.actor.Actor
import akka.actor.ActorContext
import akka.actor.ActorLogging
import akka.actor.Props
import org.bigbluebutton.transcode.api._
import org.bigbluebutton.endpoint.redis.RedisPublisher

import collection.JavaConverters._
import scala.collection.JavaConversions._

import org.bigbluebutton.common.messages.StartTranscoderReplyMessage
import org.bigbluebutton.common.messages.StopTranscoderReplyMessage
import org.bigbluebutton.common.messages.TranscoderStatusUpdateMessage
import org.bigbluebutton.common.messages.UpdateTranscoderReplyMessage
import org.bigbluebutton.common.messages.StartProbingReplyMessage
import org.bigbluebutton.common.messages.MessagingConstants

object MessageSenderActor {
  def props(msgSender: RedisPublisher): Props =
    Props(classOf[MessageSenderActor], msgSender)
}

class MessageSenderActor(val msgSender: RedisPublisher)
    extends Actor with ActorLogging {

  def receive = {
    case msg: StartTranscoderReply => handleStartTranscoderReply(msg)
    case msg: StopTranscoderReply => handleStopTranscoderReply(msg)
    case msg: UpdateTranscoderReply => handleUpdateTranscoderReply(msg)
    case msg: TranscoderStatusUpdate => handleTranscoderStatusUpdate(msg)
    case msg: StartProbingReply => handleStartProbingReply(msg)
    case _ => // do nothing
  }

  private def handleStartTranscoderReply(msg: StartTranscoderReply) {
    System.out.println("Sending StartTranscoderReplyMessage. Params: [\n"
      + "meetingId = " + msg.meetingId + "\n"
      + "transcoderId = " + msg.transcoderId + "\n"
      + "params = " + msg.params.mkString(", ") + "\n]\n")

    val str = new StartTranscoderReplyMessage(msg.meetingId, msg.transcoderId, msg.params)
    msgSender.publish(MessagingConstants.FROM_BBB_TRANSCODE_SYSTEM_CHAN, str.toJson())
  }

  private def handleStopTranscoderReply(msg: StopTranscoderReply) {
    System.out.println("Sending StopTranscoderReplyMessage. Params: [\n"
      + "meetingId = " + msg.meetingId + "\n"
      + "transcoderId = " + msg.transcoderId + "\n]\n")
    val str = new StopTranscoderReplyMessage(msg.meetingId, msg.transcoderId)
    msgSender.publish(MessagingConstants.FROM_BBB_TRANSCODE_SYSTEM_CHAN, str.toJson())
  }

  private def handleUpdateTranscoderReply(msg: UpdateTranscoderReply) {
    System.out.println("Sending UpdateTranscoderReplyMessage. Params: [\n"
      + "meetingId = " + msg.meetingId + "\n"
      + "transcoderId = " + msg.transcoderId + "\n"
      + "params = " + msg.params.mkString(", ") + "\n]\n")

    val str = new UpdateTranscoderReplyMessage(msg.meetingId, msg.transcoderId, msg.params)
    msgSender.publish(MessagingConstants.FROM_BBB_TRANSCODE_SYSTEM_CHAN, str.toJson())
  }

  private def handleTranscoderStatusUpdate(msg: TranscoderStatusUpdate) {
    System.out.println("Sending TranscoderStatusUpdateMessage. Params: [\n"
      + "meetingId = " + msg.meetingId + "\n"
      + "transcoderId = " + msg.transcoderId + "\n"
      + "params = " + msg.params.mkString(", ") + "\n]\n")

    val str = new TranscoderStatusUpdateMessage(msg.meetingId, msg.transcoderId, msg.params)
    msgSender.publish(MessagingConstants.FROM_BBB_TRANSCODE_SYSTEM_CHAN, str.toJson())
  }

  private def handleStartProbingReply(msg: StartProbingReply) {
    System.out.println("Sending StartProbingReplyMessage. Params: [\n"
      + "meetingId = " + msg.meetingId + "\n"
      + "transcoderId = " + msg.transcoderId + "\n"
      + "params = " + msg.params.mkString(", ") + "\n]\n")
    val str = new TranscoderStatusUpdateMessage(msg.meetingId, msg.transcoderId, msg.params)
    msgSender.publish(MessagingConstants.FROM_BBB_TRANSCODE_SYSTEM_CHAN, str.toJson())
  }

}
