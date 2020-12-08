package org.bigbluebutton.core.apps.breakout

import org.bigbluebutton.core.running.MeetingActor
import java.net.URLEncoder
import scala.collection.SortedSet
import org.apache.commons.codec.digest.DigestUtils
import org.bigbluebutton.SystemConfiguration

trait BreakoutApp2x extends BreakoutRoomCreatedMsgHdlr
  with BreakoutRoomsListMsgHdlr
  with BreakoutRoomUsersUpdateMsgHdlr
  with CreateBreakoutRoomsCmdMsgHdlr
  with EndAllBreakoutRoomsMsgHdlr
  with UpdateBreakoutRoomsTimeMsgHdlr
  with ChangeUserBreakoutReqMsgHdlr
  with SendMessageToAllBreakoutRoomsMsgHdlr
  with SendMessageToBreakoutRoomInternalMsgHdlr
  with RequestBreakoutJoinURLReqMsgHdlr
  with SetBreakoutRoomInviteDismissedReqMsgHdlr
  with SendBreakoutUsersUpdateMsgHdlr
  with TransferUserToMeetingRequestHdlr
  with EndBreakoutRoomInternalMsgHdlr
  with UpdateBreakoutRoomTimeInternalMsgHdlr
  with EjectUserFromBreakoutInternalMsgHdlr
  with BreakoutRoomEndedInternalMsgHdlr {

  this: MeetingActor =>

}

object BreakoutRoomsUtil extends SystemConfiguration {
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
    checkSumAlgorithmForBreakouts match {
      case "sha1"   => DigestUtils.sha1Hex(s);
      case "sha256" => DigestUtils.sha256Hex(s);
      case "sha384" => DigestUtils.sha384Hex(s);
      case "sha512" => DigestUtils.sha512Hex(s);
      case _        => DigestUtils.sha256Hex(s); // default
    }
  }

  def calculateChecksum(apiCall: String, baseString: String, sharedSecret: String): String = {
    checksum(apiCall.concat(baseString).concat(sharedSecret))
  }

  def joinParams(
      username:          String,
      userId:            String,
      isBreakout:        Boolean,
      breakoutMeetingId: String,
      avatarURL:         String,
      role:              String,
      password:          String
  ): (collection.immutable.Map[String, String], collection.immutable.Map[String, String]) = {
    val moderator = role == "MODERATOR"
    val params = collection.immutable.HashMap(
      "fullName" -> urlEncode(username),
      "userID" -> urlEncode(userId),
      "isBreakout" -> urlEncode(isBreakout.toString()),
      "meetingID" -> urlEncode(breakoutMeetingId),
      "avatarURL" -> urlEncode(avatarURL),
      "userdata-bbb_parent_room_moderator" -> urlEncode(moderator.toString()),
      "password" -> urlEncode(password),
      "redirect" -> urlEncode("true")
    )

    (params, params + ("joinViaHtml5" -> urlEncode("true")))
  }

  def sortParams(params: collection.immutable.Map[String, String]): SortedSet[String] = {
    collection.immutable.SortedSet[String]() ++ params.keySet
  }

  //From the list of parameters we want to pass. Creates a base string with parameters
  //sorted in alphabetical order for us to sign.
  def createBaseString(params: collection.immutable.Map[String, String]): String = {
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
