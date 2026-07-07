package org.bigbluebutton.core.apps

import org.scalatest.flatspec.AnyFlatSpec

// Exercises the server-side annotation allowlist that guards the single write
// path into pres_annotation (WhiteboardModel.addAnnotations). It blocks the
// stored-content vectors (embed/bookmark) and constrains the image shape used by
// the image-paste feature: image is only accepted when the meeting enabled it
// AND the shape references a valid same-origin upload within a size cap. The
// check lives in the WhiteboardModel companion object so it can be tested in
// isolation, without instantiating the model (which pulls in SystemConfiguration
// / config loading).
//
// NOTE: extends AnyFlatSpec directly rather than the shared UnitSpec, which
// currently does not compile against the resolved ScalaTest 3.2.x (UnitSpec
// still imports the pre-3.2 org.scalatest.FlatSpec / Matchers packages). This
// keeps the security check decoupled from that pre-existing test-suite breakage.
class WhiteboardModelSpec extends AnyFlatSpec {

  import WhiteboardModel.isAllowedAnnotation

  private val meetingId = "meeting-abc"

  private def shapeInfo(shapeType: String): Map[String, Any] = Map("type" -> shapeType, "id" -> "shape:1")

  private def imageInfo(src: String): Map[String, Any] =
    Map("type" -> "image", "id" -> "shape:1", "meta" -> Map("bbbImageSrc" -> src))

  private val validSrc = s"/bigbluebutton/fileUpload/$meetingId/0a1b2c3d-4e5f.png"

  it should "reject the embed shape type (the stored content vector) regardless of the flag" in {
    assert(!isAllowedAnnotation(shapeInfo("embed"), meetingId, imagePasteEnabled = true))
    assert(!isAllowedAnnotation(shapeInfo("embed"), meetingId, imagePasteEnabled = false))
  }

  it should "reject the bookmark shape type (same class of rich-content sink)" in {
    assert(!isAllowedAnnotation(shapeInfo("bookmark"), meetingId, imagePasteEnabled = true))
  }

  it should "allow legitimate drawing shape types" in {
    List("draw", "geo", "arrow", "line", "text", "note", "highlight", "frame", "group", "poll").foreach { t =>
      assert(isAllowedAnnotation(shapeInfo(t), meetingId, imagePasteEnabled = false), s"expected shape type '$t' to be allowed")
    }
  }

  it should "reject an image shape when the meeting has image paste disabled" in {
    assert(!isAllowedAnnotation(imageInfo(validSrc), meetingId, imagePasteEnabled = false))
  }

  it should "allow an image shape referencing a same-origin upload when the flag is on" in {
    assert(isAllowedAnnotation(imageInfo(validSrc), meetingId, imagePasteEnabled = true))
  }

  it should "reject an image shape with a data: URI source (base64 bloat / upload bypass)" in {
    assert(!isAllowedAnnotation(imageInfo("data:image/png;base64,AAAA"), meetingId, imagePasteEnabled = true))
  }

  it should "reject an image shape whose source points at another meeting" in {
    val foreignSrc = "/bigbluebutton/fileUpload/other-meeting/0a1b2c3d-4e5f.png"
    assert(!isAllowedAnnotation(imageInfo(foreignSrc), meetingId, imagePasteEnabled = true))
  }

  it should "reject an image shape with an external source (privacy / SSRF)" in {
    assert(!isAllowedAnnotation(imageInfo("https://tracker.example/pixel.png"), meetingId, imagePasteEnabled = true))
    assert(!isAllowedAnnotation(imageInfo("//tracker.example/pixel.png"), meetingId, imagePasteEnabled = true))
  }

  it should "reject an image shape with no src in meta" in {
    assert(!isAllowedAnnotation(Map("type" -> "image", "id" -> "shape:1"), meetingId, imagePasteEnabled = true))
  }

  it should "reject an image shape whose serialized annotation exceeds the size cap" in {
    val oversizedMeta = Map("bbbImageSrc" -> validSrc, "junk" -> ("x" * (WhiteboardModel.MaxImageAnnotationSizeBytes + 1)))
    val oversized = Map("type" -> "image", "id" -> "shape:1", "meta" -> oversizedMeta)
    assert(!isAllowedAnnotation(oversized, meetingId, imagePasteEnabled = true))
  }

  it should "not reject annotations whose type is absent or non-string (left to the caller)" in {
    assert(isAllowedAnnotation(Map.empty[String, Any], meetingId, imagePasteEnabled = false))
    assert(isAllowedAnnotation(Map("type" -> 123), meetingId, imagePasteEnabled = false))
  }
}
