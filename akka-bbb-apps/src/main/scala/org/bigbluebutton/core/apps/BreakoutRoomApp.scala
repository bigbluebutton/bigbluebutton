package org.bigbluebutton.core.apps

import org.bigbluebutton.core.api._
import scala.collection.mutable.ArrayBuffer
import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.SystemConfiguration
import org.apache.commons.codec.digest.DigestUtils
import scala.collection._
import scala.collection.SortedSet
import org.apache.commons.lang3.StringUtils
import java.net.URLEncoder
import scala.collection.immutable.StringOps
import org.bigbluebutton.core.LiveMeeting

trait BreakoutRoomApp extends SystemConfiguration {
  this: LiveMeeting =>

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

  def sendJoinURL(userId: String, breakoutId: String) {
    for {
      user <- usersModel.getUser(userId)
      apiCall = "join"
      params = BreakoutRoomsUtil.joinParams(user.name, true, breakoutId, bbbWebModeratorPassword, true)
      baseString = BreakoutRoomsUtil.createBaseString(params)
      checksum = BreakoutRoomsUtil.calculateChecksum(apiCall, baseString, bbbWebSharedSecret)
      joinURL = BreakoutRoomsUtil.createJoinURL(bbbWebAPI, apiCall, baseString, checksum)
    } yield outGW.send(new BreakoutRoomJoinURL(mProps.meetingID, mProps.recorded, breakoutId,
      userId, joinURL))
  }

  def sendBreakoutRoomCreated(meetingId: String, breakoutName: String, breakoutId: String, voiceConfId: String) {
    // outGW.send(msg)  
  }

  def handleBreakoutRoomCreated(msg: BreakoutRoomCreated) {
    breakoutModel.getBreakoutRoom(msg.breakoutRoomId) foreach { room =>
      sendBreakoutRoomCreated(mProps.meetingID, room.name, room.id, room.voiceConfId)
    }

    breakoutModel.getAssignedUsers(msg.breakoutRoomId) foreach { users =>
      users.foreach { u => sendJoinURL(u, msg.breakoutRoomId) }
    }
  }

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

  def createJoinURL(webAPI: String, apiCall: String, baseString: String, checksum: String): String = {
    var apiURL = if (webAPI.endsWith("/")) webAPI else webAPI.concat("/")
    apiURL.concat(apiCall).concat("?").concat(baseString).concat("&checksum=").concat(checksum)
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

  def joinParams(username: String, isBreakout: Boolean, breakoutId: String,
    password: String, redirect: Boolean): mutable.Map[String, String] = {
    val params = new collection.mutable.HashMap[String, String]
    params += "fullName" -> urlEncode(username)
    params += "isBreakout" -> urlEncode(isBreakout.toString())
    params += "meetingID" -> urlEncode(breakoutId)
    params += "password" -> urlEncode(password)
    params += "redirect" -> urlEncode(redirect.toString())

    params
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