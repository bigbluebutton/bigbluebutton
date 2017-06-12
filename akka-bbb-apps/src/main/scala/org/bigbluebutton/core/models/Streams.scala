package org.bigbluebutton.core.models

import com.softwaremill.quicklens._

trait Streams {

  def addViewer(stream: Stream, user: String): Stream = {
    val newViewers = stream.viewers + user
    modify(stream)(_.viewers).setTo(newViewers)
  }

  def removeViewer(stream: Stream, user: String): Stream = {
    val newViewers = stream.viewers - user
    modify(stream)(_.viewers).setTo(newViewers)
  }
}

/**
 * Borrow some ideas from SDP.
 * https://en.wikipedia.org/wiki/Session_Description_Protocol
 */
case class MediaAttribute(key: String, value: String)
case class Stream(id: String, sessionId: String, userId: String, attributes: Set[MediaAttribute], viewers: Set[String])
