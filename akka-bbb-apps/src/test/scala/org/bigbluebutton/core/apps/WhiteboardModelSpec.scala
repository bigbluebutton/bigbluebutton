package org.bigbluebutton.core.apps

import java.io.File

import com.typesafe.config.ConfigFactory
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
    isAllowedAnnotationType
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
