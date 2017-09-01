package org.bigbluebutton.api2.util

import java.io.IOException

import org.bigbluebutton.api2.domain.{RecMeta, RecMetaBreakout, RecMetaMeeting, RecMetaPlayback}

import scala.xml.{Elem, NodeSeq, XML}

object RecMetaXmlHelper extends LogHelper {

  def loadMetadataXml(path: String): Option[Elem] = {
    try {
      val xml = XML.loadFile(path)
      Some(xml)
    } catch {
      case ioe: IOException =>
        logger.info("Failed to load metadataxml {}", path)
        None
      case ex: Exception =>
        logger.info("Exception while loading {}", path)
        logger.info("Exception details: {}", ex.getMessage)
        None
    }
  }

  private def getText(elem: NodeSeq, key: String, default: String): String = {
    val res = (elem \ key).text
    if (res.isEmpty) default else res
  }

  private def getValInt(elem: NodeSeq, key: String, default: Int): Int = {
    val res = (elem \ key).text
    if (res.isEmpty) default else res.toInt
  }

  private def getValLong(elem: NodeSeq, key: String, default: Long): Long = {
    val res = (elem \ key).text
    if (res.isEmpty) default else res.toLong
  }

  def getPlayback(metaXml: Elem): Option[RecMetaPlayback] = {
    val playback = metaXml \ "playback"
    if (playback.isEmpty) None
    else {
      val format = getText(playback, "format", "unknown")
      val link = getText(playback, "link", "unknown")
      val processingTime = getValInt(playback, "processing_time", 0)
      val duration = getValInt(playback, "duration", 0)
      val size = getValInt(playback, "size", 0)
      val extensions = getExtensions(playback)
      Some(RecMetaPlayback(format, link, processingTime, duration, size, extensions))
    }
  }

  def getExtensions(playbackXml: NodeSeq): Option[NodeSeq] = {
    val extensions = playbackXml \ "extensions"
    if (extensions.isEmpty) None
    else Some(extensions)
  }

  def getMeta(metaXml: Elem): Option[scala.collection.immutable.Map[String, String]] = {
    val meta = (metaXml \ "meta")

    if (meta.nonEmpty) {
      // result has some #PCDATA entries which we don't want. Filter them out.
      val nonPCData = meta.head.nonEmptyChildren filter (p => p.label != "#PCDATA")

      val metaMap = nonPCData map { f =>
        f.label -> f.text
      } toMap

      Some(metaMap)
    } else {
      None
    }
  }

  def getMeeting(metaXml: Elem): Option[RecMetaMeeting] = {
    val meetingNode = (metaXml \ "meeting")
    if (meetingNode.isEmpty) {
      None
    } else {
      val meetingElem = meetingNode(0) // convert from Node to Elem
      val id = meetingElem.attribute("id").getOrElse("unknown").toString
      val externalId = meetingElem.attribute("externalId").getOrElse("unknown").toString
      val name = meetingElem.attribute("name").getOrElse("unknown").toString
      val breakout = meetingElem.attribute("breakout").getOrElse("false")
      Some(RecMetaMeeting(id, externalId, name, breakout.toString.toBoolean))
    }
  }

  def getBreakout(metaXml: Elem): Option[RecMetaBreakout] = {
    val breakoutNode = (metaXml \ "breakout")
    if (breakoutNode.isEmpty) {
      None
    } else {
      val breakoutElem = breakoutNode(0) // convert from Node to Elem
      val parentId = breakoutElem.attribute("parentMeetingId").getOrElse("unknown").toString
      val sequence = breakoutElem.attribute("sequence").getOrElse("0").toString
      val meetingId = breakoutElem.attribute("meetingId").getOrElse("unknown").toString
      Some(RecMetaBreakout(parentId, sequence.toInt, meetingId))
    }
  }

  def getRecMeta(metaXml: Elem): Option[RecMeta] = {
    val id = getText(metaXml, "id", "unknown")
    val state = getText(metaXml, "state", "unknown")
    val published = getText(metaXml, "published", "true")
    val startTime = getValLong(metaXml, "start_time", 0)
    val endTime = getValLong(metaXml, "end_time", 0)
    val rawSize = getValInt(metaXml, "raw_size", 0)
    val participants = getValInt(metaXml, "participants", 0)
    val meeting = getMeeting(metaXml)
    val meta = getMeta(metaXml)
    val playback = getPlayback(metaXml)

    Some(RecMeta(id, state, published.toString.toBoolean, startTime, endTime, participants, rawSize,
      meeting, meta, playback))
  }

  def getRecMetaXml(r: RecMeta): Elem = {
    val recordIdElem =  <recordID>{r.id}</recordID>
    val meetingIdElem = <meetingID>{RecMeta.getMeetingId(r)}</meetingID>
    val internalId = RecMeta.getInternalId(r)

    val buffer = new scala.xml.NodeBuffer


  }
}
