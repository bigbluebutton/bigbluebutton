package org.bigbluebutton.core.models

object Webcams {
  def findWithStreamId(webcams: Webcams, streamId: String): Option[WebcamStream] = {
    webcams.toVector.find(w => w.stream.id == streamId)
  }

  def findWebcamsForUser(webcams: Webcams, userId: String): Vector[WebcamStream] = {
    webcams.toVector.filter(w => w.userId == userId)
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

case class WebcamStream(userId: String, stream: Stream)
