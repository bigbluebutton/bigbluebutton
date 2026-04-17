package org.bigbluebutton.core.models

import scala.collection.mutable

case class ScreenshareEntry(
    screenshareId:   String,
    userId:          String,
    stream:          String,
    voiceConf:       String,
    screenshareConf: String,
    vidWidth:        Int,
    vidHeight:       Int,
    hasAudio:        Boolean,
    contentType:     String,
    showAsContent:   Boolean,
    startedAt:       Long
)

object Screenshares {
  def add(ss: Screenshares, entry: ScreenshareEntry): Unit = {
    ss.entries(entry.stream) = entry
  }

  def remove(ss: Screenshares, stream: String): Option[ScreenshareEntry] = {
    ss.entries.remove(stream)
  }

  def findByStream(ss: Screenshares, stream: String): Option[ScreenshareEntry] = {
    ss.entries.get(stream)
  }

  def findByUser(ss: Screenshares, userId: String): Option[ScreenshareEntry] = {
    ss.entries.values.find(_.userId == userId)
  }

  def findAll(ss: Screenshares): Seq[ScreenshareEntry] = {
    ss.entries.values.toSeq
  }

  def hasStream(ss: Screenshares, stream: String): Boolean = {
    ss.entries.contains(stream)
  }

  def hasAnyActiveScreenshare(ss: Screenshares): Boolean = {
    ss.entries.nonEmpty
  }

  def userScreenshareCount(ss: Screenshares, userId: String): Int = {
    ss.entries.values.count(_.userId == userId)
  }
}

class Screenshares {
  private[models] val entries: mutable.Map[String, ScreenshareEntry] = mutable.Map()
}
