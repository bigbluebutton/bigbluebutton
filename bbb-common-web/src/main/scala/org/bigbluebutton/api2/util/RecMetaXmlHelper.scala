package org.bigbluebutton.api2.util

import java.io.{File, IOException}
import java.util

import org.bigbluebutton.api.domain.RecordingMetadata
import org.bigbluebutton.api2.RecordingServiceGW
import org.bigbluebutton.api2.domain.{RecMeta, RecMetaBreakout, RecMetaMeeting, RecMetaPlayback}

import scala.xml.{Elem, NodeSeq, XML}
import scala.collection.JavaConverters._

class RecMetaXmlHelper extends RecordingServiceGW with LogHelper {

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

  def getRecordingMetadata(xml: File): Option[RecordingMetadata] = {
    loadMetadataXml(xml.getAbsolutePath) match {
      case Some(mXML) =>
        RecMeta.getRecMeta(mXML) match {
          case Some(rm) =>
            val rec = new RecordingMetadata()
            rec.setRecMeta(rm)
            Some(rec)
          case None => None
        }
      case None => None
    }
  }

  def getRecordings2x(recs: util.ArrayList[RecordingMetadata]): String = {
    val recMeta = recs.asScala map(r => r.getRecMeta)
    if (recMeta.isEmpty) {
      val resp =
        <response>
          <returncode>SUCCESS</returncode>
          <recordings></recordings>
          <messageKey>noRecordings</messageKey>
          <message>There are no recordings for the meeting(s).</message>
        </response>
      val p = new scala.xml.PrettyPrinter(80, 4)

      p.format(<recording>{resp}</recording>)
    } else {
      val buffer = new scala.xml.NodeBuffer
      recMeta foreach(rm => buffer += rm.toXml())
      val resp =
        <response>
          <returncode>SUCCESS</returncode>
          <recordings>{buffer}</recordings>
        </response>
      val p = new scala.xml.PrettyPrinter(80, 4)
      p.format(<recording>{resp}</recording>)
    }
  }
}
