package org.bigbluebutton.api2.domain


object RecMeta {
  def getMeetingId(r: RecMeta): String = {
    r.meeting match {
      case Some(m) => m.externalId
      case None => r.id
    }
  }

  def getInternalId(r: RecMeta): Option[String] = {
    r.meeting match {
      case Some(m) => Some(m.id)
      case None => None
    }
  }

  def getMeetingName(r: RecMeta): String = {
    r.meeting match {
      case Some(m) => m.name
      case None =>
        r.meta match {
          case Some(m) => m.getOrElse("meetingName", "unknown")
          case None => "unknown"
        }
    }
  }


}

case class RecMeta(id: String, state: String, published: Boolean, startTime: Long, endTime: Long,
                   participants: Int, rawSize: Int, meeting: Option[RecMetaMeeting],
                   meta: Option[Map[String, String]], playback: Option[RecMetaPlayback])
case class RecMetaMeeting(id: String, externalId: String, name: String, breakout: Boolean)
case class RecMetaPlayback(format: String, link: String, processingTime: Int,
                           duration: Int, size: Int, extensions: Option[scala.xml.NodeSeq])
case class RecMetaImage(width: String, height: String, alt: String, link: String)
case class RecMetaBreakout(parentId: String, sequence: Int, meetingId: String)