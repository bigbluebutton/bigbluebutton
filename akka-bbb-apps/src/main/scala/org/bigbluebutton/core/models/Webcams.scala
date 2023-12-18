package org.bigbluebutton.core.models

import org.bigbluebutton.core.db.UserCameraDAO

import collection.immutable.HashMap

object Webcams {
  def findWithStreamId(webcams: Webcams, streamId: String): Option[WebcamStream] = {
    webcams.toVector.find(webcam => webcam.streamId == streamId)
  }

  def findWebcamsForUser(webcams: Webcams, userId: String): Vector[WebcamStream] = {
    webcams.toVector.filter(webcam => webcam.userId == userId)
  }

  def findAll(webcams: Webcams): Vector[WebcamStream] = webcams.toVector

  def addWebcamStream(webcams: Webcams, webcam: WebcamStream): Option[WebcamStream] = {
    findWithStreamId(webcams, webcam.streamId) match {
      case None => {
        UserCameraDAO.insert(webcam)
        Some(webcams.save(webcam))
      }
      case _ => None
    }
  }

  def removeWebcamStream(webcams: Webcams, streamId: String): Option[WebcamStream] = {
    for {
      webcam <- {
        UserCameraDAO.delete(streamId)
        webcams.remove(streamId)
      }
    } yield webcam
  }

  def hasWebcamStream(webcams: Webcams, streamId: String): Boolean = {
    findWithStreamId(webcams, streamId) match {
      case Some(webcam) => true
      case _            => false
    }
  }

  def addSubscriber(webcams: Webcams, streamId: String, userId: String): Unit = {
    findWithStreamId(webcams, streamId) match {
      case Some(webcam) => webcams.addSubscriber(webcam, userId)
      case _            =>
    }
  }

  def removeSubscriber(webcams: Webcams, streamId: String, userId: String): Unit = {
    findWithStreamId(webcams, streamId) match {
      case Some(webcam) => webcams.removeSubscriber(webcam, userId)
      case _            =>
    }
  }

  def isSubscriber(webcams: Webcams, userId: String, streamId: String): Boolean = {
    findWithStreamId(webcams, streamId) match {
      case Some(webcam) => webcam.subscribers contains userId
      case None         => false
    }
  }

  def isPublisher(webcams: Webcams, userId: String, streamId: String): Boolean = {
    findWithStreamId(webcams, streamId) match {
      case Some(webcam) => webcam.userId == userId && webcam.streamId.startsWith(userId)
      case None         => false
    }
  }
}

class Webcams {
  private var webcams: HashMap[String, WebcamStream] = new HashMap[String, WebcamStream]

  private def toVector: Vector[WebcamStream] = webcams.values.toVector

  private def save(webcam: WebcamStream): WebcamStream = {
    webcams += webcam.streamId -> webcam
    webcam
  }

  private def remove(streamId: String): Option[WebcamStream] = {
    for {
      webcam <- webcams.get(streamId)
    } yield {
      webcams -= streamId
      webcam
    }
  }

  private def addSubscriber(webcam: WebcamStream, userId: String): Unit = {
    save(webcam.copy(subscribers = webcam.subscribers + userId))
  }

  private def removeSubscriber(webcam: WebcamStream, userId: String): Unit = {
    save(webcam.copy(subscribers = webcam.subscribers - userId))
  }
}

case class WebcamStream(streamId: String, userId: String, subscribers: Set[String])
