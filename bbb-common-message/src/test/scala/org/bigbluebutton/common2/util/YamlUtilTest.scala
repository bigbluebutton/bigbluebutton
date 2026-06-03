package org.bigbluebutton.common2.util

import org.bigbluebutton.common2.UnitSpec2

import scala.util.Success

class YamlUtilTest extends UnitSpec2 {

  // A small stand-in for settings.yml acting as the schema/catalog.
  val base: Map[String, Object] = Map(
    "public" -> Map[String, Object](
      "app" -> Map[String, Object](
        "breakouts" -> Map[String, Object](
          "captureWhiteboardByDefault" -> Boolean.box(false),
          "recordRoomByDefault" -> Boolean.box(true)
        ),
        "preloadNextSlides" -> Int.box(2)
      ),
      "layout" -> Map[String, Object](
        "showScreenshareQuickSwapButton" -> Boolean.box(true)
      )
    )
  )

  "diffOverrideAgainstBase" should "report no issues for a valid nested override" in {
    val overrides = Map[String, Object](
      "public" -> Map[String, Object](
        "app" -> Map[String, Object](
          "breakouts" -> Map[String, Object](
            "recordRoomByDefault" -> Boolean.box(false)
          )
        )
      )
    )
    assert(YamlUtil.diffOverrideAgainstBase(base, overrides).isEmpty)
  }

  it should "flag a typo'd leaf key as unknown-key at the right path" in {
    val overrides = Map[String, Object](
      "public" -> Map[String, Object](
        "app" -> Map[String, Object](
          "breakouts" -> Map[String, Object](
            "captureWhitebordByDefault" -> Boolean.box(true) // typo
          )
        )
      )
    )
    val issues = YamlUtil.diffOverrideAgainstBase(base, overrides)
    assert(issues.size == 1)
    assert(issues.head.kind == "unknown-key")
    assert(issues.head.path == "public.app.breakouts.captureWhitebordByDefault")
  }

  it should "flag a typo'd nested section key as unknown-key" in {
    val overrides = Map[String, Object](
      "public" -> Map[String, Object](
        "ap" -> Map[String, Object]( // typo for "app"
          "preloadNextSlides" -> Int.box(0)
        )
      )
    )
    val issues = YamlUtil.diffOverrideAgainstBase(base, overrides)
    assert(issues.size == 1)
    assert(issues.head.kind == "unknown-key")
    assert(issues.head.path == "public.ap")
  }

  it should "flag a shape-mismatch when an object is given where base has a scalar" in {
    val overrides = Map[String, Object](
      "public" -> Map[String, Object](
        "app" -> Map[String, Object](
          "preloadNextSlides" -> Map[String, Object]("nested" -> Int.box(1))
        )
      )
    )
    val issues = YamlUtil.diffOverrideAgainstBase(base, overrides)
    assert(issues.size == 1)
    assert(issues.head.kind == "shape-mismatch")
    assert(issues.head.path == "public.app.preloadNextSlides")
  }

  it should "flag a shape-mismatch when a scalar is given where base has an object" in {
    val overrides = Map[String, Object](
      "public" -> Map[String, Object](
        "layout" -> "true" // base.public.layout is an object
      )
    )
    val issues = YamlUtil.diffOverrideAgainstBase(base, overrides)
    assert(issues.size == 1)
    assert(issues.head.kind == "shape-mismatch")
    assert(issues.head.path == "public.layout")
  }

  it should "flag a bool-vs-string type-mismatch at a leaf" in {
    val overrides = Map[String, Object](
      "public" -> Map[String, Object](
        "app" -> Map[String, Object](
          "breakouts" -> Map[String, Object](
            "recordRoomByDefault" -> "false" // string instead of boolean
          )
        )
      )
    )
    val issues = YamlUtil.diffOverrideAgainstBase(base, overrides)
    assert(issues.size == 1)
    assert(issues.head.kind == "type-mismatch")
    assert(issues.head.path == "public.app.breakouts.recordRoomByDefault")
  }

  it should "not flag Int-vs-Double (integer vs decimal literal, same Number type class)" in {
    // base has an integer literal (parses to Int); override writes the same setting as a decimal
    // literal (parses to Double). The two leaves are genuinely different concrete numeric types,
    // and coarse Number classification must not false-positive on that.
    val Success(yamlBase) = YamlUtil.toMap[Object]("public:\n  app:\n    preloadNextSlides: 2\n")
    val Success(jsonOverride) = JsonUtil.toMap[Object]("""{"public":{"app":{"preloadNextSlides":5.0}}}""")
    def leaf(m: Map[String, Object]): Object =
      m("public").asInstanceOf[Map[String, Object]]("app")
        .asInstanceOf[Map[String, Object]]("preloadNextSlides")
    assert(leaf(yamlBase).getClass != leaf(jsonOverride).getClass)
    assert(YamlUtil.diffOverrideAgainstBase(yamlBase, jsonOverride).isEmpty)
  }

  it should "ignore the public.plugins subtree" in {
    val overrides = Map[String, Object](
      "public" -> Map[String, Object](
        "plugins" -> List(
          Map[String, Object]("name" -> "my-plugin", "anyArbitraryKey" -> Boolean.box(true))
        )
      )
    )
    assert(YamlUtil.diffOverrideAgainstBase(base, overrides).isEmpty)
  }

  it should "report issues in a deterministic (sorted) order regardless of map order" in {
    val overrides = Map[String, Object](
      "zKey" -> Boolean.box(true),
      "aKey" -> Boolean.box(true),
      "mKey" -> Boolean.box(true)
    )
    val issues = YamlUtil.diffOverrideAgainstBase(base, overrides)
    assert(issues.map(_.path) == List("aKey", "mKey", "zKey"))
  }

  it should "flag every top-level key as unknown when the base catalog is empty" in {
    // documents why callers should guard against an empty catalog (e.g. settings.yml parse failure)
    val overrides = Map[String, Object](
      "public" -> Map[String, Object](),
      "private" -> Map[String, Object]()
    )
    val issues = YamlUtil.diffOverrideAgainstBase(Map.empty, overrides)
    assert(issues.map(_.path) == List("private", "public"))
    assert(issues.forall(_.kind == "unknown-key"))
  }

  it should "ignore a nested section under public.plugins" in {
    val overrides = Map[String, Object](
      "public" -> Map[String, Object](
        "plugins" -> Map[String, Object](
          "somePlugin" -> Map[String, Object]("anyArbitraryKey" -> Boolean.box(true))
        )
      )
    )
    assert(YamlUtil.diffOverrideAgainstBase(base, overrides).isEmpty)
  }

  it should "classify a null override leaf as a type-mismatch (no crash)" in {
    val overrides = Map[String, Object](
      "public" -> Map[String, Object](
        "app" -> Map[String, Object](
          "preloadNextSlides" -> null
        )
      )
    )
    val issues = YamlUtil.diffOverrideAgainstBase(base, overrides)
    assert(issues.size == 1)
    assert(issues.head.kind == "type-mismatch")
    assert(issues.head.detail.contains("Null"))
  }

  it should "flag a List override where the catalog has a scalar as a type-mismatch" in {
    val overrides = Map[String, Object](
      "public" -> Map[String, Object](
        "app" -> Map[String, Object](
          "preloadNextSlides" -> List(Int.box(1), Int.box(2))
        )
      )
    )
    val issues = YamlUtil.diffOverrideAgainstBase(base, overrides)
    assert(issues.size == 1)
    assert(issues.head.kind == "type-mismatch")
    assert(issues.head.detail == "expected Number, got List")
  }
}
