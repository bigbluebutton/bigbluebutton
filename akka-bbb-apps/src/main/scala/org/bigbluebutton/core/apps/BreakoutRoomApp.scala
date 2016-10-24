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

  def handleBreakoutRoomsList(msg: BreakoutRoomsListMessage) {
    val breakoutRooms = breakoutModel.getRooms().toVector map { r => new BreakoutRoomBody(r.name, r.externalMeetingId, r.id, r.sequence) }
    val roomsReady = breakoutModel.pendingRoomsNumber == 0 && breakoutRooms.length > 0
    log.info("Sending breakout rooms list to {} with containing {} room(s)", mProps.meetingID, breakoutRooms.length)
    outGW.send(new BreakoutRoomsListOutMessage(mProps.meetingID, breakoutRooms, roomsReady))
  }

  def handleCreateBreakoutRooms(msg: CreateBreakoutRooms) {
    // If breakout rooms are being created we ignore the coming message
    if (breakoutModel.pendingRoomsNumber > 0) {
      log.warning("CreateBreakoutRooms event received while {} are pending to be created for meeting {}", breakoutModel.pendingRoomsNumber, mProps.meetingID)
      return
    }
    if (breakoutModel.getNumberOfRooms() > 0) {
      log.warning("CreateBreakoutRooms event received while {} breakout rooms running for meeting {}", breakoutModel.getNumberOfRooms(), mProps.meetingID)
      return
    }

    var i = 0
    // in very rare cases the presentation conversion generates an error, what should we do?
    // those cases where default.pdf is deleted from the whiteboard
    val sourcePresentationId = if (!presModel.getCurrentPresentation().isEmpty) presModel.getCurrentPresentation().get.id else "blank"
    val sourcePresentationSlide = if (!presModel.getCurrentPage().isEmpty) presModel.getCurrentPage().get.num else 0
    breakoutModel.pendingRoomsNumber = msg.rooms.length;
    breakoutModel.redirectOnJoin = msg.redirectOnJoin;

    for (room <- msg.rooms) {
      i += 1
      val breakoutMeetingId = BreakoutRoomsUtil.createMeetingIds(mProps.meetingID, i)
      val voiceConfId = BreakoutRoomsUtil.createVoiceConfId(mProps.voiceBridge, i)
      val r = breakoutModel.createBreakoutRoom(mProps.meetingID, breakoutMeetingId._1, breakoutMeetingId._2, room.name,
        room.sequence, voiceConfId, room.users)
      val p = new BreakoutRoomOutPayload(r.id, r.name, mProps.meetingID, r.sequence,
        r.voiceConfId, msg.durationInMinutes, mProps.moderatorPass, mProps.viewerPass,
        sourcePresentationId, sourcePresentationSlide, msg.record)
      outGW.send(new CreateBreakoutRoom(mProps.meetingID, p))
    }
    meetingModel.breakoutRoomsdurationInMinutes = msg.durationInMinutes;
    meetingModel.breakoutRoomsStartedOn = timeNowInSeconds;
  }

  def sendJoinURL(userId: String, externalMeetingId: String, redirect: Boolean) {
    log.debug("Sending breakout meeting {} Join URL for user: {}", externalMeetingId, userId);
    for {
      user <- usersModel.getUser(userId)
      apiCall = "join"
      params = BreakoutRoomsUtil.joinParams(user.name, userId, true, externalMeetingId, mProps.moderatorPass, redirect)
      baseString = BreakoutRoomsUtil.createBaseString(params)
      checksum = BreakoutRoomsUtil.calculateChecksum(apiCall, baseString, bbbWebSharedSecret)
      joinURL = BreakoutRoomsUtil.createJoinURL(bbbWebAPI, apiCall, baseString, checksum)
    } yield outGW.send(new BreakoutRoomJoinURLOutMessage(mProps.meetingID, mProps.recorded, externalMeetingId, userId, joinURL))
  }

  def handleRequestBreakoutJoinURL(msg: RequestBreakoutJoinURLInMessage) {
    sendJoinURL(msg.userId, msg.breakoutMeetingId, msg.redirect)
  }

  def handleBreakoutRoomCreated(msg: BreakoutRoomCreated) {
    breakoutModel.pendingRoomsNumber -= 1
    val room = breakoutModel.getBreakoutRoom(msg.breakoutRoomId)
    room foreach { room =>
      sendBreakoutRoomStarted(room.parentRoomId, room.name, room.externalMeetingId, room.id, room.sequence, room.voiceConfId)
    }

    // We postpone sending invitation until all breakout rooms have been created
    if (breakoutModel.pendingRoomsNumber == 0) {
      log.info("All breakout rooms created for meetingId={}", mProps.meetingID)
      breakoutModel.getRooms().foreach { room =>
        breakoutModel.getAssignedUsers(room.id) foreach { users =>
          users.foreach { u =>
            log.debug("Sending Join URL for users");
            sendJoinURL(u, room.externalMeetingId, breakoutModel.redirectOnJoin)
          }
        }
      }
      handleBreakoutRoomsList(new BreakoutRoomsListMessage(mProps.meetingID))
    }
  }

  def sendBreakoutRoomStarted(meetingId: String, breakoutName: String, externalMeetingId: String, breakoutMeetingId: String, sequence: Int, voiceConfId: String) {
    log.info("Sending breakout room started {} for parent meeting {} ", breakoutMeetingId, meetingId);
    outGW.send(new BreakoutRoomStartedOutMessage(meetingId, mProps.recorded, new BreakoutRoomBody(breakoutName, externalMeetingId, breakoutMeetingId, sequence)))
  }

  def handleBreakoutRoomEnded(msg: BreakoutRoomEnded) {
    breakoutModel.remove(msg.breakoutRoomId)
    outGW.send(new BreakoutRoomEndedOutMessage(msg.meetingId, msg.breakoutRoomId))
  }

  def handleBreakoutRoomUsersUpdate(msg: BreakoutRoomUsersUpdate) {
    breakoutModel.updateBreakoutUsers(msg.breakoutMeetingId, msg.users) foreach { room =>
      outGW.send(new UpdateBreakoutUsersOutMessage(mProps.meetingID, mProps.recorded, msg.breakoutMeetingId, room.users))
    }
  }

  def handleSendBreakoutUsersUpdate(msg: SendBreakoutUsersUpdate) {
    val users = usersModel.getUsers().toVector
    val breakoutUsers = users map { u => new BreakoutUser(u.externUserID, u.name) }
    eventBus.publish(BigBlueButtonEvent(mProps.parentMeetingID,
      new BreakoutRoomUsersUpdate(mProps.parentMeetingID, mProps.meetingID, breakoutUsers)))
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
    // We check the user from the mode
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
  def createMeetingIds(id: String, index: Int): (String, String) = {
    val timeStamp = System.currentTimeMillis()
    val externalHash = DigestUtils.sha1Hex(id.concat("-").concat(timeStamp.toString()).concat("-").concat(index.toString()))
    val externalId = externalHash.concat("-").concat(timeStamp.toString())
    val internalId = DigestUtils.sha1Hex(externalId).concat("-").concat(timeStamp.toString())
    (internalId, externalId)
  }

  def createVoiceConfId(id: String, index: Int): String = {
    id.concat(index.toString())
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

  def joinParams(username: String, userId: String, isBreakout: Boolean, breakoutMeetingId: String,
                 password: String, redirect: Boolean): mutable.Map[String, String] = {
    val params = new collection.mutable.HashMap[String, String]
    params += "fullName" -> urlEncode(username)
    params += "userID" -> urlEncode(userId + "-" + breakoutMeetingId.substring(breakoutMeetingId.lastIndexOf("-") + 1));
    params += "isBreakout" -> urlEncode(isBreakout.toString())
    params += "meetingID" -> urlEncode(breakoutMeetingId)
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
}
