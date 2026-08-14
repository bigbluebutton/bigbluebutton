package org.bigbluebutton.core.apps

import java.io.File

import com.typesafe.config.{ Config, ConfigFactory }
import org.scalatest.flatspec.AnyFlatSpec

import scala.jdk.CollectionConverters._

// Exercises the server-side annotation type allowlist applied before annotations are stored
// and broadcast. The list is configurable via `whiteboard.allowedAnnotationTypes`, but both
// the check and the resolution of config into an effective set live in the WhiteboardModel
// companion object as plain functions, so they can be tested without instantiating the model
// (which pulls in SystemConfiguration / config loading).
//
// NOTE: extends AnyFlatSpec directly rather than the shared UnitSpec, which currently does not
// compile against the resolved ScalaTest 3.2.x (UnitSpec still imports the pre-3.2
// org.scalatest.FlatSpec / Matchers packages).
class WhiteboardModelSpec extends AnyFlatSpec {

  import WhiteboardModel.{
    DefaultAllowedAnnotationTypes,
    ForbiddenAnnotationTypes,
    effectiveAllowedTypes,
    hasSafeAnnotationUrl,
    isAllowedAnnotationType,
    readConfiguredTypes
  }

  private val defaultTypes = effectiveAllowedTypes(Set.empty)

  private def shapeInfo(shapeType: String): Map[String, Any] = Map("type" -> shapeType, "id" -> "shape:1")

  it should "reject the embed shape type" in {
    assert(!isAllowedAnnotationType(shapeInfo("embed"), defaultTypes))
  }

  it should "reject the bookmark and image shape types" in {
    assert(!isAllowedAnnotationType(shapeInfo("bookmark"), defaultTypes))
    assert(!isAllowedAnnotationType(shapeInfo("image"), defaultTypes))
  }

  it should "reject the video shape type and any unknown/future type" in {
    assert(!isAllowedAnnotationType(shapeInfo("video"), defaultTypes))
    assert(!isAllowedAnnotationType(shapeInfo("iframe"), defaultTypes))
    assert(!isAllowedAnnotationType(shapeInfo("some-future-embed"), defaultTypes))
  }

  it should "allow legitimate drawing shape types (plus group and the BBB poll shape)" in {
    List("draw", "geo", "arrow", "line", "text", "note", "highlight", "frame", "group", "poll").foreach { t =>
      assert(isAllowedAnnotationType(shapeInfo(t), defaultTypes), s"expected shape type '$t' to be allowed")
    }
  }

  it should "reject annotations whose type is absent or non-string" in {
    assert(!isAllowedAnnotationType(Map.empty[String, Any], defaultTypes))
    assert(!isAllowedAnnotationType(Map("type" -> 123), defaultTypes))
  }

  it should "block what the previous accept-any-type behaviour allowed through" in {
    // Before the fix the server stored and broadcast any annotation that merely carried a
    // "type" key. This pins that regression: the old rule would accept it, the allowlist
    // now rejects it.
    val vulnerableAcceptAnyType = (info: Map[String, Any]) => info.contains("type")
    assert(vulnerableAcceptAnyType(shapeInfo("embed")), "sanity: the old accept-any-type rule allowed embed")
    assert(!isAllowedAnnotationType(shapeInfo("embed"), defaultTypes), "the fix rejects embed")
  }

  behavior of "effectiveAllowedTypes"

  it should "fall back to the built-in default when nothing is configured" in {
    assert(effectiveAllowedTypes(Set.empty) == DefaultAllowedAnnotationTypes)
  }

  it should "keep the built-in default and the fixed exclusions disjoint" in {
    assert(DefaultAllowedAnnotationTypes.intersect(ForbiddenAnnotationTypes).isEmpty)
  }

  it should "honour a configured list, including types the default does not know about" in {
    val configured = Set("draw", "my-plugin-shape")
    val allowed = effectiveAllowedTypes(configured)

    assert(allowed == configured)
    assert(isAllowedAnnotationType(shapeInfo("my-plugin-shape"), allowed))
    // A configured list replaces the default rather than extending it.
    assert(!isAllowedAnnotationType(shapeInfo("note"), allowed))
  }

  it should "let a configured list narrow the default" in {
    val allowed = effectiveAllowedTypes(Set("draw"))

    assert(isAllowedAnnotationType(shapeInfo("draw"), allowed))
    assert(!isAllowedAnnotationType(shapeInfo("text"), allowed))
  }

  it should "drop the fixed exclusions no matter what is configured" in {
    val allowed = effectiveAllowedTypes(Set("draw") ++ ForbiddenAnnotationTypes)

    assert(allowed == Set("draw"))
    ForbiddenAnnotationTypes.foreach { t =>
      assert(!isAllowedAnnotationType(shapeInfo(t), allowed), s"expected shape type '$t' to stay rejected")
    }
  }

  it should "reject everything when the configured list resolves to nothing but exclusions" in {
    // Not a fallback case: the operator did configure something, it just leaves no usable type.
    assert(effectiveAllowedTypes(ForbiddenAnnotationTypes).isEmpty)
  }

  behavior of "hasSafeAnnotationUrl"

  private def geoWithUrl(url: Any): Map[String, Any] =
    Map("type" -> "geo", "id" -> "shape:1", "props" -> Map("geo" -> "rectangle", "url" -> url))

  it should "reject a javascript: url" in {
    assert(!hasSafeAnnotationUrl(geoWithUrl("javascript:alert(1)")))
  }

