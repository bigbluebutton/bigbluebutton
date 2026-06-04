package org.bigbluebutton.api2.util

import org.bigbluebutton.common2.util.{ JsonUtil, YamlUtil }

import scala.jdk.CollectionConverters._
import scala.util.{ Failure, Success }

/**
 * Java-friendly bridge over `YamlUtil.diffOverrideAgainstBase` so bbb-web (Java/Grails) can validate
 * a client-settings override (the create-call JSON) against the `settings.yml` catalog using the same
 * logic as akka-apps - no duplicated rules.
 */
object ClientSettingsValidator {

  /**
   * Validates `overrideJson` against the `settings.yml` catalog `catalogYaml`. Returns a list of
   * human-readable issue messages; an empty list means the override is valid (or could not be
   * checked, e.g. the catalog failed to load - in which case we never block).
   */
  def validateOverride(catalogYaml: String, overrideJson: String): java.util.List[String] = {
    if (catalogYaml == null || overrideJson == null) return java.util.Collections.emptyList()

    val catalog = YamlUtil.toMap[Object](catalogYaml) match {
      case Success(value) => value
      case Failure(_)     => Map.empty[String, Object]
    }
    // No catalog -> don't block (mirrors the akka-apps empty-catalog guard).
    if (catalog.isEmpty) return java.util.Collections.emptyList()

    JsonUtil.toMap[Object](overrideJson) match {
      case Failure(ex) =>
        // Unparseable override JSON would otherwise be silently dropped by akka-apps; in strict
        // mode the caller must fail fast, so report it as an issue rather than an empty result.
        java.util.Collections.singletonList(s"invalid-json - override is not valid JSON: ${ex.getMessage}")
      case Success(overrides) =>
        YamlUtil
          .diffOverrideAgainstBase(catalog, overrides)
          .map(issue => s"${issue.kind} '${issue.path}' - ${issue.detail}")
          .asJava
    }
  }
}
