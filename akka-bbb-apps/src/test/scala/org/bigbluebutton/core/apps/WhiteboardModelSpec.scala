package org.bigbluebutton.core.apps

import org.scalatest.flatspec.AnyFlatSpec

// Exercises the server-side annotation type allowlist that blocks the stored
// XSS vector (embed/bookmark/image shapes) before annotations are stored and
// broadcast. The check lives in the WhiteboardModel companion object so it can
// be tested in isolation, without instantiating the model (which pulls in
// SystemConfiguration / config loading).
//
// NOTE: extends AnyFlatSpec directly rather than the shared UnitSpec, which
// currently does not compile against the resolved ScalaTest 3.2.x (UnitSpec
// still imports the pre-3.2 org.scalatest.FlatSpec / Matchers packages). This
// keeps the security fix decoupled from that pre-existing test-suite breakage.
class WhiteboardModelSpec extends AnyFlatSpec {

  import WhiteboardModel.isAllowedAnnotationType

  private def shapeInfo(shapeType: String): Map[String, Any] = Map("type" -> shapeType, "id" -> "shape:1")

  it should "reject the embed shape type (the stored XSS vector)" in {
    assert(!isAllowedAnnotationType(shapeInfo("embed")))
  }

  it should "reject the bookmark and image shape types (same class of rich-content sink)" in {
    assert(!isAllowedAnnotationType(shapeInfo("bookmark")))
    assert(!isAllowedAnnotationType(shapeInfo("image")))
  }

  it should "allow legitimate drawing shape types" in {
    List("draw", "geo", "arrow", "line", "text", "note", "highlight", "frame", "group").foreach { t =>
      assert(isAllowedAnnotationType(shapeInfo(t)), s"expected shape type '$t' to be allowed")
    }
  }

  it should "not reject annotations whose type is absent or non-string (left to the caller)" in {
    assert(isAllowedAnnotationType(Map.empty[String, Any]))
    assert(isAllowedAnnotationType(Map("type" -> 123)))
  }

  it should "block what the previous accept-any-type behaviour allowed through" in {
    // Before the fix the server stored and broadcast any annotation that
    // merely carried a "type" key, so a malicious "embed" shape passed
    // straight through. This pins that regression: the old rule would accept
    // it, the allowlist now rejects it.
    val vulnerableAcceptAnyType = (info: Map[String, Any]) => info.contains("type")
    assert(vulnerableAcceptAnyType(shapeInfo("embed")), "sanity: the old accept-any-type rule allowed embed")
    assert(!isAllowedAnnotationType(shapeInfo("embed")), "the fix rejects embed")
  }
}
