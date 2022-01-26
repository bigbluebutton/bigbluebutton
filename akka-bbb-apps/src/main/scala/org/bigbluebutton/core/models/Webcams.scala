package org.bigbluebutton.core.models

import com.softwaremill.quicklens._

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

  def addViewer(webcams: Webcams, streamId: String, subscriberId: String): Unit = {
    for {
      webcamStream <- findWithStreamId(webcams, streamId)
    } yield {
      val mediaStream = webcamStream.stream
      if (!mediaStream.viewers.contains(subscriberId)) {
        val newViewers = mediaStream.viewers + subscriberId
        webcams.updateViewers(webcamStream, newViewers)
      }
    }
  }

  def removeViewer(webcams: Webcams, streamId: String, subscriberId: String): Unit = {
    for {
      webcamStream <- findWithStreamId(webcams, streamId)
    } yield {
      val mediaStream = webcamStream.stream
      if (mediaStream.viewers.contains(subscriberId)) {
        val newViewers = mediaStream.viewers - subscriberId
        webcams.updateViewers(webcamStream, newViewers)
      }
    }
  }

  def isViewingWebcam(webcams: Webcams, userId: String, streamId: String): Boolean = {
    findWithStreamId(webcams, streamId) match {
      case Some(webcam) => {
        val viewing = webcam.stream.viewers contains userId
        viewing
      }
      case None => {
        false
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

  private def updateViewers(webcamStream: WebcamStream, viewers: Set[String]): WebcamStream = {
    val mediaStream: MediaStream = webcamStream.stream
    val newMediaStream = mediaStream.modify(_.viewers).setTo(viewers)
    val newWebcamStream = webcamStream.modify(_.stream).setTo(newMediaStream)
    save(newWebcamStream)
  }
}

case class WebcamStream(streamId: String, stream: MediaStream)
