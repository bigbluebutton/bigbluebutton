package org.bigbluebutton.core.apps

import org.bigbluebutton.core.api._
import scala.collection.mutable.ArrayBuffer
import org.bigbluebutton.core.MeetingActor
import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.SystemConfiguration
import org.apache.commons.codec.digest.DigestUtils
import scala.collection._
import scala.collection.SortedSet
import org.apache.commons.lang3.StringUtils
import java.net.URLEncoder
import scala.collection.immutable.StringOps

trait BreakoutRoomApp extends SystemConfiguration {
  this: MeetingActor =>

  val outGW: OutMessageGateway

  def getDefaultPresentationURL(): String = {
    var presURL = bbbWebDefaultPresentationURL
    val page = presModel.getCurrentPage()
    page foreach { p =>
      presURL = BreakoutRoomsUtil.fromSWFtoPDF(p.swfUri)
    }
    presURL
  }

  def handleCreateBreakoutRooms(msg: CreateBreakoutRooms) {
    var i = 0
    for (room <- msg.rooms) {
      i += 1
      val presURL = getDefaultPresentationURL()
      val breakoutMeetingId = BreakoutRoomsUtil.createMeetingId(mProps.meetingID, i)
      val voiceConfId = BreakoutRoomsUtil.createVoiceConfId(mProps.voiceBridge, i)
      val r = breakoutModel.createBreakoutRoom(breakoutMeetingId, room.name, voiceConfId, room.users, presURL)
      val p = new BreakoutRoomOutPayload(r.id, r.name, mProps.meetingID,
        r.voiceConfId, msg.durationInMinutes, bbbWebModeratorPassword, bbbWebViewerPassword,
        r.defaultPresentationURL)
      outGW.send(new CreateBreakoutRoom(mProps.meetingID, mProps.recorded, p))
    }

  }

  /*  
  def createBreakoutRoom():BreakoutRoom = {
    for {
      presPage <- presModel.getCurrentPage
      curPDF <- getCurrentPagePDF(presPage) 
      
    }
  }
*/
}

object BreakoutRoomsUtil {
  def createMeetingId(id: String, index: Int): String = {
    id.concat("-").concat(index.toString())
  }

  def createVoiceConfId(id: String, index: Int): String = {
    id.concat(index.toString())
  }

  def fromSWFtoPDF(swfURL: String): String = {
    swfURL.replace("swf", "pdf")
  }

  //
  //checksum() -- Return a checksum based on SHA-1 digest
  //
  def checksum(s: String): String = {
    DigestUtils.sha1Hex(s);
  }

  def calculateChecksum(apiCall: String, baseString: String, sharedSecret: String): String = {
    checksum(apiCall.concat(baseString).concat(sharedSecret))
  }

  def sortParams(params: mutable.Map[String, String]): SortedSet[String] = {
    collection.immutable.SortedSet[String]() ++ params.keySet
  }

  //From the list of parameters we want to pass. Creates a base string with parameters
  //sorted in alphabetical order for us to sign.
  def createBaseString(params: mutable.Map[String, String]): String = {
    val csbuf = new StringBuffer()
    val keys = sortParams(params)

    var first = true;
    for (key <- keys) {
      for (value <- params.get(key)) {
        if (first) {
          first = false;
        } else {
          csbuf.append("&");
        }

        csbuf.append(key);
        csbuf.append("=");
        csbuf.append(value);
        println(key + "=" + value)
      }
    }

    return csbuf.toString();
  }

  def urlEncode(s: String): String = {
    URLEncoder.encode(s, "UTF-8");
  }

  //
  //encodeURIComponent() -- Java encoding similiar to JavaScript encodeURIComponent
  //
  def encodeURIComponent(component: String): String = {
    URLEncoder.encode(component, "UTF-8")
      .replaceAll("\\%28", "(")
      .replaceAll("\\%29", ")")
      .replaceAll("\\+", "%20")
      .replaceAll("\\%27", "'")
      .replaceAll("\\%21", "!")
      .replaceAll("\\%7E", "~")
  }

}