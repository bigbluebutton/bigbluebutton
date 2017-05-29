package org.bigbluebutton.core.apps

import java.net.URLEncoder

import scala.collection.SortedSet
import scala.collection.mutable
import org.apache.commons.codec.digest.DigestUtils
import org.bigbluebutton.SystemConfiguration
import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.core.api._
import org.bigbluebutton.core.bus.BigBlueButtonEvent
import org.bigbluebutton.core.bus.IncomingEventBus
import org.bigbluebutton.core.models.Users
import org.bigbluebutton.core.running.{ MeetingActor }

trait BreakoutRoomApp extends SystemConfiguration {
  this: MeetingActor =>

  val outGW: OutMessageGateway
  val eventBus: IncomingEventBus

  def handleBreakoutRoomsList(msg: BreakoutRoomsListMessage) {
    val breakoutRooms = liveMeeting.breakoutModel.getRooms().toVector map { r => new BreakoutRoomBody(r.name, r.externalMeetingId, r.id, r.sequence) }
    val roomsReady = liveMeeting.breakoutModel.pendingRoomsNumber == 0 && breakoutRooms.length > 0
    log.info("Sending breakout rooms list to {} with containing {} room(s)", props.meetingProp.intId, breakoutRooms.length)
    outGW.send(new BreakoutRoomsListOutMessage(props.meetingProp.intId, breakoutRooms, roomsReady))
  }

  def handleCreateBreakoutRooms(msg: CreateBreakoutRooms) {
    // If breakout rooms are being created we ignore the coming message
    if (liveMeeting.breakoutModel.pendingRoomsNumber > 0) {
      log.warning("CreateBreakoutRooms event received while {} are pending to be created for meeting {}",
        liveMeeting.breakoutModel.pendingRoomsNumber, props.meetingProp.intId)
      return
    }
    if (liveMeeting.breakoutModel.getNumberOfRooms() > 0) {
      log.warning("CreateBreakoutRooms event received while {} breakout rooms running for meeting {}",
        liveMeeting.breakoutModel.getNumberOfRooms(), props.meetingProp.intId)
      return
    }

    var i = 0
    // in very rare cases the presentation conversion generates an error, what should we do?
    // those cases where default.pdf is deleted from the whiteboard
    val sourcePresentationId = if (!liveMeeting.presModel.getCurrentPresentation().isEmpty) liveMeeting.presModel.getCurrentPresentation().get.id else "blank"
    val sourcePresentationSlide = if (!liveMeeting.presModel.getCurrentPage().isEmpty) liveMeeting.presModel.getCurrentPage().get.num else 0
    liveMeeting.breakoutModel.pendingRoomsNumber = msg.rooms.length;

    for (room <- msg.rooms) {
      i += 1
      val breakoutMeetingId = BreakoutRoomsUtil.createMeetingIds(props.meetingProp.intId, i)
      val voiceConfId = BreakoutRoomsUtil.createVoiceConfId(props.voiceProp.voiceConf, i)
      val r = liveMeeting.breakoutModel.createBreakoutRoom(props.meetingProp.intId, breakoutMeetingId._1, breakoutMeetingId._2, room.name,
        room.sequence, voiceConfId, room.users)
      val p = new BreakoutRoomOutPayload(r.id, r.name, props.meetingProp.intId, r.sequence,
        r.voiceConfId, msg.durationInMinutes, props.password.moderatorPass, props.password.viewerPass,
        sourcePresentationId, sourcePresentationSlide, msg.record)
      outGW.send(new CreateBreakoutRoom(props.meetingProp.intId, p))
    }
    liveMeeting.meetingModel.breakoutRoomsdurationInMinutes = msg.durationInMinutes;
    liveMeeting.meetingModel.breakoutRoomsStartedOn = liveMeeting.timeNowInSeconds;
  }

  def sendJoinURL(userId: String, externalMeetingId: String, roomSequence: String) {
    log.debug("Sending breakout meeting {} Join URL for user: {}", externalMeetingId, userId)
    for {
      user <- Users.findWithId(userId, liveMeeting.users)
      apiCall = "join"
      params = BreakoutRoomsUtil.joinParams(user.name, userId + "-" + roomSequence, true,
        externalMeetingId, props.password.moderatorPass)
      // We generate a first url with redirect -> true
      redirectBaseString = BreakoutRoomsUtil.createBaseString(params._1)
      redirectJoinURL = BreakoutRoomsUtil.createJoinURL(bbbWebAPI, apiCall, redirectBaseString,
        BreakoutRoomsUtil.calculateChecksum(apiCall, redirectBaseString, bbbWebSharedSecret))
      // We generate a second url with redirect -> false
      noRedirectBaseString = BreakoutRoomsUtil.createBaseString(params._2)
      noRedirectJoinURL = BreakoutRoomsUtil.createJoinURL(bbbWebAPI, apiCall, noRedirectBaseString,
        BreakoutRoomsUtil.calculateChecksum(apiCall, noRedirectBaseString, bbbWebSharedSecret))
    } yield outGW.send(new BreakoutRoomJoinURLOutMessage(props.meetingProp.intId,
      props.recordProp.record, externalMeetingId, userId, redirectJoinURL, noRedirectJoinURL))
  }

