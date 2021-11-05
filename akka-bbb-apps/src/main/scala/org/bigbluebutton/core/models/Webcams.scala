package org.bigbluebutton.core.models

object Webcams {
  def findWithStreamId(webcams: Webcams, streamId: String): Option[WebcamStream] = {
    webcams.toVector.find(w => w.stream.id == streamId)
  }

  def findWebcamsForUser(webcams: Webcams, userId: String): Vector[WebcamStream] = {
    webcams.toVector.filter(w => w.stream.userId == userId)
  }

  def findAll(webcams: Webcams): Vector[WebcamStream] = webcams.toVector

  def addWebcamBroadcastStream(webcams: Webcams, webcamStream: WebcamStream): Option[WebcamStream] = {

    findWithStreamId(webcams, webcamStream.streamId) match {
      case Some(p) => {
        None
      }
      case None => {
        webcams.save(webcamStream)
        Some(webcamStream)
      }
    }
  }

  def removeWebcamBroadcastStream(webcams: Webcams, streamId: String): Option[WebcamStream] = {
    for {
      stream <- findWithStreamId(webcams, streamId)
      removedStream <- webcams.remove(streamId)
    } yield removedStream
  }

  def updateWebcamStream(webcams: Webcams, streamId: String, userId: String): Option[WebcamStream] = {
    findWithStreamId(webcams, streamId) match {
      case Some(value) => {
        val mediaStream: MediaStream = MediaStream(value.stream.id, value.stream.url, userId, value.stream.attributes,
          value.stream.viewers)
        val webcamStream: WebcamStream = WebcamStream(streamId, mediaStream)
        webcams.update(streamId, webcamStream)
        Some(webcamStream)
      }
      case None => {
        None
      }
    }
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

  private def update(streamId: String, webcamStream: WebcamStream): WebcamStream = {
    val webcam = remove(streamId)

    save(webcamStream)
  }
}

case class WebcamStream(streamId: String, stream: MediaStream)
