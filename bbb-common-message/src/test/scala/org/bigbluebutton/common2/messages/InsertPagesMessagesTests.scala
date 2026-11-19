package org.bigbluebutton.common2.messages

import java.util

import org.bigbluebutton.common2.UnitSpec2
import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.common2.util.JsonUtil

import scala.util.Success

// The messages of the insert of pages, and the fields other messages gained for it: decoded from the
// JSON other processes send, and refused when a field is missing (JsonUtil fails on missing creator
// properties, so every producer always sends every field).
class InsertPagesMessagesTests extends UnitSpec2 {

  private val pageId = "3f2b8c1e-5d4a-4f6b-9c7d-0e1a2b3c4d5e"
  private val presId = "0123456789abcdef0123456789abcdef01234567-1793037924284"

  private def withoutField(json: String, field: String): String = {
    val node = JsonUtil.fromJson[java.util.Map[String, Object]](json).get
    node.remove(field)
    JsonUtil.toJson(node)
  }

  private def roundTrips[T: Manifest](body: T, requiredField: String): Unit = {
    val json = JsonUtil.toJson(body)
    assert(JsonUtil.fromJson[T](json) == Success(body))
    assert(JsonUtil.fromJson[T](withoutField(json, requiredField)).isFailure)
  }

  private def breakoutRoomDetail(sourcePresentationPageId: String) = BreakoutRoomDetail(
    "breakout-1", "Room 1", "parent-1", 1, "R1", isDefaultName = true, freeJoin = false, "613-555-1234", "72011",
    1800, "mp", "ap", presId, 2, record = false, autoStartRecording = false, allowStartStopRecording = true,
    privateChatEnabled = true, captureNotes = false, captureSlides = false, "notes", "slides",
    new util.HashMap[String, AnyRef](), new util.ArrayList[String](), "bbb-webrtc-sfu", "bbb-webrtc-sfu",
    "bbb-webrtc-sfu", disablePrivChat = false, disableCam = false, disableMic = false, disablePubChat = false,
    disableNotes = false, hideUserList = false, lockOnJoin = true, lockOnJoinConfigurable = false,
    hideViewersCursor = false, hideViewersAnnotation = false, webcamsOnlyForModerator = false,
    sourcePresentationPageId = sourcePresentationPageId
  )

  "BreakoutRoomDetail" should "carry sourcePresentationPageId" in {
    roundTrips(breakoutRoomDetail(pageId), "sourcePresentationPageId")
  }

  it should "carry an empty sourcePresentationPageId when the room takes the whole presentation" in {
    val detail = breakoutRoomDetail("")
    assert(JsonUtil.fromJson[BreakoutRoomDetail](JsonUtil.toJson(detail)) == Success(detail))
  }
}