  def handleRequestBreakoutJoinURL(msg: RequestBreakoutJoinURLInMessage) {
    for {
      breakoutRoom <- liveMeeting.breakoutModel.getRoomWithExternalId(msg.breakoutMeetingId)
    } yield sendJoinURL(msg.userId, msg.breakoutMeetingId, breakoutRoom.sequence.toString())
  }

  def handleBreakoutRoomCreated(msg: BreakoutRoomCreated) {
    liveMeeting.breakoutModel.pendingRoomsNumber -= 1
    val room = liveMeeting.breakoutModel.getBreakoutRoom(msg.breakoutRoomId)
    room foreach { room =>
      sendBreakoutRoomStarted(room.parentRoomId, room.name, room.externalMeetingId, room.id, room.sequence, room.voiceConfId)
    }

    // We postpone sending invitation until all breakout rooms have been created
    if (liveMeeting.breakoutModel.pendingRoomsNumber == 0) {
      log.info("All breakout rooms created for meetingId={}", props.meetingProp.intId)
      liveMeeting.breakoutModel.getRooms().foreach { room =>
        liveMeeting.breakoutModel.getAssignedUsers(room.id) foreach { users =>
          users.foreach { u =>
            log.debug("Sending Join URL for users");
            sendJoinURL(u, room.externalMeetingId, room.sequence.toString())
          }
        }
      }
      handleBreakoutRoomsList(new BreakoutRoomsListMessage(props.meetingProp.intId))
    }
  }

  def sendBreakoutRoomStarted(meetingId: String, breakoutName: String, externalMeetingId: String,
    breakoutMeetingId: String, sequence: Int, voiceConfId: String) {
    log.info("Sending breakout room started {} for parent meeting {} ", breakoutMeetingId, meetingId);
    outGW.send(new BreakoutRoomStartedOutMessage(meetingId, props.recordProp.record, new BreakoutRoomBody(breakoutName,
      externalMeetingId, breakoutMeetingId, sequence)))
  }

  def handleBreakoutRoomEnded(msg: BreakoutRoomEnded) {
    liveMeeting.breakoutModel.remove(msg.breakoutRoomId)
    outGW.send(new BreakoutRoomEndedOutMessage(msg.meetingId, msg.breakoutRoomId))
  }

  def handleBreakoutRoomUsersUpdate(msg: BreakoutRoomUsersUpdate) {
    liveMeeting.breakoutModel.updateBreakoutUsers(msg.breakoutMeetingId, msg.users) foreach { room =>
      outGW.send(new UpdateBreakoutUsersOutMessage(props.meetingProp.intId, props.recordProp.record, msg.breakoutMeetingId, room.users))
    }
  }

  def handleSendBreakoutUsersUpdate(msg: SendBreakoutUsersUpdate) {
    val users = Users.getUsers(liveMeeting.users)
    val breakoutUsers = users map { u => new BreakoutUser(u.externalId, u.name) }
    eventBus.publish(BigBlueButtonEvent(props.breakoutProps.parentId,
      new BreakoutRoomUsersUpdate(props.breakoutProps.parentId, props.meetingProp.intId, breakoutUsers)))
  }

  def handleTransferUserToMeeting(msg: TransferUserToMeetingRequest) {
    var targetVoiceBridge: String = msg.targetMeetingId
    // If the current room is a parent room we fetch the voice bridge from the breakout room
    if (!props.meetingProp.isBreakout) {
      liveMeeting.breakoutModel.getBreakoutRoom(msg.targetMeetingId) match {
        case Some(b) => {
          targetVoiceBridge = b.voiceConfId;
        }
        case None => // do nothing
      }
    } // if it is a breakout room, the target voice bridge is the same after removing the last digit
    else {
      targetVoiceBridge = props.voiceProp.voiceConf.dropRight(1)
    }
    // We check the user from the mode
    Users.findWithId(msg.userId, liveMeeting.users) match {
      case Some(u) => {
        if (u.voiceUser.joined) {
          log.info("Transferring user userId=" + u.id + " from voiceBridge=" + props.voiceProp.voiceConf + " to targetVoiceConf=" + targetVoiceBridge)
          outGW.send(new TransferUserToMeeting(props.voiceProp.voiceConf, targetVoiceBridge, u.voiceUser.userId))
        }
      }
      case None => // do nothing
    }
  }

  def handleEndAllBreakoutRooms(msg: EndAllBreakoutRooms) {
    log.info("EndAllBreakoutRooms event received for meetingId={}", props.meetingProp.intId)
    liveMeeting.breakoutModel.getRooms().foreach { room =>
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
    val apiURL = if (webAPI.endsWith("/")) webAPI else webAPI.concat("/")
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
    password: String): (mutable.Map[String, String], mutable.Map[String, String]) = {
    val params = collection.mutable.HashMap(
      "fullName" -> urlEncode(username),
      "userID" -> urlEncode(userId),
      "isBreakout" -> urlEncode(isBreakout.toString()),
      "meetingID" -> urlEncode(breakoutMeetingId),
      "password" -> urlEncode(password))

    (params += "redirect" -> urlEncode("true"), mutable.Map[String, String]() ++= params += "redirect" -> urlEncode("false"))
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
