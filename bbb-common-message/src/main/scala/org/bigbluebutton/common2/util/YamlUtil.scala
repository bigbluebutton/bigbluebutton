package org.bigbluebutton.common2.util

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.dataformat.yaml.YAMLFactory
import com.fasterxml.jackson.module.scala.{ DefaultScalaModule, ScalaObjectMapper }

import scala.util.Try

case class ConfigOverrideIssue(path: String, kind: String, detail: String)

object YamlUtil {
  val mapper = new ObjectMapper(new YAMLFactory()) with ScalaObjectMapper
  mapper.registerModule(DefaultScalaModule)

  // Coarse type classification so equivalent numeric values compare as equal regardless of how
  // they were written: an integer literal deserializes to Int/Long while a decimal literal
  // deserializes to Double, but both are reported as "Number" so we don't false-positive on them.
  private def typeClass(value: Object): String = value match {
    case null                 => "Null"
    case _: Map[_, _]         => "Map"
    case _: Seq[_]            => "List"
    case _: java.lang.Boolean => "Boolean"
    case _: Number            => "Number"
    case _: String            => "String"
    case _                    => "Other"
  }

  /**
   * Walks `overrides` against `base`, treating `base` (the catalog from settings.yml) as the
   * schema, and reports keys/shapes in the override that don't line up: unknown keys (likely
   * typos), and shape/type mismatches. Behavior is purely diagnostic - the caller decides how to
   * surface the returned issues. `ignoredPrefixes` skips dynamic subtrees (e.g. "public.plugins",
   * whose contents are plugin-defined and not present in settings.yml).
   */
  def diffOverrideAgainstBase(
      base:            Map[String, Object],
      overrides:       Map[String, Object],
      pathPrefix:      String              = "",
      ignoredPrefixes: Set[String]         = Set("public.plugins")
  ): List[ConfigOverrideIssue] = {
    // Sort keys at each level so the reported issues (and the WARN log lines) are deterministic,
    // independent of Map iteration order.
    overrides.toList.sortBy(_._1).flatMap {
      case (key, overrideValue) =>
        val path = if (pathPrefix.isEmpty) key else s"$pathPrefix.$key"
        if (ignoredPrefixes.exists(p => path == p || path.startsWith(p + "."))) {
          List.empty
        } else {
          base.get(key) match {
            case None =>
              List(ConfigOverrideIssue(path, "unknown-key", "not present in settings.yml (possible typo)"))
            case Some(null) =>
              // A null default in settings.yml (e.g. customStyleUrl, overrideLocale) means "no
              // declared type / admin-supplied", so any override value is acceptable.
              List.empty
            case Some(baseValue) =>
              (baseValue, overrideValue) match {
                case (baseMap: Map[String, Object] @unchecked, overrideMap: Map[String, Object] @unchecked) =>
                  diffOverrideAgainstBase(baseMap, overrideMap, path, ignoredPrefixes)
                case (_: Map[_, _], _) =>
                  List(ConfigOverrideIssue(path, "shape-mismatch", "expected an object/section, got a value"))
                case (_, _: Map[_, _]) =>
                  List(ConfigOverrideIssue(path, "shape-mismatch", "expected a value, got an object/section"))
                case (b, o) =>
                  val (bt, ot) = (typeClass(b), typeClass(o))
                  if (bt != ot)
                    List(ConfigOverrideIssue(path, "type-mismatch", s"expected $bt, got $ot"))
                  else
                    List.empty
              }
          }
        }
    }
  }

  def mergeImmutableMaps(target: Map[String, Object], source: Map[String, Object]): Map[String, Object] = {
    source.foldLeft(target) {
      case (acc, (key, sourceValue)) if acc.contains(key) =>
        val targetValue = acc(key)
        val mergedValue = (targetValue, sourceValue) match {
          case (targetMap: Map[String, Object], sourceMap: Map[String, Object]) =>
            // If both source and target values are maps, recursively merge them.
            mergeImmutableMaps(targetMap, sourceMap)
          case _ =>
            // If not, replace the target value with the source value.
            sourceValue
        }
        acc.updated(key, mergedValue)
      case (acc, (key, sourceValue)) =>
        // If the key is not in the target map, add it.
        acc + (key -> sourceValue)
    }
  }

  def toMap[V](yaml: String)(implicit m: Manifest[V]): Try[Map[String, V]] = fromYaml[Map[String, V]](yaml)

  def fromYaml[T](yaml: String)(implicit m: Manifest[T]): Try[T] = {
    for {
      result <- Try(mapper.readValue[T](yaml))
    } yield result
  }
}
