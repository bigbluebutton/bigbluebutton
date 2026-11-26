package org.bigbluebutton.common2.messages

import org.bigbluebutton.common2.UnitSpec2
import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.common2.util.JsonUtil

import scala.util.{ Failure, Success }

// Every message that carries the page position next to the page id: decoded from the JSON other
// processes send, and refused when a field is missing (JsonUtil fails on missing creator properties).
class PageIdMessagesTests extends UnitSpec2 {

  private val pageId = "3f2b8c1e-5d4a-4f6b-9c7d-0e1a2b3c4d5e"
  private val presId = "0123456789abcdef0123456789abcdef01234567-1793037924284"

  "SetCurrentPageByNumPubMsgBody" should "decode the body bbb-graphql-actions sends" in {
    JsonUtil.fromJson[SetCurrentPageByNumPubMsgBody](
      s"""{"podId":"DEFAULT_PRESENTATION_POD","presentationId":"$presId","pageNum":3,"seenTotalPages":10}"""
    ) match {
      case Success(body) => assert(body == SetCurrentPageByNumPubMsgBody("DEFAULT_PRESENTATION_POD", presId, 3, 10))
      case Failure(ex)   => fail(ex)
    }
  }

  it should "decode an unknown seen total, sent as 0" in {
    JsonUtil.fromJson[SetCurrentPageByNumPubMsgBody](
      s"""{"podId":"DEFAULT_PRESENTATION_POD","presentationId":"$presId","pageNum":2,"seenTotalPages":0}"""
    ) match {
      case Success(body) => assert(body.seenTotalPages == 0 && body.pageNum == 2)
      case Failure(ex)   => fail(ex)
    }
  }

  it should "refuse a body without seenTotalPages" in {
    assert(JsonUtil.fromJson[SetCurrentPageByNumPubMsgBody](
      s"""{"podId":"DEFAULT_PRESENTATION_POD","presentationId":"$presId","pageNum":2}"""
    ).isFailure)
  }

  "SetCurrentPageEvtMsgBody" should "carry pageNum next to pageId" in {
    val body = SetCurrentPageEvtMsgBody("DEFAULT_PRESENTATION_POD", presId, pageId, 4)
    assert(JsonUtil.fromJson[SetCurrentPageEvtMsgBody](JsonUtil.toJson(body)) == Success(body))
    assert(JsonUtil.fromJson[SetCurrentPageEvtMsgBody](
      s"""{"podId":"DEFAULT_PRESENTATION_POD","presentationId":"$presId","pageId":"$pageId"}"""
    ).isFailure)
  }

  "SendCursorPositionEvtMsgBody" should "carry pageRefs" in {
    val body = SendCursorPositionEvtMsgBody(pageId, userIsViewer = false, hiddenForLockedViewers = false, 10.5, 20.25,
      Map(pageId -> PageRef(presId, 2)))
    assert(JsonUtil.fromJson[SendCursorPositionEvtMsgBody](JsonUtil.toJson(body)) == Success(body))
  }

  it should "accept empty pageRefs for an id that is not a page" in {
    JsonUtil.fromJson[SendCursorPositionEvtMsgBody](
      """{"whiteboardId":"deskshare","userIsViewer":true,"hiddenForLockedViewers":false,"xPercent":1.0,"yPercent":2.0,"pageRefs":{}}"""
    ) match {
      case Success(body) => assert(body.pageRefs.isEmpty)
      case Failure(ex)   => fail(ex)
    }
  }

  "SendWhiteboardAnnotationsEvtMsgBody" should "carry one PageRef per page of the batch" in {
    val other = "8a7b6c5d-4e3f-4a1b-8c9d-0e1f2a3b4c5d"
    val annotations = Array(AnnotationVO("shape:a", Map("x" -> 1), pageId, "u1"), AnnotationVO("shape:b", Map("x" -> 2), other, "u1"))
    val refs = Map(pageId -> PageRef(presId, 1), other -> PageRef(presId, 5))
    val json = JsonUtil.toJson(SendWhiteboardAnnotationsEvtMsgBody(pageId, annotations, refs))
    JsonUtil.fromJson[SendWhiteboardAnnotationsEvtMsgBody](json) match {
      case Success(body) =>
        assert(body.whiteboardId == pageId)
        assert(body.annotations.map(a => (a.id, a.wbId)).toList == List(("shape:a", pageId), ("shape:b", other)))
        assert(body.pageRefs == refs)
      case Failure(ex) => fail(ex)
    }
  }

  it should "refuse a body without pageRefs" in {
    assert(JsonUtil.fromJson[SendWhiteboardAnnotationsEvtMsgBody](s"""{"whiteboardId":"$pageId","annotations":[]}""").isFailure)
  }

  "DeleteWhiteboardAnnotationsEvtMsgBody" should "carry pageRefs" in {
    val refs = Map(pageId -> PageRef(presId, 3))
    JsonUtil.fromJson[DeleteWhiteboardAnnotationsEvtMsgBody](
      JsonUtil.toJson(DeleteWhiteboardAnnotationsEvtMsgBody(pageId, Array("shape:a"), refs))
    ) match {
      case Success(body) =>
        assert(body.annotationsIds.toList == List("shape:a"))
        assert(body.pageRefs == refs)
      case Failure(ex) => fail(ex)
    }
  }

  "PresentationPageForExport" should "carry the pageId next to the position" in {
    val stored = StoredAnnotations("job", presId, List(PresentationPageForExport(2, 1440, 1080, Array.empty, pageId)))
    JsonUtil.fromJson[StoredAnnotations](JsonUtil.toJson(stored)) match {
      case Success(s) =>
        assert(s.pages.map(p => (p.page, p.pageId)) == List((2, pageId)))
      case Failure(ex) => fail(ex)
    }
  }
}
