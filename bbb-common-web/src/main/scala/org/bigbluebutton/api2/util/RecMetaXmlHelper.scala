package org.bigbluebutton.api2.util

import java.io.{File, FileOutputStream, FileWriter, IOException}
import java.nio.channels.Channels
import java.nio.charset.StandardCharsets
import java.util

import com.google.gson.Gson
import org.apache.commons.io.FileUtils
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
  val CAPTIONS_FILE = "captions.json"

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

	def getRecordingTextTracks(recordId: String, captionsDir: String):String = {
		val gson = new Gson()
		var returnResponse:String = ""
		val captionsFilePath = captionsDir + File.separatorChar + recordId + File.separatorChar + CAPTIONS_FILE

		readCaptionJsonFile(captionsFilePath, StandardCharsets.UTF_8) match {
			case Some(captions) =>
				val ctracks = gson.fromJson(captions, classOf[util.ArrayList[Track]])
				val result1 = GetRecTextTracksResult(SUCCESS, ctracks)
				val response1 = GetRecTextTracksResp(result1)
				val respText1 = gson.toJson(response1)

				returnResponse = respText1
			case None =>
				val resFailed = GetRecTextTracksResultFailed(FAILED, "noCaptionsFound", "No captions found for " + recordId)
				val respFailed = GetRecTextTracksRespFailed(resFailed)
				val failedTxt = gson.toJson(respFailed)

				returnResponse = failedTxt
		}

		returnResponse
	}

  def saveCaptionsFile(captionsDir:String, captionsTracks: String):Boolean = {
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


	def saveTrackInfoFile(trackInfoJson:String, trackInfoFilePath: String):Boolean = {
		var result = false
		val fileWriter = new FileWriter(trackInfoFilePath)
		try {
			fileWriter.write(trackInfoJson)
			result = true
		} catch {
			case ioe: IOException =>
				logger.info("Failed to write caption.json {}", trackInfoFilePath)
				result = false
			case ex: Exception =>
				logger.info("Exception while writing {}", trackInfoFilePath)
				logger.info("Exception details: {}", ex.getMessage)
				result = false
		} finally {
			fileWriter.flush()
			fileWriter.close()
		}

		result
	}

	def putRecordingTextTrack(track: UploadedTrack):String = {
		val trackInfoFilePath = track.inboxDir + File.separatorChar + track.trackId + "-track.json"

		val trackInfo = new UploadedTrackInfo(recordId = track.recordId,
			kind = track.kind,
			lang = track.lang,
			label = track.label,
			origFilename = track.origFilename)

		val gson = new Gson()
		val trackInfoJson = gson.toJson(trackInfo)
		val success = saveTrackInfoFile(trackInfoJson, trackInfoFilePath)
		if (success) {
			val result = PutRecTextTrackResult(SUCCESS,
				track.recordId,
				messageKey = "upload_text_track_success",
				message = "Text track uploaded successfully")
			val resp = PutRecTextTrackResp(result)
			gson.toJson(resp)
		} else {
			val result = PutRecTextTrackResult(FAILED,
				track.recordId,
				messageKey = "upload_text_track_failed",
				message = "Text track upload failed.")
			val resp = PutRecTextTrackResp(result)
			gson.toJson(resp)
		}
	}
}
