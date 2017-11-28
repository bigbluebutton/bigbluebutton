package org.bigbluebutton.api2.domain

import scala.collection.JavaConverters._

import scala.xml.{Elem, NodeSeq}

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

  def getBreakoutRooms(metaXml: Elem): Vector[String] = {
    val rooms = (metaXml \ "breakoutRooms")
    if (rooms.isEmpty) {
      Vector()
    } else {
      val breakoutElem = (rooms \ "breakoutRoom")
      if (breakoutElem.isEmpty) {
        Vector()
      } else {
        breakoutElem map( n => n.text) toVector
      }
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
      val size = getValLong(playback, "size", 0)
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

  def getRecMeta(metaXml: Elem): Option[RecMeta] = {
    val id = getText(metaXml, "id", "unknown")
    val state = getText(metaXml, "state", "unknown")
    val published = getText(metaXml, "published", "true").toString.toBoolean
    val startTime = getValLong(metaXml, "start_time", 0)
    val endTime = getValLong(metaXml, "end_time", 0)
    val rawSize = getValLong(metaXml, "raw_size", 0)
    val participants = getValInt(metaXml, "participants", 0)
    val meeting = getMeeting(metaXml)
    val meta = getMeta(metaXml)
    val playback = getPlayback(metaXml)
    val breakout = getBreakout(metaXml)
    val breakoutRoom = getBreakout(metaXml)
    val breakoutRooms = getBreakoutRooms(metaXml)

    val meetingId =  meeting match {
      case Some(m) => m.externalId
      case None => id
    }

    val meetingName = meeting match {
      case Some(m) => m.name
      case None =>
        meta match {
          case Some(m) => m.getOrElse("meetingName", "unknown")
          case None => "unknown"
        }
    }

    val internalMeetingId = meeting match {
      case Some(m) => Some(m.id)
      case None => None
    }

    val isBreakout = meeting match {
      case Some(m) => m.breakout
      case None =>
        meta match {
          case Some(m) => m.getOrElse("isBreakout", "false").toString.toBoolean
          case None => "false".toString.toBoolean
        }
    }

    Some(RecMeta(id, meetingId, internalMeetingId, meetingName, state, published,
      startTime, endTime, participants, rawSize, isBreakout,
      meeting, meta, playback, breakout, breakoutRooms))
  }
}

case class RecMeta(id: String, meetingId: String, internalMeetingId: Option[ String],
                   meetingName: String, state: String, published: Boolean, startTime: Long, endTime: Long,
                   participants: Int, rawSize: Long, isBreakout: Boolean, meeting: Option[RecMetaMeeting],
                   meta: Option[collection.immutable.Map[String, String]], playback: Option[RecMetaPlayback],
                   breakout: Option[RecMetaBreakout], breakoutRooms: Vector[String]) {

  def setState(state: String): RecMeta = this.copy(state = state)
  def setPublished(publish: Boolean): RecMeta = this.copy(published = publish)
  def getRecMeta():java.util.Map[String, String] = {
    meta match {
      case Some(m) =>
        // Send back a mutable map. So convert the immutable map to mutable then convert
        // to Java Map.
        // https://stackoverflow.com/questions/5042878/how-can-i-convert-immutable-map-to-mutable-map-in-scala
        val mutableMap = collection.mutable.Map() ++ m // convert to mutable map
        mutableMap.asJava
      case None => (collection.mutable.Map[String, String]()).asJava
    }
  }

  def setRecMeta(m: java.util.Map[String, String]): RecMeta = {
    this.copy(meta = Some((m.asScala).toMap))
  }

  def toXml(): Elem = {

    def metaToElem(map: scala.collection.immutable.Map[String, String]): Elem = {
      val buffer = new scala.xml.NodeBuffer

      map.foreach {case (key, value) =>
        // Need to escape value otherwise loadString would choke.
        val m = "<" + key + ">" + xml.Utility.escape(value) + "</" + key + ">"
        buffer += scala.xml.XML.loadString(m)
      }
      <metadata>{buffer}</metadata>
    }

    def breakoutRoomsToElem(rooms: Vector[String]): Elem = {
      val buffer = new scala.xml.NodeBuffer

      rooms foreach(r => buffer += <breakoutRoom>{r}</breakoutRoom>)

      <breakoutRooms>{buffer}</breakoutRooms>
    }

    val recordIdElem =  <recordID>{id}</recordID>
    val meetingIdElem = <meetingID>{meetingId}</meetingID>
    val meetingNameElem = <name>{meetingName}</name>

    val internalId = internalMeetingId match {
      case Some(intId) => Some(<internalMeetingID>{intId}</internalMeetingID>)
      case None => None
    }

    val isBreakoutElem = <isBreakout>{isBreakout}</isBreakout>
    val publishedElem = <published>{published}</published>
    val stateElem =  <state>{state}</state>
    val startTimeElem =  <startTime>{startTime}</startTime>
    val endTimeElem = <endTime>{endTime}</endTime>
    val participantsElem = <participants>{participants}</participants>


    val buffer = new scala.xml.NodeBuffer
    buffer += recordIdElem
    buffer += meetingIdElem
    internalId foreach(intId => buffer += intId)
    buffer += meetingNameElem
    buffer += isBreakoutElem
    buffer += publishedElem
    buffer += stateElem
    buffer += startTimeElem
    buffer += endTimeElem
    buffer += participantsElem

    meta foreach (m => buffer += metaToElem(m))
    breakout foreach (b => buffer += b.toXml())
    if (breakoutRooms.nonEmpty) {
      buffer += breakoutRoomsToElem(breakoutRooms)
    }
    playback foreach(p => buffer += p.toXml())

    <recording>{buffer}</recording>
  }

  def toMetadataXml(): Elem = {
    val recordIdElem = <id>{id}</id>
    val stateElem = <state>{state}</state>
    val publishedElem = <published>{published}</published>
    val startTimeElem = <start_time>{startTime}</start_time>
    val endTimeElem = <end_time>{endTime}</end_time>
    val participantsElem = <participants>{participants}</participants>
    val rawSizeElem = <raw_size>{rawSize}</raw_size>

    val buffer = new scala.xml.NodeBuffer
    buffer += recordIdElem
    buffer += stateElem
    buffer += publishedElem
    buffer += startTimeElem
    buffer += endTimeElem
    buffer += participantsElem

    meeting foreach { m =>
      buffer += m.toMetadataXml()
    }

    def metaToElem(map: scala.collection.immutable.Map[String, String]): Elem = {
      val buffer = new scala.xml.NodeBuffer

      map.foreach {case (key, value) =>
        // Need to escape value otherwise loadString would choke.
        val m = "<" + key + ">" + xml.Utility.escape(value) + "</" + key + ">"
        buffer += scala.xml.XML.loadString(m)
      }
      <meta>{buffer}</meta>
    }

    meta foreach (m => buffer += metaToElem(m))
    breakout foreach (b => buffer += b.toMetadataXml())

    def breakoutRoomsToElem(rooms: Vector[String]): Elem = {
      val buffer = new scala.xml.NodeBuffer

      rooms foreach(r => buffer += <breakoutRoom>{r}</breakoutRoom>)

      <breakoutRooms>{buffer}</breakoutRooms>
    }

    if (breakoutRooms.nonEmpty) {
      buffer += breakoutRoomsToElem(breakoutRooms)
    }

    playback foreach(p => buffer += p.toMetadataXml())

    buffer += rawSizeElem

    <recording>{buffer}</recording>
  }
}


case class RecMetaMeeting(id: String, externalId: String, name: String, breakout: Boolean) {
  def toXml(): Elem = {
      <meeting id={id} externalId={externalId} name={name} breakout={breakout.toString}/>
  }

  def toMetadataXml(): Elem = {
      <meeting id={id} externalId={externalId} name={name} breakout={breakout.toString}/>
  }
}

case class RecMetaPlayback(format: String, link: String, processingTime: Int,
                           duration: Int, size: Long, extensions: Option[scala.xml.NodeSeq]) {
  def toXml(): Elem = {
    val buffer = new scala.xml.NodeBuffer

    val formatElem = <type>{format}</type>
    val urlElem = <url>{link}</url>
    val processTimeElem = <processingTime>{processingTime}</processingTime>
    val lengthElem = <length>{duration / 60000}</length>

    buffer += formatElem
    buffer += urlElem
    buffer += processTimeElem
    buffer += lengthElem

    extensions foreach {ext =>
      ext.head.child foreach {child =>
        buffer += child
      }

    }

    <playback><format>{buffer}</format></playback>
  }

  def toMetadataXml(): Elem = {
    val buffer = new scala.xml.NodeBuffer

    val formatElem = <format>{format}</format>
    val urlElem = <link>{link}</link>
    val processTimeElem = <processing_time>{processingTime}</processing_time>
    val lengthElem = <duration>{duration}</duration>

    buffer += formatElem
    buffer += urlElem
    buffer += processTimeElem
    buffer += lengthElem


    extensions foreach {ext =>
      buffer += ext.head
    }

    <playback>{buffer}</playback>
  }
}


case class RecMetaImage(width: String, height: String, alt: String, link: String)

case class RecMetaBreakout(parentId: String, sequence: Int, meetingId: String) {
  def toXml(): Elem = {
    val buffer = new scala.xml.NodeBuffer

    val parentIdElem = <parentId>{parentId}</parentId>
    val sequenceElem =  <sequence>{sequence}</sequence>

    buffer += parentIdElem
    buffer += sequenceElem

    <breakout>{buffer}</breakout>
  }

  def toMetadataXml(): Elem = {
      <breakout parentMeetingId={parentId} sequence={sequence.toString} meetingId={meetingId}/>
  }
}
