package org.bigbluebutton.transcode.core

import akka.actor.ActorSystem

import org.bigbluebutton.endpoint.redis.RedisPublisher
import org.bigbluebutton.transcode.api._

class TranscodingInGW(val system: ActorSystem, messageSender: RedisPublisher) {
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

  def stopMeetingTranscoders(meetingId: String) {
    transcodingActor ! new StopMeetingTranscoders(meetingId)
  }

  def startProbing(meetingId: String, transcoderId: String, params: java.util.Map[String, String]) {
    transcodingActor ! new StartProbingRequest(meetingId, transcoderId, params)
  }
}