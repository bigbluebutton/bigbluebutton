package org.bigbluebutton.core.models

import org.bigbluebutton.core.models.Users.findWithId

object Webcams {
  def findWithStreamId(webcams: Webcams, streamId: String): Option[WebcamStream] = {
    webcams.toVector.find(w => w.stream.id == streamId)
  }

  def findWebcamsForUser(webcams: Webcams, userId: String): Vector[WebcamStream] = {
    webcams.toVector.filter(w => w.stream.userId == userId)
  }

  def userSharedWebcam(userId: String, webcams: Webcams, streamId: String): Option[UserVO] = {
    /*
    for {
      u <- findWithId(userId, users)
      streams = u.webcamStreams + streamId
      uvo = u.modify(_.hasStream).setTo(true).modify(_.webcamStreams).setTo(streams)
    } yield {
      users.save(uvo)
      uvo
    }
    */
    None
  }

  def userUnsharedWebcam(userId: String, webcams: Webcams, streamId: String): Option[UserVO] = {
    /*
    def findWebcamStream(streams: Set[String], stream: String): Option[String] = {
      streams find (w => w == stream)
    }

    for {
      u <- findWebcamsForUser(webcams, userId)
      streamName <- findWebcamStream(u.stream, streamId)
      streams = u.webcamStreams - streamName
      uvo = u.modify(_.hasStream).setTo(!streams.isEmpty).modify(_.webcamStreams).setTo(streams)
    } yield {
      users.save(uvo)
      uvo
    }
    */
    None
  }
}

class Webcams {
  private var webcams: collection.immutable.HashMap[String, WebcamStream] = new collection.immutable.HashMap[String, WebcamStream]

  private def toVector: Vector[WebcamStream] = webcams.values.toVector

  private def save(webcam: WebcamStream): WebcamStream = {
    webcams += webcam.stream.id -> webcam
    webcam
  }

  private def remove(streamId: String): Option[WebcamStream] = {
    val webcam = webcams.get(streamId)
    webcam foreach (u => webcams -= streamId)
    webcam
  }
}

case class WebcamStream(streamId: String, stream: Stream)
