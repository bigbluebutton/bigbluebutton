package org.bigbluebutton.transcode.core

import akka.actor._
import akka.actor.ActorLogging
import scala.collection.mutable.HashMap
import org.bigbluebutton.endpoint.redis.RedisPublisher
import org.bigbluebutton.transcode.api._
import org.bigbluebutton.SystemConfiguration
import scala.collection._
import scala.collection.JavaConversions._
import org.bigbluebutton.common.messages.Constants
import org.bigbluebutton.transcode.core.apps.{ TranscodingObserverApp }

object TranscodingActor extends SystemConfiguration {
  def props(system: ActorSystem, messageSender: RedisPublisher): Props =
    Props(classOf[TranscodingActor], system, messageSender)
}

class TranscodingActor(val system: ActorSystem, messageSender: RedisPublisher)
    extends Actor with ActorLogging with TranscodingObserverApp {
  val transcodersModel = new TranscodersModel()

  val messageSenderActor = context.actorOf(MessageSenderActor.props(messageSender), "bbb-sender-actor")

  def receive = {
    case msg: StartTranscoderRequest => handleStartTranscoderRequest(msg)
    case msg: UpdateTranscoderRequest => handleUpdateTranscoderRequest(msg)
    case msg: StopTranscoderRequest => handleStopTranscoderRequest(msg)
    case msg: StartProbingRequest => handleStartProbingRequest(msg)

    //internal messages
    case msg: StartVideoTranscoderReply => handleStartVideoTranscoderReply(msg)
    case msg: UpdateVideoTranscoderReply => handleUpdateVideoTranscoderReply(msg)
    case msg: DestroyVideoTranscoderReply => handleDestroyVideoTranscoderReply(msg)
    case msg: TranscodingFinishedUnsuccessfully => handleTranscodingFinishedUnsuccessfully(msg)
    case msg: TranscodingFinishedSuccessfully => handleTranscodingFinishedSuccessfully(msg)
    case msg: RestartVideoTranscoderReply => handleRestartVideoTranscoderReply(msg)
    case msg: StartVideoProbingReply => handleStartVideoProbingReply(msg)
    case _ => // do nothing
  }

  private def handleStartTranscoderRequest(msg: StartTranscoderRequest) {
    log.info("\n  > Received StartTranscoderRequest. Params:\n"
      + "    meetingId = " + msg.meetingId + "\n"
      + "    transcoderId = " + msg.transcoderId + "\n"
      + "    params = " + msg.params.toString() + "\n")

    transcodersModel.getTranscoder(msg.transcoderId) match {
      case Some(vt) => {
        log.info("\n   > Found a transcoder for this user {}", msg.transcoderId)
        vt ! new StartVideoTranscoderRequest()
      }
      case None => {
        val vt = context.actorOf(VideoTranscoder.props(self, msg.meetingId, msg.transcoderId, msg.params))
        transcodersModel.addTranscoder(msg.transcoderId, vt)
        vt ! new StartVideoTranscoderRequest()
      }
    }
  }

  private def handleUpdateTranscoderRequest(msg: UpdateTranscoderRequest) {
    log.info("\n  > Received UpdateTranscoderRequest. Params:\n"
      + "    meetingId = " + msg.meetingId + "\n"
      + "    transcoderId = " + msg.transcoderId + "\n"
      + "    params = " + msg.params.toString() + "\n")

    transcodersModel.getTranscoder(msg.transcoderId) match {
      case Some(vt) => vt ! new UpdateVideoTranscoderRequest(msg.params)
      case None =>
        log.info("\n  > Video transcoder with id = {} not found (might be finished already or it is restarting).", msg.transcoderId)
    }
  }

  private def handleStopTranscoderRequest(msg: StopTranscoderRequest) {
    log.info("\n  > Received StopTranscoderRequest. Params:\n"
      + "    meetingId = " + msg.meetingId + "\n"
      + "    transcoderId = " + msg.transcoderId + "\n")
    transcodersModel.getTranscoder(msg.transcoderId) match {
      case Some(vt) => {
        transcodersModel.removeTranscoder(msg.transcoderId)
        vt ! new DestroyVideoTranscoderRequest() //stop transcoder and destroy it's actor
      }
      case None => {
        log.info("\n  > Transcoder with id = {} not found (might be finished already).", msg.transcoderId)
      }
    }
  }

  private def handleStartProbingRequest(msg: StartProbingRequest) {
    log.info("\n  > Received StartProbingRequest. Params:\n"
      + "    meetingId = " + msg.meetingId + "\n"
      + "    transcoderId = " + msg.transcoderId + "\n")
    transcodersModel.getTranscoder(msg.transcoderId) match {
      case Some(vt) => {
        log.info("\n   > Found a transcoder for this user {}", msg.transcoderId)
        vt ! new StartVideoProbingRequest()
      }
      case None => {
        val vt = context.actorOf(VideoTranscoder.props(self, msg.meetingId, msg.transcoderId, msg.params))
        transcodersModel.addTranscoder(msg.transcoderId, vt)
        vt ! new StartVideoProbingRequest()
      }
    }
  }

}
