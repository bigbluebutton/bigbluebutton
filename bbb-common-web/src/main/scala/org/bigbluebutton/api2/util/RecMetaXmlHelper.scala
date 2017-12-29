package org.bigbluebutton.api2.util

import java.io.{File, FileOutputStream, IOException}
import java.nio.channels.Channels
import java.nio.charset.StandardCharsets
import java.util

import org.bigbluebutton.api.domain.RecordingMetadata
import org.bigbluebutton.api2.RecordingServiceGW
import org.bigbluebutton.api2.domain.RecMeta

import scala.xml.{Elem, PrettyPrinter, XML}
import scala.collection.JavaConverters._

class RecMetaXmlHelper extends RecordingServiceGW with LogHelper {

  def loadMetadataXml(path: String): Option[Elem] = {
    try {
      //val xml = XML.loadFile(path)
      val xml = XML.load(new java.io.InputStreamReader(new java.io.FileInputStream(path), StandardCharsets.UTF_8.name()))
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

  def saveRecordingMetadata(xml: File, metadata: RecordingMetadata): Unit = {
    try {
      val Encoding = StandardCharsets.UTF_8.name()
      val pp = new PrettyPrinter(80, 2)
      val fos = new FileOutputStream(xml.getAbsolutePath)
      val writer = Channels.newWriter(fos.getChannel(), Encoding)

      try {
        writer.write("<?xml version='1.0' encoding='" + Encoding + "'?>\n")
        writer.write(pp.format(metadata.getRecMeta.toMetadataXml()))
      } catch {
        case ex: Exception =>
          logger.info("Exception while saving {}", xml.getAbsolutePath)
          logger.info("Exception details: {}", ex.fillInStackTrace())
      } finally {
        writer.close()
      }
    } catch {
      case ioe: IOException =>
        logger.info("Failed to save metadataxml {}", xml.getAbsolutePath)
      case ex: Exception =>
        logger.info("Exception while saving {}", xml.getAbsolutePath)
        logger.info("Exception details: {}", ex.fillInStackTrace())
    }
  }

  def getRecordingMetadata(xml: File): Option[RecordingMetadata] = {
    loadMetadataXml(xml.getAbsolutePath) match {
      case Some(mXML) =>
        try {
          RecMeta.getRecMeta(mXML) match {
            case Some(rm) =>
              val rec = new RecordingMetadata()
              rec.setRecMeta(rm)
              Some(rec)
            case None => None
          }
        } catch {
          case ex: Exception =>
            logger.info("Exception while saving {}", xml.getAbsolutePath)
            logger.info("Exception details: {}", ex.fillInStackTrace())
            None
        }

      case None => None
    }
  }

  def getRecordings2x(recs: util.ArrayList[RecordingMetadata]): String = {

    def toXml(rec: RecMeta): Option[Elem] = {
      try {
        Some(rec.toXml())
      } catch {
        case ex: Exception =>
          logger.info("Exception while building xml for recording {}", rec.id)
          logger.info("Exception details: {}", ex.fillInStackTrace())
          None
      }
    }

    val recMeta = recs.asScala map(r => r.getRecMeta)
    if (recMeta.isEmpty) {
      val resp =
        <response>
          <returncode>SUCCESS</returncode>
          <recordings></recordings>
          <messageKey>noRecordings</messageKey>
          <message>There are no recordings for the meeting(s).</message>
        </response>
      resp.toString
    } else {
      val buffer = new scala.xml.NodeBuffer
      recMeta foreach { rm =>
        toXml(rm) foreach (r => buffer += r)
      }
      val resp =
        <response>
          <returncode>SUCCESS</returncode>
          <recordings>{buffer}</recordings>
        </response>
      resp.toString
    }
  }
}
