package org.bigbluebutton.common2.messages

import java.util

import org.bigbluebutton.common2.UnitSpec2
import org.bigbluebutton.common2.domain.{ PageVO, PresentationPageConvertedVO }
import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.common2.util.JsonUtil

import scala.util.{ Failure, Success }

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

  "PresentationUploadTokenReqMsgBody" should "decode the body bbb-graphql-actions sends with an intent" in {
    JsonUtil.fromJson[PresentationUploadTokenReqMsgBody](
      s"""{"podId":"DEFAULT_PRESENTATION_POD","filename":"more.pdf","uploadTemporaryId":"tmp-1",
         |"insertIntoPresentationId":"$presId","insertAtPosition":3,"insertSeenTotalPages":10,"insertNavigate":true}""".stripMargin
    ) match {
      case Success(body) => assert(body == PresentationUploadTokenReqMsgBody("DEFAULT_PRESENTATION_POD", "more.pdf", "tmp-1", presId, 3, 10, true))
      case Failure(ex)   => fail(ex)
    }
  }

  it should "decode the empty intent of an upload that is not an insert" in {
    roundTrips(PresentationUploadTokenReqMsgBody("DEFAULT_PRESENTATION_POD", "slides.pdf", "tmp-1", "", 0, 0, false),
      "insertIntoPresentationId")
  }

  it should "refuse the body of a previous version, without the intent" in {
    assert(JsonUtil.fromJson[PresentationUploadTokenReqMsgBody](
      """{"podId":"DEFAULT_PRESENTATION_POD","filename":"slides.pdf","uploadTemporaryId":"tmp-1"}"""
    ).isFailure)
  }

  "PresentationUploadTokenSysPubMsgBody" should "carry the intent, with insertRequestPageId" in {
    roundTrips(PresentationUploadTokenSysPubMsgBody("DEFAULT_PRESENTATION_POD", "token", "more.pdf", "meeting-1", "upload-1",
      presId, 3, 10, true, pageId), "insertRequestPageId")
  }

  it should "carry the empty intent of an upload that is not an insert" in {
    roundTrips(PresentationUploadTokenSysPubMsgBody("DEFAULT_PRESENTATION_POD", "token", "slides.pdf", "meeting-1", "upload-1",
      "", 0, 0, false, ""), "insertNavigate")
  }

  "InsertBlankPagePubMsgBody" should "decode the body bbb-graphql-actions sends" in {
    JsonUtil.fromJson[InsertBlankPagePubMsgBody](
      s"""{"podId":"DEFAULT_PRESENTATION_POD","presentationId":"$presId","position":2,"seenTotalPages":5,"navigate":true}"""
    ) match {
      case Success(body) => assert(body == InsertBlankPagePubMsgBody("DEFAULT_PRESENTATION_POD", presId, 2, 5, true))
      case Failure(ex)   => fail(ex)
    }
    roundTrips(InsertBlankPagePubMsgBody("DEFAULT_PRESENTATION_POD", presId, 2, 5, navigate = false), "seenTotalPages")
  }

  "PresentationInsertBlankPageSysMsgBody" should "carry the intent, the requester and the size" in {
    roundTrips(PresentationInsertBlankPageSysMsgBody("DEFAULT_PRESENTATION_POD", presId, 2, 5, true, pageId, "w_user",
      "upload-1", "blank.pdf", 595, 842), "height")
  }

  "PresentationInsertPagesProgressSysMsgBody" should "carry the stage and the counts" in {
    roundTrips(PresentationInsertPagesProgressSysMsgBody("DEFAULT_PRESENTATION_POD", "upload-1", "transfer", 0, 0), "stage")
  }

  "PresentationInsertPagesPageSysMsgBody" should "carry the whole page, with its text" in {
    val page = PresentationPageConvertedVO(pageId, 1, Map("svg" -> "https://host/svg/x"), "text of the page",
      current = false, 595.0, 842.0, "token")
    roundTrips(PresentationInsertPagesPageSysMsgBody("DEFAULT_PRESENTATION_POD", "upload-1", page), "page")
  }

  "PresentationInsertPagesReadySysMsgBody" should "carry the page ids in the order of the file" in {
    roundTrips(PresentationInsertPagesReadySysMsgBody("DEFAULT_PRESENTATION_POD", presId, "upload-1", 200,
      Vector(pageId, "8a7b6c5d-4e3f-4a1b-8c9d-0e1f2a3b4c5d")), "maxNumPages")
  }

  "PresentationInsertPagesFailedSysMsgBody" should "carry the error key and the detail" in {
    roundTrips(PresentationInsertPagesFailedSysMsgBody("DEFAULT_PRESENTATION_POD", "upload-1", "failed", "why"), "errorKey")
  }

  "PresentationInsertPagesDiscardSysMsgBody" should "carry the target and the page ids" in {
    roundTrips(PresentationInsertPagesDiscardSysMsgBody("meeting-1", presId, Vector(pageId)), "pageIds")
  }

  "PresentationPagesInsertedEvtMsgBody" should "carry the position, the inserted pages and every page id" in {
    val page = PageVO(id = pageId, num = 3, thumbUri = "t", txtUri = "x", svgUri = "s", pageToken = "token")
    val body = PresentationPagesInsertedEvtMsgBody("DEFAULT_PRESENTATION_POD", presId, 3, Vector(page),
      Vector("1a2b3c4d-0000-4000-8000-000000000001", "1a2b3c4d-0000-4000-8000-000000000002", pageId))
    roundTrips(body, "insertedAt")
    roundTrips(body, "pageIds")
  }
}
