package org.bigbluebutton.transcode.core

import org.bigbluebutton.transcode.core.api.ITranscodingInGW
import org.bigbluebutton.endpoint.redis.RedisPublisher
import scala.collection.JavaConversions._
import java.util.ArrayList
import scala.collection.mutable.ArrayBuffer
import akka.actor.ActorSystem
import org.bigbluebutton.transcode.api._

class TranscodingInGW(val system: ActorSystem, messageSender: RedisPublisher) extends ITranscodingInGW {
  val log = system.log
  val transcodingActor = system.actorOf(TranscodingActor.props(system, messageSender), "bbb-transcoding-manager")

  def startTranscoder(meetingId: String, transcoderId: String, params: java.util.Map[String, String]) {
    transcodingActor ! new StartTranscoderRequest(meetingId, transcoderId, params)
  }

  def updateTranscoder(meetingId: String, transcoderId: String, params: java.util.Map[String, String]) {
    transcodingActor ! new UpdateTranscoderRequest(meetingId, transcoderId, params)
  }

  def stopTranscoder(meetingId: String, transcoderId: String) {
    transcodingActor ! new StopTranscoderRequest(meetingId, transcoderId)
  }

  def startProbing(meetingId: String, transcoderId: String, params: java.util.Map[String, String]) {
    transcodingActor ! new StartProbingRequest(meetingId, transcoderId, params)
  }

}
