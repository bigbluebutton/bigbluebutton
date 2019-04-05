package org.bigbluebutton.transcode.core

import akka.actor.Actor
import akka.actor.ActorLogging
import akka.actor.Props
import org.bigbluebutton.transcode.api._
import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.common2.util.JsonUtil
import org.bigbluebutton.common2.redis.MessageSender

object MessageSenderActor {
  def props(msgSender: MessageSender): Props =
    Props(classOf[MessageSenderActor], msgSender)
}

class MessageSenderActor(val msgSender: MessageSender)
  extends Actor with ActorLogging {

  val fromBbbTranscodeRedisChannel = "bigbluebutton:from-bbb-transcode:system"
  val routing = collection.immutable.HashMap("sender" -> "bbb-transcode")

  def receive = {
    case msg: StartTranscoderReply   => handleStartTranscoderReply(msg)
    case msg: StopTranscoderReply    => handleStopTranscoderReply(msg)
    case msg: UpdateTranscoderReply  => handleUpdateTranscoderReply(msg)
    case msg: TranscoderStatusUpdate => handleTranscoderStatusUpdate(msg)
    case msg: StartProbingReply      => handleStartProbingReply(msg)
    case _                           => // do nothing
  }

  private def handleStartTranscoderReply(msg: StartTranscoderReply) {
    System.out.println("Sending StartTranscoderSysRespMsg. Params: [\n"
      + "meetingId = " + msg.meetingId + "\n"
      + "transcoderId = " + msg.transcoderId + "\n"
      + "params = " + msg.params.mkString(", ") + "\n]\n")
    val header = BbbCoreHeaderWithMeetingId(StartTranscoderSysRespMsg.NAME, msg.meetingId)
    val body = StartTranscoderSysRespMsgBody(msg.transcoderId, msg.params)
    val envelope = BbbCoreEnvelope(StartTranscoderSysRespMsg.NAME, routing)
    val evt = new StartTranscoderSysRespMsg(header, body)
    val msgEvent = BbbCommonEnvCoreMsg(envelope, evt)
    val json = JsonUtil.toJson(msgEvent)
    msgSender.send(fromBbbTranscodeRedisChannel, json)
  }

  private def handleStopTranscoderReply(msg: StopTranscoderReply) {
    System.out.println("Sending StopTranscoderSysRespMsg. Params: [\n"
      + "meetingId = " + msg.meetingId + "\n"
      + "transcoderId = " + msg.transcoderId + "\n]\n")
    val header = BbbCoreHeaderWithMeetingId(StopTranscoderSysRespMsg.NAME, msg.meetingId)
    val body = StopTranscoderSysRespMsgBody(msg.transcoderId)
    val envelope = BbbCoreEnvelope(StopTranscoderSysRespMsg.NAME, routing)
    val evt = new StopTranscoderSysRespMsg(header, body)
    val msgEvent = BbbCommonEnvCoreMsg(envelope, evt)
    val json = JsonUtil.toJson(msgEvent)
    msgSender.send(fromBbbTranscodeRedisChannel, json)
  }

  private def handleUpdateTranscoderReply(msg: UpdateTranscoderReply) {
    System.out.println("Sending UpdateTranscoderSysRespMsg. Params: [\n"
      + "meetingId = " + msg.meetingId + "\n"
      + "transcoderId = " + msg.transcoderId + "\n"
      + "params = " + msg.params.mkString(", ") + "\n]\n")
    val header = BbbCoreHeaderWithMeetingId(UpdateTranscoderSysRespMsg.NAME, msg.meetingId)
    val body = UpdateTranscoderSysRespMsgBody(msg.transcoderId, msg.params)
    val envelope = BbbCoreEnvelope(UpdateTranscoderSysRespMsg.NAME, routing)
    val evt = new UpdateTranscoderSysRespMsg(header, body)
    val msgEvent = BbbCommonEnvCoreMsg(envelope, evt)
    val json = JsonUtil.toJson(msgEvent)
    msgSender.send(fromBbbTranscodeRedisChannel, json)
  }

  private def handleStartProbingReply(msg: StartProbingReply) {
    System.out.println("Sending StartProbingSysRespMsg. Params: [\n"
      + "meetingId = " + msg.meetingId + "\n"
      + "transcoderId = " + msg.transcoderId + "\n"
      + "params = " + msg.params.mkString(", ") + "\n]\n")
    val header = BbbCoreHeaderWithMeetingId(StartProbingSysRespMsg.NAME, msg.meetingId)
    val body = StartProbingSysRespMsgBody(msg.transcoderId, msg.params)
    val envelope = BbbCoreEnvelope(StartProbingSysRespMsg.NAME, routing)
    val evt = new StartProbingSysRespMsg(header, body)
    val msgEvent = BbbCommonEnvCoreMsg(envelope, evt)
    val json = JsonUtil.toJson(msgEvent)
    msgSender.send(fromBbbTranscodeRedisChannel, json)
  }

  private def handleTranscoderStatusUpdate(msg: TranscoderStatusUpdate) {
    System.out.println("Sending TranscoderStatusUpdateMessage. Params: [\n"
      + "meetingId = " + msg.meetingId + "\n"
      + "transcoderId = " + msg.transcoderId + "\n"
      + "params = " + msg.params.mkString(", ") + "\n]\n")

    /* TODO: Check if this is really needed
    val str = new TranscoderStatusUpdateMessage(msg.meetingId, msg.transcoderId, msg.params)
    msgSender.publish(MessagingConstants.FROM_BBB_TRANSCODE_SYSTEM_CHAN, str.toJson())*/
  }
}