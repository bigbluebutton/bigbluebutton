package org.bigbluebutton.core.models

import org.bigbluebutton.core.db.ScreenshareDAO
import collection.immutable.HashMap

object Screenshares {
  def findByStreamId(screenshares: Screenshares, streamId: String): Option[ScreenshareStream] = {
    screenshares.toVector.find(s => s.streamId == streamId)
  }

  def findByUser(screenshares: Screenshares, userId: String): Vector[ScreenshareStream] = {
    screenshares.toVector.filter(s => s.userId == userId)
  }

  def findAll(screenshares: Screenshares): Vector[ScreenshareStream] = screenshares.toVector

  def add(meetingId: String, screenshares: Screenshares, stream: ScreenshareStream): Option[ScreenshareStream] = {
    findByStreamId(screenshares, stream.streamId) match {
      case None =>
        ScreenshareDAO.insert(meetingId, stream)
        Some(screenshares.save(stream))
      case _ => None
    }
  }

  def remove(meetingId: String, screenshares: Screenshares, streamId: String): Option[ScreenshareStream] = {
    for {
      stream <- {
        ScreenshareDAO.updateStopped(meetingId, streamId)
        screenshares.remove(streamId)
      }
    } yield stream
  }

  def hasStream(screenshares: Screenshares, streamId: String): Boolean = {
    findByStreamId(screenshares, streamId) match {
      case Some(_) => true
      case _       => false
    }
  }

  def hasUserStream(screenshares: Screenshares, userId: String): Boolean = {
    findByUser(screenshares, userId).nonEmpty
  }

  def hasAnyActiveScreenshare(screenshares: Screenshares): Boolean = {
    screenshares.toVector.nonEmpty
  }

  def setShowAsContent(screenshares: Screenshares, streamId: String, showAsContent: Boolean): Option[ScreenshareStream] = {
    screenshares.update(streamId, s => s.copy(showAsContent = showAsContent))
  }

  def userScreenshareCount(screenshares: Screenshares, userId: String): Int = {
    findByUser(screenshares, userId).length
  }
}

class Screenshares {
  private var screenshares: HashMap[String, ScreenshareStream] = new HashMap[String, ScreenshareStream]

  private[models] def toVector: Vector[ScreenshareStream] = screenshares.values.toVector

  private[models] def save(stream: ScreenshareStream): ScreenshareStream = {
    screenshares += stream.streamId -> stream
    stream
  }

  private[models] def remove(streamId: String): Option[ScreenshareStream] = {
    for {
      stream <- screenshares.get(streamId)
    } yield {
      screenshares -= streamId
      stream
    }
  }

  private[models] def update(streamId: String, updater: ScreenshareStream => ScreenshareStream): Option[ScreenshareStream] = {
    for {
      stream <- screenshares.get(streamId)
    } yield {
      val updated = updater(stream)
      screenshares += streamId -> updated
      updated
    }
  }
}

case class ScreenshareStream(
    streamId:        String,
    userId:          String,
    voiceConf:       String,
    screenshareConf: String,
    contentType:     String,
    vidWidth:        Int,
    vidHeight:       Int,
    hasAudio:        Boolean,
    showAsContent:   Boolean,
    timestamp:       String,
    trackSid:        Option[String]
)
