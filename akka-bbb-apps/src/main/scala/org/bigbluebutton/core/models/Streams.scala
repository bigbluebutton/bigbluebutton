package org.bigbluebutton.core.models

import com.softwaremill.quicklens._

trait Streams {

  def addViewer(stream: MediaStream, user: String): MediaStream = {
    val newViewers = stream.viewers + user
    modify(stream)(_.viewers).setTo(newViewers)
  }

  def removeViewer(stream: MediaStream, user: String): MediaStream = {
    val newViewers = stream.viewers - user
    modify(stream)(_.viewers).setTo(newViewers)
  }
}

/**
 * Borrow some ideas from SDP for attributes.
 * https://en.wikipedia.org/wiki/Session_Description_Protocol
 */
case class MediaStream(id: String, url: String, userId: String, attributes: collection.immutable.Map[String, String], viewers: Set[String])
