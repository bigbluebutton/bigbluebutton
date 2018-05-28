package org.bigbluebutton.api2.util

import java.io.{File, FileOutputStream, IOException}
import java.nio.channels.Channels
import java.nio.charset.StandardCharsets
import java.util

import com.google.gson.Gson
import org.bigbluebutton.api.domain.RecordingMetadata
import org.bigbluebutton.api2.RecordingServiceGW
import org.bigbluebutton.api2.domain._

import scala.xml.{Elem, PrettyPrinter, XML}
import scala.collection.JavaConverters._
import scala.collection.mutable.{Buffer, ListBuffer, Map}
import scala.collection.Iterable
import scala.collection.JavaConversions._

class RecMetaXmlHelper extends RecordingServiceGW with LogHelper {

  import java.io.IOException
  import java.nio.charset.Charset
  import java.nio.file.Files
  import java.nio.file.Paths


  val SUCCESS = "SUCCESS"
  val FAILED = "FAILED"

  def loadMetadataXml(path: String): Option[Elem] = {
    try {
      //val xml = XML.loadFile(path)
      val xml = XML.load(new java.io.InputStreamReader(new java.io.FileInputStream(path), "UTF-8"))
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
      val Encoding = "UTF-8"
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

    def toXml(rec: RecMetaResponse): Option[Elem] = {
      try {
        Some(rec.toXml())
      } catch {
        case ex: Exception =>
          logger.info("Exception while building xml for recording {}", rec.id)
          logger.info("Exception details: {}", ex.fillInStackTrace())
          None
      }
    }

    // Translate a RecMeta to a RecMetaResponse
    def createRecMetaResponse(recMeta: RecMeta): RecMetaResponse = {
      val recMetaResponse = new RecMetaResponse(
          recMeta.id,
          recMeta.meetingId,
          recMeta.internalMeetingId,
          recMeta.meetingName,
          recMeta.state,
          recMeta.published,
          recMeta.startTime,
          recMeta.endTime,
          recMeta.participants,
          recMeta.rawSize,
          recMeta.isBreakout,
          recMeta.meeting,
          recMeta.meta,
          recMeta.playback match {
            case Some(p) => ListBuffer(p)
            case None => ListBuffer()
          },
          recMeta.breakout,
          recMeta.breakoutRooms
      )
      recMetaResponse
    }

    // Group up recordings with the same id
    def mergeRecMeta(recMeta: Buffer[RecMeta]): Iterable[RecMetaResponse] = {
      val resp = Map[String, RecMetaResponse]()
      recMeta foreach { rm =>
        resp(rm.id) = resp.get(rm.id) match {
          case Some(recMetaResponse) => recMetaResponse.updateRecMeta(rm)
          case None => createRecMetaResponse(rm)
        }
      }
      resp.values
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
      val recMetaResponse = mergeRecMeta(recMeta)
      recMetaResponse foreach { rm =>
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

  def readCaptionJsonFile(path: String, encoding: Charset): Option[String] = {
    try {
      val encoded = Files.readAllBytes(Paths.get(path))
      Some(new String(encoded, encoding))
    } catch {
      case ioe: IOException =>
        logger.info("Failed to load caption.json {}", path)
        None
      case ex: Exception =>
        logger.info("Exception while loading {}", path)
        logger.info("Exception details: {}", ex.getMessage)
        None
    }

  }

  def getRecordingTextTracks(recordId: String, file: util.ArrayList[File]):String = {
    val gson = new Gson()

    var returnResponse:String = ""

    if (file.isEmpty) {
      val resFailed = GetRecTextTracksResultFailed(FAILED, "noRecordings", "No recordings for " + recordId)
      val respFailed = GetRecTextTracksRespFailed(resFailed)
      val failedTxt = gson.toJson(respFailed)
      println(failedTxt)
      returnResponse = failedTxt
    } else {
      val captionJsonFile = file.get(0).getAbsolutePath + File.separatorChar + "captions.json"
      readCaptionJsonFile(captionJsonFile, StandardCharsets.UTF_8) match {
        case Some(captions) => println("Captions: \n" + captions)
          val ctracks = gson.fromJson(captions, classOf[util.ArrayList[Track]])
          val xtracks = Tracks(ctracks)
          val result1 = GetRecTextTracksResult(SUCCESS, xtracks)
          val response1 = GetRecTextTracksResp(result1)
          val respText1 = gson.toJson(response1)
          println(respText1)
          returnResponse = respText1
        case None => println("Captions file not found for " + recordId)
          val resFailed = GetRecTextTracksResultFailed(FAILED, "noCaptionsFound", "No captions found for " + recordId)
          val respFailed = GetRecTextTracksRespFailed(resFailed)
          val failedTxt = gson.toJson(respFailed)
          println(failedTxt)
          returnResponse = failedTxt
      }
    }


    returnResponse
  }

  def putRecordingTextTrack(recordId: String, kind: String, lang: String, file: File, label: Option[String]):String = {
    "putRecordingTextTrack TODO"
  }
}