  it should "reject a javascript: url however it is disguised" in {
    // Browsers tolerate mixed case, leading whitespace/control characters, and whitespace
    // inside the scheme; the check normalises all of that away before testing the prefix.
    List(
      "JaVaScRiPt:alert(1)",
      "JAVASCRIPT:alert(1)",
      "  javascript:alert(1)",
      s"${0x01.toChar}javascript:alert(1)",
      "\tjavascript:alert(1)",
      "java\tscript:alert(1)",
      "java\nscript:alert(1)",
      "java\r\nscript:alert(1)",
      s"javascript${0x7f.toChar}:alert(1)"
    ).foreach { url =>
      assert(!hasSafeAnnotationUrl(geoWithUrl(url)), s"expected url '$url' to be rejected")
    }
  }

  it should "reject other non-http schemes and scheme-less urls" in {
    List(
      "data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==",
      "vbscript:msgbox(1)",
      "blob:https://example.com/1234",
      "file:///etc/passwd",
      "https:javascript:alert(1)", // scheme-looking prefix without the // separator
      "//evil.example.com", // protocol-relative
      "/relative/path",
      "example.com"
    ).foreach { url =>
      assert(!hasSafeAnnotationUrl(geoWithUrl(url)), s"expected url '$url' to be rejected")
    }
  }

  it should "allow http and https urls" in {
    List(
      "http://example.com",
      "https://example.com",
      "HTTPS://EXAMPLE.COM",
      "https://example.com/path?q=1#frag",
      "https://example.com/my file" // unencoded space: legitimate, must not fail closed
    ).foreach { url =>
      assert(hasSafeAnnotationUrl(geoWithUrl(url)), s"expected url '$url' to be allowed")
    }
  }

  it should "allow an empty or blank url, which is what an unlinked shape carries" in {
    assert(hasSafeAnnotationUrl(geoWithUrl("")))
    assert(hasSafeAnnotationUrl(geoWithUrl("   ")))
  }

  it should "reject a url that is present but not a string" in {
    assert(!hasSafeAnnotationUrl(geoWithUrl(123)))
    assert(!hasSafeAnnotationUrl(geoWithUrl(Map("toString" -> "javascript:alert(1)"))))
  }

  it should "accept shapes with no url to validate" in {
    assert(hasSafeAnnotationUrl(Map("type" -> "draw", "props" -> Map("size" -> "m"))))
    assert(hasSafeAnnotationUrl(Map("type" -> "draw")))
    assert(hasSafeAnnotationUrl(Map("type" -> "draw", "props" -> "not-a-map")))
  }

  it should "apply to note shapes too, not just geo" in {
    val note = Map("type" -> "note", "props" -> Map("url" -> "javascript:alert(1)"))
    assert(isAllowedAnnotationType(note, defaultTypes), "sanity: note is an allowed type")
    assert(!hasSafeAnnotationUrl(note))
  }

  it should "be the second half of the gate: an allowed type is not enough on its own" in {
    val hostileGeo = geoWithUrl("javascript:alert(1)")
    assert(isAllowedAnnotationType(hostileGeo, defaultTypes), "sanity: the type gate passes it")
    assert(!hasSafeAnnotationUrl(hostileGeo), "the url gate is what rejects it")
  }

  behavior of "readConfiguredTypes"

  private def conf(hocon: String): Config = ConfigFactory.parseString(hocon)

  it should "return nothing when the key is absent, so the default applies" in {
    assert(readConfiguredTypes(conf("whiteboard { }")) == Set.empty[String])
    assert(effectiveAllowedTypes(readConfiguredTypes(conf("whiteboard { }"))) == DefaultAllowedAnnotationTypes)
  }

  it should "read a well-formed list" in {
    assert(readConfiguredTypes(conf("""whiteboard { allowedAnnotationTypes = ["draw", "geo"] }""")) == Set("draw", "geo"))
  }

  it should "trim entries and drop blank ones" in {
    assert(readConfiguredTypes(conf("""whiteboard { allowedAnnotationTypes = [" draw ", "", "  "] }""")) == Set("draw"))
  }

  it should "fall back to the default for a value that is not a list" in {
    // Every one of these throws inside the config library. The point of the test is that the
    // fallback is reached deliberately (and logged) rather than by a swallowed exception.
    List(
      """whiteboard { allowedAnnotationTypes = "draw" }""",
      """whiteboard { allowedAnnotationTypes = "draw,geo" }""",
      """whiteboard { allowedAnnotationTypes = draw }""",
      """whiteboard { allowedAnnotationTypes = null }""",
      """whiteboard { allowedAnnotationTypes = { draw = true } }""",
      """whiteboard { allowedAnnotationTypes = [["draw"]] }"""
    ).foreach { hocon =>
      assert(readConfiguredTypes(conf(hocon)) == Set.empty[String], s"expected fallback for: $hocon")
    }
  }

  it should "treat an explicitly empty list as no configuration" in {
    assert(readConfiguredTypes(conf("whiteboard { allowedAnnotationTypes = [] }")) == Set.empty[String])
  }

  it should "coerce a list of numbers rather than throwing, as the config library does" in {
    // Pinning a footgun rather than endorsing it: [1, 2] parses, so it yields a real - and
    // useless - allowlist instead of falling back. The startup INFO line is what surfaces it.
    assert(readConfiguredTypes(conf("whiteboard { allowedAnnotationTypes = [1, 2] }")) == Set("1", "2"))
  }

  behavior of "the shipped default"

  it should "match the list in src/universal/conf/application.conf" in {
    // Guards the drift the trait's getOrElse fallbacks are prone to (see commit f14cf9ff69,
    // which existed only to repair exactly this).
    val confFile = new File("src/universal/conf/application.conf")
    assert(confFile.exists(), s"expected to find ${confFile.getPath} relative to the sbt project base dir")

    val shipped = ConfigFactory.parseFile(confFile).resolve()
      .getStringList("whiteboard.allowedAnnotationTypes").asScala.toSet

    assert(shipped == DefaultAllowedAnnotationTypes)
  }
}
