package org.bigbluebutton.transcode.core

import akka.actor._
import akka.actor.ActorLogging
import org.bigbluebutton.transcode.api._
import org.bigbluebutton.SystemConfiguration
import org.bigbluebutton.transcode.core.apps.TranscodingObserverApp
import org.bigbluebutton.common2.redis.MessageSender

object TranscodingActor extends SystemConfiguration {
  def props(system: ActorSystem, messageSender: MessageSender): Props =
    Props(classOf[TranscodingActor], system, messageSender)
}

class TranscodingActor(val system: ActorSystem, messageSender: MessageSender)
  extends Actor with ActorLogging with TranscodingObserverApp {
  val transcodersModel = new TranscodersModel()

  val messageSenderActor = context.actorOf(MessageSenderActor.props(messageSender), "bbb-sender-actor")

  def receive = {
    case msg: StartTranscoderRequest            => handleStartTranscoderRequest(msg)
    case msg: UpdateTranscoderRequest           => handleUpdateTranscoderRequest(msg)
    case msg: StopTranscoderRequest             => handleStopTranscoderRequest(msg)
    case msg: StopMeetingTranscoders            => handleStopMeetingTranscoders(msg)
    case msg: StartProbingRequest               => handleStartProbingRequest(msg)

    //internal messages
    case msg: StartVideoTranscoderReply         => handleStartVideoTranscoderReply(msg)
    case msg: UpdateVideoTranscoderReply        => handleUpdateVideoTranscoderReply(msg)
    case msg: DestroyVideoTranscoderReply       => handleDestroyVideoTranscoderReply(msg)
    case msg: TranscodingFinishedUnsuccessfully => handleTranscodingFinishedUnsuccessfully(msg)
    case msg: TranscodingFinishedSuccessfully   => handleTranscodingFinishedSuccessfully(msg)
    case msg: RestartVideoTranscoderReply       => handleRestartVideoTranscoderReply(msg)
    case msg: StartVideoProbingReply            => handleStartVideoProbingReply(msg)
    case _                                      => // do nothing
  }

  private def handleStartTranscoderRequest(msg: StartTranscoderRequest) {
    log.info("\n  > Received StartTranscoderRequest. Params:\n"
      + "    meetingId = " + msg.meetingId + "\n"
      + "    transcoderId = " + msg.transcoderId + "\n"
      + "    params = " + msg.params.toString() + "\n")

    transcodersModel.getTranscoder(msg.meetingId, msg.transcoderId) match {
      case Some(vt) => {
        log.info("\n   > Found a transcoder for this user {}", msg.transcoderId)
        vt ! new StartVideoTranscoderRequest()
      }
      case None => {
        val vt = context.actorOf(VideoTranscoder.props(self, msg.meetingId, msg.transcoderId, msg.params))
        transcodersModel.addTranscoder(msg.meetingId, msg.transcoderId, vt)
        vt ! new StartVideoTranscoderRequest()
      }
    }
  }

  private def handleUpdateTranscoderRequest(msg: UpdateTranscoderRequest) {
    log.info("\n  > Received UpdateTranscoderRequest. Params:\n"
      + "    meetingId = " + msg.meetingId + "\n"
      + "    transcoderId = " + msg.transcoderId + "\n"
      + "    params = " + msg.params.toString() + "\n")

    transcodersModel.getTranscoder(msg.meetingId, msg.transcoderId) match {
      case Some(vt) => vt ! new UpdateVideoTranscoderRequest(msg.params)
      case None =>
        log.info("\n  > Video transcoder with id = {} not found (might be finished already or it is restarting).", msg.transcoderId)
    }
  }

  private def handleStopTranscoderRequest(msg: StopTranscoderRequest) {
    log.info("\n  > Received StopTranscoderRequest. Params:\n"
      + "    meetingId = " + msg.meetingId + "\n"
      + "    transcoderId = " + msg.transcoderId + "\n")
    transcodersModel.getTranscoder(msg.meetingId, msg.transcoderId) match {
      case Some(vt) => {
        transcodersModel.removeTranscoder(msg.meetingId, msg.transcoderId)
        vt ! new DestroyVideoTranscoderRequest() //stop transcoder and destroy it's actor
      }
      case None => {
        log.info("\n  > Transcoder with id = {} not found (might be finished already).", msg.transcoderId)
      }
    }
  }

  private def handleStopMeetingTranscoders(msg: StopMeetingTranscoders) {
    log.info("\n  > Received StopMeetingTranscoders. Params:\n"
      + "    meetingId = " + msg.meetingId + "\n")

    transcodersModel.getTranscoders(msg.meetingId) foreach {
      vt => vt ! new DestroyVideoTranscoderRequest()
    }
  }

  private def handleStartProbingRequest(msg: StartProbingRequest) {
    log.info("\n  > Received StartProbingRequest. Params:\n"
      + "    meetingId = " + msg.meetingId + "\n"
      + "    transcoderId = " + msg.transcoderId + "\n")
    transcodersModel.getTranscoder(msg.meetingId, msg.transcoderId) match {
      case Some(vt) => {
        log.info("\n   > Found a transcoder for this user {}", msg.transcoderId)
        vt ! new StartVideoProbingRequest()
      }
      case None => {
        val vt = context.actorOf(VideoTranscoder.props(self, msg.meetingId, msg.transcoderId, msg.params))
        transcodersModel.addTranscoder(msg.meetingId, msg.transcoderId, vt)
        vt ! new StartVideoProbingRequest()
      }
    }
  }

}
