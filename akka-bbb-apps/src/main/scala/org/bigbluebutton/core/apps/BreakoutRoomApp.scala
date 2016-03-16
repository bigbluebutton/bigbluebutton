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
import org.bigbluebutton.core.bus.IncomingEventBus
import org.bigbluebutton.core.bus.BigBlueButtonEvent

trait BreakoutRoomApp extends SystemConfiguration {
  this: LiveMeeting =>

  val outGW: OutMessageGateway
  val eventBus: IncomingEventBus

  def getDefaultPresentationURL(): String = {
    var presURL = bbbWebDefaultPresentationURL
    val page = presModel.getCurrentPage()
    page foreach { p =>
      presURL = BreakoutRoomsUtil.fromSWFtoPDF(p.swfUri)
    }
    presURL
  }

  def handleBreakoutRoomsList(msg: BreakoutRoomsListMessage) {
    val breakoutRooms = breakoutModel.getRooms().toVector map { r => new BreakoutRoomBody(r.name, r.id) }
    outGW.send(new BreakoutRoomsListOutMessage(mProps.meetingID, breakoutRooms));
  }

  def handleCreateBreakoutRooms(msg: CreateBreakoutRooms) {
    var i = 0
    for (room <- msg.rooms) {
      i += 1
      val presURL = bbbWebDefaultPresentationURL
      val breakoutMeetingId = BreakoutRoomsUtil.createMeetingId(mProps.meetingID, i)
      val voiceConfId = BreakoutRoomsUtil.createVoiceConfId(mProps.voiceBridge, i)
      val r = breakoutModel.createBreakoutRoom(breakoutMeetingId, room.name, voiceConfId, room.users, presURL)
      val p = new BreakoutRoomOutPayload(r.id, r.name, mProps.meetingID,
        r.voiceConfId, msg.durationInMinutes, bbbWebModeratorPassword, bbbWebViewerPassword,
        r.defaultPresentationURL)
      outGW.send(new CreateBreakoutRoom(mProps.meetingID, mProps.recorded, p))
    }
    meetingModel.breakoutRoomsdurationInMinutes = msg.durationInMinutes;
    meetingModel.breakoutRoomsStartedOn = timeNowInSeconds;
  }

  def sendJoinURL(userId: String, breakoutId: String) {
    for {
      user <- usersModel.getUser(userId)
      apiCall = "join"
      params = BreakoutRoomsUtil.joinParams(user.name, true, breakoutId, bbbWebModeratorPassword, true)
      baseString = BreakoutRoomsUtil.createBaseString(params)
      checksum = BreakoutRoomsUtil.calculateChecksum(apiCall, baseString, bbbWebSharedSecret)
      joinURL = BreakoutRoomsUtil.createJoinURL(bbbWebAPI, apiCall, baseString, checksum)
    } yield outGW.send(new BreakoutRoomJoinURLOutMessage(mProps.meetingID, mProps.recorded, breakoutId, userId, joinURL))
  }

  def handleRequestBreakoutJoinURL(msg: RequestBreakoutJoinURLInMessage) {
    sendJoinURL(msg.userId, msg.breakoutId)
  }

  def handleBreakoutRoomCreated(msg: BreakoutRoomCreated) {
    val room = breakoutModel.getBreakoutRoom(msg.breakoutRoomId)
    room foreach { room =>
      sendBreakoutRoomStarted(mProps.meetingID, room.name, room.id, room.voiceConfId)
    }

    breakoutModel.getAssignedUsers(msg.breakoutRoomId) foreach { users =>
      users.foreach { u =>
        sendJoinURL(u, msg.breakoutRoomId)
      }
    }
  }

  def sendBreakoutRoomStarted(meetingId: String, breakoutName: String, breakoutId: String, voiceConfId: String) {
    outGW.send(new BreakoutRoomStartedOutMessage(meetingId, mProps.recorded, new BreakoutRoomBody(breakoutName, breakoutId)))
  }

  def handleBreakoutRoomEnded(msg: BreakoutRoomEnded) {
    breakoutModel.remove(msg.breakoutRoomId)
    outGW.send(new BreakoutRoomEndedOutMessage(msg.meetingId, msg.breakoutRoomId))
  }

  def handleBreakoutRoomUsersUpdate(msg: BreakoutRoomUsersUpdate) {
    breakoutModel.updateBreakoutUsers(msg.breakoutId, msg.users) foreach { room =>
      outGW.send(new UpdateBreakoutUsersOutMessage(mProps.meetingID, mProps.recorded, msg.breakoutId, room.users))
    }
  }

  def handleSendBreakoutUsersUpdate(msg: SendBreakoutUsersUpdate) {
    val users = usersModel.getUsers().toVector
    val breakoutUsers = users map { u => new BreakoutUser(u.userID, u.name) }
    eventBus.publish(BigBlueButtonEvent(mProps.externalMeetingID,
      new BreakoutRoomUsersUpdate(mProps.externalMeetingID, mProps.meetingID, breakoutUsers)))
  }

  def handleTransferUserToMeeting(msg: TransferUserToMeetingRequest) {
    var targetVoiceBridge: String = msg.targetMeetingId
    // If the current room is a parent room we fetch the voice bridge from the breakout room
    if (!mProps.isBreakout) {
      breakoutModel.getBreakoutRoom(msg.targetMeetingId) match {
        case Some(b) => {
          targetVoiceBridge = b.voiceConfId;
        }
        case None => // do nothing
      }
    } // if it is a breakout room, the target voice bridge is the same after removing the last digit
    else {
      targetVoiceBridge = mProps.voiceBridge.dropRight(1)
    }
    // We check the iser from the mode
    usersModel.getUser(msg.userId) match {
      case Some(u) => {
        if (u.voiceUser.joined) {
          log.info("Transferring user userId=" + u.userID + " from voiceBridge=" + mProps.voiceBridge + " to targetVoiceConf=" + targetVoiceBridge)
          outGW.send(new TransferUserToMeeting(mProps.voiceBridge, targetVoiceBridge, u.voiceUser.userId))
        }
      }
      case None => // do nothing
    }
  }

  def handleEndAllBreakoutRooms(msg: EndAllBreakoutRooms) {
    log.info("EndAllBreakoutRooms event received for meetingId={}", mProps.meetingID)
    breakoutModel.getRooms().foreach { room =>
      outGW.send(new EndBreakoutRoom(room.id))
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