package org.bigbluebutton.transcode.core.apps

import akka.actor.ActorRef
import org.bigbluebutton.transcode.core.TranscodingActor
import org.bigbluebutton.transcode.api._
import org.bigbluebutton.transcode.util.Constants
import org.bigbluebutton.transcode.core.ffmpeg.FFmpegConstants
import scala.collection.JavaConversions._

trait TranscodingObserverApp {

  this: TranscodingActor =>

  val messageSenderActor: ActorRef

  def handleTranscodingFinishedUnsuccessfully(msg: TranscodingFinishedUnsuccessfully) = {
    transcodersModel.getTranscoder(msg.getMeetingId(), msg.getTranscoderId()) match {
      case Some(vt) => {
        log.info("\n   > Transcoder for this user {} stopped unsuccessfully, restarting it...", msg.getTranscoderId())
        vt ! new RestartVideoTranscoderRequest()
      }
      case None => {
        log.info("\n  > Video transcoder with id = {} not found (might be destroyed already).", msg.getTranscoderId())
      }
    }
  }

  def handleTranscodingFinishedSuccessfully(msg: TranscodingFinishedSuccessfully) = {
    transcodersModel.getTranscoder(msg.getMeetingId(), msg.getTranscoderId()) match {
      case Some(vt) => {
        log.info("\n   > Transcoder for this user {} stopped with success, removing it from transcoder's list...", msg.getTranscoderId())
        transcodersModel.removeTranscoder(msg.getMeetingId(), msg.getTranscoderId())
      }
      case None => {
        log.info("\n  > Video transcoder with id = {} not found (might be destroyed already).", msg.getTranscoderId())
      }
    }
  }

  def handleStartVideoTranscoderReply(msg: StartVideoTranscoderReply) = {
    log.info("\n  > Transcoder with id = {} started", msg.getTranscoderId())
    val params = new scala.collection.mutable.HashMap[String, String]
    params += Constants.OUTPUT -> msg.getOutput()
    messageSenderActor ! new StartTranscoderReply(msg.getMeetingId(), msg.getTranscoderId(), params.toMap)
  }

  def handleUpdateVideoTranscoderReply(msg: UpdateVideoTranscoderReply) = {
    log.info("\n  > Transcoder with id = {} updated", msg.getTranscoderId())
    val params = new scala.collection.mutable.HashMap[String, String]
    params += Constants.OUTPUT -> msg.getOutput()
    messageSenderActor ! new UpdateTranscoderReply(msg.getMeetingId(), msg.getTranscoderId(), params.toMap)
  }

  def handleDestroyVideoTranscoderReply(msg: DestroyVideoTranscoderReply) = {
    log.info("\n  > Transcoder with id = {} stopped", msg.getTranscoderId())
    messageSenderActor ! new StopTranscoderReply(msg.getMeetingId(), msg.getTranscoderId())
  }

  def handleRestartVideoTranscoderReply(msg: RestartVideoTranscoderReply) = {
    log.info("\n  > Transcoder with id = {} restarted", msg.getTranscoderId())
    val params = new scala.collection.mutable.HashMap[String, String]
    params += Constants.OUTPUT -> msg.getOutput()
    messageSenderActor ! new TranscoderStatusUpdate(msg.getMeetingId(), msg.getTranscoderId(), params.toMap)
  }

  def handleStartVideoProbingReply(msg: StartVideoProbingReply) = {
    val ffprobeResult = mapAsScalaMap(msg.getProbingData())
    Option(ffprobeResult) match {
      case Some(result) =>
        val params = new scala.collection.mutable.HashMap[String, String]
        params += Constants.WIDTH_RATIO -> result.getOrElse(FFmpegConstants.WIDTH, "")
        params += Constants.HEIGHT_RATIO -> result.getOrElse(FFmpegConstants.HEIGHT, "")
        messageSenderActor ! new StartProbingReply(msg.getMeetingId(), msg.getTranscoderId(), params.toMap)
      case _ => log.debug("Could not send ffprobe reply : failed to get the new resolution");
    }
  }

}
