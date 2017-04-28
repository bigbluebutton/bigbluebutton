package org.bigbluebutton.core.models

import com.softwaremill.quicklens._

object Streams {

  def add(stream: Stream, user: String): Stream = {
    val newViewers = stream.viewers + user
    modify(stream)(_.viewers).setTo(newViewers)
  }

  def remove(stream: Stream, user: String): Stream = {
    val newViewers = stream.viewers - user
    modify(stream)(_.viewers).setTo(newViewers)
  }
}

/**
 * Borrow some ideas from SDP.
 * https://en.wikipedia.org/wiki/Session_Description_Protocol
 */
case class MediaAttribute(key: String, value: String)
case class Stream(id: String, sessionId: String, attributes: Set[MediaAttribute], viewers: Set[String])
