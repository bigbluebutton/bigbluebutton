package org.bigbluebutton.api2.util

import java.io.IOException

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

  def getExtensions(playbackXml: Elem): Option[NodeSeq] = {
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
}
