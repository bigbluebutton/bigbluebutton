package org.bigbluebutton.api2.util

import java.io.{ File, FileOutputStream, FileWriter, IOException }
import java.nio.channels.Channels
import java.nio.charset.StandardCharsets
import java.util
import java.nio.file.{ Files, Paths }

import com.google.gson.Gson
import org.bigbluebutton.api.domain.RecordingMetadata
import org.bigbluebutton.api2.{ BbbWebApiGWApp, RecordingServiceGW }
import org.bigbluebutton.api2.domain._

import scala.xml.{ Elem, PrettyPrinter, XML }
import scala.collection.JavaConverters._
import scala.collection.mutable.{ Buffer, ListBuffer, Map }
import scala.collection.Iterable
import java.io.IOException
import java.nio.charset.Charset
import java.nio.file.Files
import java.nio.file.Paths

import com.google.gson.internal.LinkedTreeMap

import scala.util.Try

class RecMetaXmlHelper(gw: BbbWebApiGWApp) extends RecordingServiceGW with LogHelper {

  val SUCCESS = "SUCCESS"
  val FAILED = "FAILED"
  val CAPTIONS_FILE = "captions.json"

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

  def saveRecordingMetadata(xml: File, metadata: RecordingMetadata): Boolean = {
    var result = false
    try {
      val Encoding = StandardCharsets.UTF_8.name()
      val pp = new PrettyPrinter(80, 2)
      val fos = new FileOutputStream(xml.getAbsolutePath)
      val writer = Channels.newWriter(fos.getChannel(), Encoding)

      try {
        writer.write("<?xml version='1.0' encoding='" + Encoding + "'?>\n")
        writer.write(pp.format(metadata.getRecMeta.toMetadataXml()))
        result = true
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
    result
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
          case None    => ListBuffer()
        },
        recMeta.dataMetrics match {
          case Some(p) => ListBuffer(p)
          case None    => ListBuffer()
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
          case None                  => createRecMetaResponse(rm)
        }
      }
      resp.values
    }

    val recMeta = recs.asScala map (r => r.getRecMeta)
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
          <recordings>{ buffer }</recordings>
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

  def validateTextTrackSingleUseToken(recordId: String, caption: String, token: String): Boolean = {
    gw.validateSingleUseCaptionToken(token, recordId, caption)
  }

  def getRecordingsCaptionsJson(recordId: String, captionsDir: String, captionBaseUrl: String): String = {
    val gson = new Gson()
    var returnResponse: String = ""
    val captionsFilePath = captionsDir + File.separatorChar + recordId + File.separatorChar + CAPTIONS_FILE

    readCaptionJsonFile(captionsFilePath, StandardCharsets.UTF_8) match {
      case Some(captions) =>
        val ctracks = gson.fromJson(captions, classOf[java.util.List[LinkedTreeMap[String, String]]])

        val list = new util.ArrayList[Track]()
        val it = ctracks.iterator()

        while (it.hasNext()) {
          val mapTrack = it.next()
          val caption = mapTrack.get("kind") + "_" + mapTrack.get("lang") + ".vtt"
          val singleUseToken = gw.generateSingleUseCaptionToken(recordId, caption, 60 * 60)

          list.add(new Track(
            // captionBaseUrl contains the '/' so no need to put one before singleUseToken
            href = captionBaseUrl + singleUseToken + '/' + recordId + '/' + caption,
            kind = mapTrack.get("kind"),
            label = mapTrack.get("label"),
            lang = mapTrack.get("lang"),
            source = mapTrack.get("source")
          ))
        }
        val textTracksResult = GetRecTextTracksResult(SUCCESS, list)

        val textTracksResponse = GetRecTextTracksResp(textTracksResult)
        val textTracksJson = gson.toJson(textTracksResponse)
        //  parse(textTracksJson).transformField{case JField(x, v) if x == "value" && v == JString("Company")=> JField("value1",JString("Company1"))}

        returnResponse = textTracksJson
      case None =>
        val resFailed = GetRecTextTracksResultFailed(FAILED, "noCaptionsFound", "No captions found for " + recordId)
        val respFailed = GetRecTextTracksRespFailed(resFailed)
        val failedTxt = gson.toJson(respFailed)

        returnResponse = failedTxt
    }

    returnResponse
  }

  def getRecordingTextTracks(recordId: String, captionsDir: String, captionBaseUrl: String): String = {
    val gson = new Gson()
    var returnResponse: String = ""
    val recordingPath = captionsDir + File.separatorChar + recordId
    if (!Files.exists(Paths.get(recordingPath))) {
      val resFailed = GetRecTextTracksResultFailed(FAILED, "noRecordings", "No recording found for " + recordId)
      val respFailed = GetRecTextTracksRespFailed(resFailed)
      returnResponse = gson.toJson(respFailed)
    } else {
      returnResponse = getRecordingsCaptionsJson(recordId, captionsDir, captionBaseUrl)
    }

    returnResponse
  }

  def saveCaptionsFile(captionsDir: String, captionsTracks: String): Boolean = {
    val path = captionsDir + File.separatorChar + CAPTIONS_FILE
    val fileWriter = new FileWriter(path)
    try {
      fileWriter.write(captionsTracks)
      true
    } catch {
      case ioe: IOException =>
        logger.info("Failed to write caption.json {}", path)
        false
      case ex: Exception =>
        logger.info("Exception while writing {}", path)
        logger.info("Exception details: {}", ex.getMessage)
        false
    } finally {
      fileWriter.flush()
      fileWriter.close()
    }
  }

  def mv(oldName: String, newName: String) =
    Try(new File(oldName).renameTo(new File(newName))).getOrElse(false)

  def saveTrackInfoFile(trackInfoJson: String, trackInfoFilePath: String): Boolean = {
    // Need to create intermediate file to prevent race where the file is processed before
    // contents have been written.
    val tempTrackInfoFilePath = trackInfoFilePath + ".tmp"

    var result = false
    val fileWriter = new FileWriter(tempTrackInfoFilePath)
    try {
      fileWriter.write(trackInfoJson)
      result = true
    } catch {
      case ioe: IOException =>
        logger.info("Failed to write caption.json {}", tempTrackInfoFilePath)
        result = false
      case ex: Exception =>
        logger.info("Exception while writing {}", tempTrackInfoFilePath)
        logger.info("Exception details: {}", ex.getMessage)
        result = false
    } finally {
      fileWriter.flush()
      fileWriter.close()
    }

    if (result) {
      // Rename so that the captions processor will pick up the uploaded captions.
      result = mv(tempTrackInfoFilePath, trackInfoFilePath)
    }

    result
  }

  def putRecordingTextTrack(track: UploadedTrack): String = {
    val trackInfoFilePath = track.inboxDir + File.separatorChar + track.trackId + "-track.json"

    val trackInfo = new UploadedTrackInfo(
      record_id = track.recordId,
      kind = track.kind,
      lang = track.lang,
      label = track.label,
      original_filename = track.origFilename,
      temp_filename = track.tempFilename,
      content_type = track.contentType
    )

    val gson = new Gson()
    val trackInfoJson = gson.toJson(trackInfo)
    val success = saveTrackInfoFile(trackInfoJson, trackInfoFilePath)
    if (success) {
      val result = PutRecTextTrackResult(
        SUCCESS,
        track.recordId,
        messageKey = "upload_text_track_success",
        message = "Text track uploaded successfully"
      )
      val resp = PutRecTextTrackResp(result)
      gson.toJson(resp)
    } else {
      val result = PutRecTextTrackResult(
        FAILED,
        track.recordId,
        messageKey = "upload_text_track_failed",
        message = "Text track upload failed."
      )
      val resp = PutRecTextTrackResp(result)
      gson.toJson(resp)
    }
  }
}
